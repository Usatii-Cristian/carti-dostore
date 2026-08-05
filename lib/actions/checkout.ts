"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendNewOrderEmails } from "@/lib/email/notifications";
import { tgNewOrder } from "@/lib/telegram";
import { cartItemPrice, getShippingCost, getCodFee } from "@/lib/store/cart";
import { getShippingPrice, resolveCityAndCounty } from "@/lib/shipping/fan";
import { calculateParcelWeightKg } from "@/lib/shipping/weight";
import { createQrPayment } from "@/lib/payments/victoriabank";
import type { CartItem } from "@/lib/store/cart";

export type CheckoutFieldErrors = Partial<
  Record<"customerName" | "email" | "phone" | "shippingAddress" | "city" | "terms", string>
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
    values: { customerName, email, phone, shippingAddress, city, county, paymentMethod, terms: termsAccepted ? "on" : "" },
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

  const { customerName, email, phone, shippingAddress } = values;
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

  // Cât ne costă pe noi expedierea, după tariful FAN. Greutățile le citim din
  // DB, nu din coșul din localStorage — clientul nu trebuie să poată influența
  // un input de tarifare. Nu blochează comanda: `getShippingPrice` întoarce
  // null dacă FAN nu răspunde sau nu e configurat.
  const fanCost = county ? await estimateFanCost(items, city, county, total) : null;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress,
      city,
      county: county || null,
      paymentMethod,
      // Dovada consimțământului, cu momentul exact.
      termsAcceptedAt: new Date(),
      fanCost,
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

  // Confirmare către client + notificare către admin (email + Telegram). Nimic
  // din astea nu blochează și nu poate strica fluxul de plată.
  await Promise.allSettled([
    sendNewOrderEmails(
      {
        orderNumber,
        customerName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress,
        city,
        items: items.map((item) => ({
          title: item.title,
          price: cartItemPrice(item),
          quantity: item.quantity,
        })),
        subtotal,
        shippingCost,
        total,
      },
      order.id
    ),
    tgNewOrder({
      orderNumber,
      customerName,
      customerPhone: phone,
      customerEmail: email,
      shippingAddress,
      city,
      total,
      items: items.map((item) => ({ title: item.title, quantity: item.quantity })),
    }),
  ]);

  // Plata la livrare (card sau numerar): comanda e gata, mergem direct la succes.
  if (paymentMethod !== "ONLINE") {
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
