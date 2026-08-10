"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendNewOrderEmails } from "@/lib/email/notifications";
import { tgNewOrder } from "@/lib/telegram";
import { cartItemPrice, getShippingCost, getCodFee } from "@/lib/store/cart";
import { getShippingPrice, resolveCityAndCounty } from "@/lib/shipping/fan";
import { createAwbForOrder } from "@/lib/shipping/create-awb";
import { runAfterResponse } from "@/lib/after-response";
import { calculateParcelWeightKg } from "@/lib/shipping/weight";
import { createQrPayment } from "@/lib/payments/victoriabank";
import type { CartItem } from "@/lib/store/cart";

export type CheckoutFieldErrors = Partial<
  Record<
    | "customerName"
    | "email"
    | "phone"
    | "shippingAddress"
    | "building"
    | "apartment"
    | "city"
    | "terms",
    string
  >
>;

export type CheckoutState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: CheckoutFieldErrors;
  values?: Record<string, string>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s()-]{6,20}$/;

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BS-${datePart}-${randomPart}`;
}

function validate(formData: FormData): { values: Record<string, string>; errors: CheckoutFieldErrors } {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const shippingAddress = String(formData.get("shippingAddress") ?? "").trim();
  // Detalii de acces + mesajul pentru curier. Opționale, dar tăiate la o lungime
  // rezonabilă: ajung pe AWB, unde câmpurile nu sunt nelimitate.
  const building = String(formData.get("building") ?? "").trim().slice(0, 60);
  const apartment = String(formData.get("apartment") ?? "").trim().slice(0, 30);
  const customerNote = String(formData.get("customerNote") ?? "").trim().slice(0, 300);
  const city = String(formData.get("city") ?? "").trim();
  // Raionul vine din autocomplete-ul de localități (lista FAN), nu de la client.
  // Poate lipsi dacă a scris orașul de mână — nu blocăm comanda pentru asta,
  // dar AWB-ul va cere completarea lui din admin.
  const county = String(formData.get("county") ?? "").trim();
  // Metoda de plată aleasă (validată la scriere).
  const paymentMethodRaw = String(formData.get("paymentMethod") ?? "ONLINE").trim();
  const paymentMethod = (["ONLINE", "CARD_ON_DELIVERY", "CASH_ON_DELIVERY"].includes(
    paymentMethodRaw
  )
    ? paymentMethodRaw
    : "ONLINE") as "ONLINE" | "CARD_ON_DELIVERY" | "CASH_ON_DELIVERY";

  // Acordul cu termenii, confidențialitatea și cookie-urile — obligatoriu.
  // Validat pe SERVER, nu doar din browser: un client care ocolește formularul
  // nu trebuie să poată plasa comandă fără consimțământ.
  const termsAccepted = formData.get("terms") === "on";

  const errors: CheckoutFieldErrors = {};
  if (!termsAccepted) {
    errors.terms =
      "Trebuie să accepți termenii, politica de confidențialitate și cookie-urile ca să poți plasa comanda.";
  }
  if (customerName.length < 3) errors.customerName = "Introdu numele complet.";
  if (!EMAIL_REGEX.test(email)) errors.email = "Introdu o adresă de email validă.";
  if (!PHONE_REGEX.test(phone)) errors.phone = "Introdu un număr de telefon valid.";
  if (shippingAddress.length < 5) errors.shippingAddress = "Introdu adresa completă de livrare.";
  if (city.length < 2) errors.city = "Alege localitatea din listă.";

  return {
    values: {
      customerName,
      email,
      phone,
      shippingAddress,
      building,
      apartment,
      customerNote,
      city,
      county,
      paymentMethod,
      terms: termsAccepted ? "on" : "",
    },
    errors,
  };
}

/**
 * Costul FAN estimat pentru coșul curent. Greutățile vin din DB (nu din coșul
 * client-side). Orice eșec întoarce null — nu stricăm comanda pentru o cifră
 * informativă.
 */
async function estimateFanCost(
  items: CartItem[],
  city: string,
  county: string,
  codAmount: number
): Promise<number | null> {
  try {
    const books = await prisma.book.findMany({
      where: { id: { in: items.map((item) => item.id) } },
      select: { id: true, weightGrams: true },
    });
    const weightById = new Map(books.map((book) => [book.id, book.weightGrams]));

    const weightKg = calculateParcelWeightKg(
      items.map((item) => ({
        quantity: item.quantity,
        weightGrams: weightById.get(item.id) ?? null,
      }))
    );

    const price = await getShippingPrice({ toCity: city, toCounty: county, weightKg, codAmount });
    return price?.price ?? null;
  } catch (error) {
    console.error("[checkout] estimarea costului FAN a eșuat:", error);
    return null;
  }
}

export async function createOrderAndPay(
  items: CartItem[],
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  if (!items || items.length === 0) {
    return { status: "error", message: "Coșul tău este gol." };
  }

  const { values, errors } = validate(formData);

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Verifică datele introduse.", fieldErrors: errors, values };
  }

  const { customerName, email, phone, shippingAddress, building, apartment, customerNote } =
    values;
  let { city, county } = values;

  // Raionul e OBLIGATORIU la generarea AWB-ului. Vine din autocomplete-ul de
  // localități, dar clientul poate scrie orașul de mână (sau completa cu
  // autofill-ul browserului) și atunci rămâne gol — iar comanda ajunge în admin
  // imposibil de expediat. Îl deducem aici, pe server, din lista FAN; tot atunci
  // normalizăm și numele localității la forma pe care o știe FAN („Chisinau").
  if (!county) {
    const resolved = await resolveCityAndCounty(city);
    if (resolved) {
      city = resolved.city;
      county = resolved.county;
    } else {
      // Nici măcar nu putem deduce raionul: comanda ar rămâne nelivrabilă, deci
      // o oprim aici și cerem clientului să aleagă localitatea din listă.
      return {
        status: "error",
        message: "Alege localitatea din lista de sugestii.",
        fieldErrors: {
          city: "Apasă pe localitatea ta în lista care apare sub câmp — de acolo luăm raionul, obligatoriu pentru curier.",
        },
        values,
      };
    }
  }
  const paymentMethod = values.paymentMethod as
    | "ONLINE"
    | "CARD_ON_DELIVERY"
    | "CASH_ON_DELIVERY";

  const subtotal = items.reduce((sum, item) => sum + cartItemPrice(item) * item.quantity, 0);
  // Ce plătește clientul, recalculat pe SERVER (nu ne bazăm pe ce a afișat
  // browserul): transport după localitate + taxă de ramburs dacă plătește la
  // livrare. Fără prag de livrare gratuită. Costul real către FAN se
  // calculează separat mai jos și se salvează doar informativ.
  const shippingCost = getShippingCost(city) + getCodFee(paymentMethod);
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress,
      building: building || null,
      apartment: apartment || null,
      customerNote: customerNote || null,
      city,
      county: county || null,
      paymentMethod,
      // Dovada consimțământului, cu momentul exact.
      termsAcceptedAt: new Date(),
      subtotal,
      shippingCost,
      total,
      // Termen estimat: 3 zile lucrătoare (aproximat simplu cu zile calendaristice).
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      statusHistory: [{ status: "PENDING", at: new Date() }],
      items: {
        create: items.map((item) => ({
          bookId: item.id,
          title: item.title,
          price: cartItemPrice(item),
          quantity: item.quantity,
        })),
      },
    },
  });

  revalidatePath("/", "layout");

  // Comanda e salvată — de aici încolo nimic nu mai trebuie așteptat de client.
  // Emailurile (SMTP, secunde bune), Telegram și estimarea tarifului FAN pleacă
  // „după răspuns" (`waitUntil`), deci pagina de confirmare apare imediat.
  // Singura excepție e AWB-ul la plata la livrare: rămâne așteptat, ca să fim
  // siguri că expediția chiar a intrat în contul FAN înainte de a-i spune
  // clientului că e gata.
  runAfterResponse(
    Promise.allSettled([
      sendNewOrderEmails(
        {
          orderNumber,
          customerName,
          customerEmail: email,
          customerPhone: phone,
          shippingAddress,
          building,
          apartment,
          customerNote,
          city,
          items: items.map((item) => ({
            title: item.title,
            price: cartItemPrice(item),
            quantity: item.quantity,
          })),
          subtotal,
          shippingCost,
          total,
          paymentMethod,
        },
        order.id
      ),
      tgNewOrder({
        orderNumber,
        customerName,
        customerPhone: phone,
        customerEmail: email,
        shippingAddress,
        building,
        apartment,
        customerNote,
        city,
        total,
        items: items.map((item) => ({ title: item.title, quantity: item.quantity })),
      }),
      // Cât ne costă PE NOI expedierea (tariful din contractul FAN). E doar
      // informativ, pentru marja văzută în admin, deci se salvează după fapt.
      estimateFanCost(items, city, county, total).then((fanCost) =>
        fanCost === null
          ? null
          : prisma.order.update({ where: { id: order.id }, data: { fanCost } })
      ),
    ])
  );

  // Expediția FAN, pentru comenzile cu plata la livrare: sunt finale în momentul
  // plasării, deci AWB-ul se creează acum și comanda apare imediat în contul
  // FAN. Comenzile online își primesc AWB-ul abia după ce banca confirmă plata
  // (lib/payments/confirm.ts) — până atunci pot fi abandonate.
  // Nu strică nimic dacă eșuează: `createAwbForOrder` nu aruncă, iar AWB-ul se
  // poate genera oricând din admin.
  // Plata la livrare (card sau numerar): comanda e gata, mergem direct la succes.
  if (paymentMethod !== "ONLINE") {
    await createAwbForOrder(order.id);
    redirect(`/checkout/succes?order=${orderNumber}`);
  }

  // Plată online prin VictoriaBank (MIA). Fără credențiale, `createQrPayment`
  // întoarce `skipped` și comanda merge pe ramburs (pagina de succes). Cu
  // credențiale, generăm QR-ul și trimitem clientul la pagina de plată.
  let qr: Awaited<ReturnType<typeof createQrPayment>> | null = null;
  try {
    qr = await createQrPayment({ orderNumber, amount: total });
  } catch (error) {
    // QR-ul a picat la inițiere: comanda e deja salvată, deci nu o pierdem —
    // o lăsăm pe ramburs în loc să blocăm clientul.
    console.error("[checkout] inițierea plății VictoriaBank a eșuat:", error);
  }

  if (qr && !qr.skipped && qr.qrHeaderUUID) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        qrHeaderUUID: qr.qrHeaderUUID,
        qrExtensionUUID: qr.qrExtensionUUID,
        qrPayUrl: qr.payUrl,
      },
    });
    redirect(`/checkout/plata?order=${orderNumber}`);
  }

  redirect(`/checkout/succes?order=${orderNumber}`);
}
