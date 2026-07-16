"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createDirectPayment } from "@/lib/payments/maib";
import { sendNewOrderEmails } from "@/lib/email/notifications";
import { tgNewOrder } from "@/lib/telegram";
import { cartItemPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/store/cart";
import type { CartItem } from "@/lib/store/cart";

export type CheckoutFieldErrors = Partial<
  Record<"customerName" | "email" | "phone" | "shippingAddress" | "city", string>
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

  const errors: CheckoutFieldErrors = {};
  if (customerName.length < 3) errors.customerName = "Introdu numele complet.";
  if (!EMAIL_REGEX.test(email)) errors.email = "Introdu o adresă de email validă.";
  if (!PHONE_REGEX.test(phone)) errors.phone = "Introdu un număr de telefon valid.";
  if (shippingAddress.length < 5) errors.shippingAddress = "Introdu adresa completă de livrare.";
  if (city.length < 2) errors.city = "Introdu orașul.";

  return { values: { customerName, email, phone, shippingAddress, city }, errors };
}

async function resolveOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol =
    headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

async function resolveClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? "127.0.0.1";
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

  const { customerName, email, phone, shippingAddress, city } = values;

  const subtotal = items.reduce((sum, item) => sum + cartItemPrice(item) * item.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress,
      city,
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

  // Scădem stocul cărților cumpărate (logica de inventar). Clamp la 0 ca să nu
  // ajungă negativ, apoi revalidăm arborele public ca numărul afișat pe homepage,
  // catalog și pagina cărții să reflecte imediat noul stoc.
  await Promise.all(
    items.map(async (item) => {
      const book = await prisma.book.findUnique({
        where: { id: item.id },
        select: { stock: true },
      });
      if (!book) return;
      const newStock = Math.max(0, book.stock - item.quantity);
      await prisma.book.update({ where: { id: item.id }, data: { stock: newStock } });
    })
  );
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

  const [origin, clientIp] = await Promise.all([resolveOrigin(), resolveClientIp()]);

  let payment;
  try {
    payment = await createDirectPayment({
      amount: total,
      currency: "MDL",
      clientIp,
      description: `Comandă Dostore Carti ${orderNumber}`,
      orderId: orderNumber,
      clientName: customerName,
      email,
      phone,
      delivery: shippingCost,
      items: items.map((item) => ({
        id: item.id,
        name: item.title,
        price: cartItemPrice(item),
        quantity: item.quantity,
      })),
      callbackUrl: `${origin}/api/payments/maib/callback`,
      okUrl: `${origin}/checkout/succes?order=${orderNumber}`,
      failUrl: `${origin}/checkout/esuat?order=${orderNumber}`,
    });
  } catch (error) {
    console.error("[checkout] inițierea plății maib a eșuat:", error);
    return {
      status: "error",
      message: `Comanda ta (nr. ${orderNumber}) a fost înregistrată, dar nu am putut porni plata online. Te rugăm să ne contactezi sau încearcă din nou.`,
    };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentId: payment.payId },
  });

  redirect(payment.payUrl);
}
