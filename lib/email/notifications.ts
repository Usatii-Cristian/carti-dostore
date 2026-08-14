import "server-only";
import { sendEmail } from "./send";
import { SITE_URL } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import { OrderConfirmationEmail } from "./templates/OrderConfirmationEmail";
import { AdminOrderNotificationEmail } from "./templates/AdminOrderNotificationEmail";
import {
  PaymentReceiptEmail,
  type PaymentReceiptData,
} from "./templates/PaymentReceiptEmail";
import { NewsletterWelcomeEmail } from "./templates/NewsletterWelcomeEmail";
import { OrderStatusUpdateEmail } from "./templates/OrderStatusUpdateEmail";
import { NewBookAnnouncementEmail } from "./templates/NewBookAnnouncementEmail";
import { STATUS_EMAIL } from "@/lib/orders/status";
import type { OrderStatus } from "@prisma/client";
import type { OrderEmailData } from "./types";

function trackingUrl(orderNumber: string): string {
  return `${SITE_URL}/comanda/${encodeURIComponent(orderNumber)}`;
}

const ADMIN_RECIPIENT = process.env.EMAIL_ADMIN ?? process.env.ADMIN_EMAIL;

// Toate funcțiile de mai jos sunt „fire-and-log": nu aruncă niciodată, ca un
// email eșuat să nu strice comanda / plata / abonarea. `sendEmail` însuși
// prinde erorile, dar folosim și allSettled pentru trimiterile multiple.

export async function sendNewOrderEmails(
  order: OrderEmailData,
  orderId: string
): Promise<void> {
  const tasks: Promise<unknown>[] = [
    sendEmail({
      to: order.customerEmail,
      subject: `Am primit comanda ta ${order.orderNumber}`,
      react: OrderConfirmationEmail({
        order,
        trackingUrl: trackingUrl(order.orderNumber),
        paymentUrl:
          order.paymentMethod === "ONLINE"
            ? `${SITE_URL}/checkout/plata?order=${encodeURIComponent(order.orderNumber)}`
            : undefined,
      }),
    }),
  ];

  if (ADMIN_RECIPIENT) {
    tasks.push(
      sendEmail({
        to: ADMIN_RECIPIENT,
        subject: `Comandă nouă ${order.orderNumber} — ${order.total} lei`,
        react: AdminOrderNotificationEmail({
          order,
          adminUrl: `${SITE_URL}/admin/comenzi/${orderId}`,
        }),
        replyTo: order.customerEmail,
      })
    );
  }

  await Promise.allSettled(tasks);
}

/**
 * Bonul electronic trimis după confirmarea plății. A înlocuit vechiul email de
 * confirmare, care spunea doar că banii au intrat: BNM cere ca după plată
 * clientul să primească pe email dovada cumpărăturii — ce a cumpărat, cât a
 * plătit, prin ce metodă și cu ce referință de tranzacție.
 */
export async function sendPaymentReceiptEmail(receipt: PaymentReceiptData): Promise<void> {
  await sendEmail({
    to: receipt.customerEmail,
    subject: `Bon electronic — comanda ${receipt.orderNumber} (${receipt.total.toFixed(2)} lei)`,
    react: PaymentReceiptEmail({ receipt }),
  });
}

export async function sendOrderStatusEmail(input: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  status: OrderStatus;
  trackingNumber?: string | null;
}): Promise<void> {
  const copy = STATUS_EMAIL[input.status];
  if (!copy) return; // status fără notificare (ex. PENDING, CANCELLED)
  await sendEmail({
    to: input.customerEmail,
    subject: copy.subject(input.orderNumber),
    react: OrderStatusUpdateEmail({
      customerName: input.customerName,
      orderNumber: input.orderNumber,
      status: input.status,
      trackingUrl: trackingUrl(input.orderNumber),
      trackingNumber: input.trackingNumber,
    }),
  });
}

// Anunț către toți abonații newsletter când apare o carte nouă. Trimitem
// individual (nu expunem adresele între abonați) și nu blocăm dacă eșuează.
export async function sendNewBookAnnouncement(book: {
  title: string;
  author: string;
  slug: string;
  coverImage: string;
  price: number;
  discountPrice: number | null;
}): Promise<void> {
  const subscribers = await prisma.newsletterSubscriber.findMany({ select: { email: true } });
  if (subscribers.length === 0) return;

  const url = `${SITE_URL}/carti/${book.slug}`;
  await Promise.allSettled(
    subscribers.map((subscriber) =>
      sendEmail({
        to: subscriber.email,
        subject: `Carte nouă la Dostore Carti: ${book.title}`,
        react: NewBookAnnouncementEmail({
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          price: book.price,
          discountPrice: book.discountPrice,
          url,
        }),
      })
    )
  );
}

export async function sendNewsletterWelcomeEmail(email: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Bine ai venit în comunitatea Dostore Carti",
    react: NewsletterWelcomeEmail({ siteUrl: SITE_URL }),
  });
}
