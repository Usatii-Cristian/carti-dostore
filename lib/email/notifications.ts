import "server-only";
import { sendEmail } from "./send";
import { SITE_URL } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import { OrderConfirmationEmail } from "./templates/OrderConfirmationEmail";
import {
  PaymentReceiptEmail,
  type PaymentReceiptData,
} from "./templates/PaymentReceiptEmail";
import { NewsletterWelcomeEmail } from "./templates/NewsletterWelcomeEmail";
import { OrderStatusUpdateEmail } from "./templates/OrderStatusUpdateEmail";
import { NewBookAnnouncementEmail } from "./templates/NewBookAnnouncementEmail";
import { buildReceiptPdf } from "./pdf/receipt-pdf";
import { STATUS_EMAIL } from "@/lib/orders/status";
import type { OrderStatus } from "@prisma/client";
import type { OrderEmailData } from "./types";

function trackingUrl(orderNumber: string): string {
  return `${SITE_URL}/comanda/${encodeURIComponent(orderNumber)}`;
}

// Toate funcțiile de mai jos sunt „fire-and-log": nu aruncă niciodată, ca un
// email eșuat să nu strice comanda / plata / abonarea. `sendEmail` însuși
// prinde erorile, dar folosim și allSettled pentru trimiterile multiple.

/**
 * Confirmarea trimisă CLIENTULUI la plasarea comenzii.
 *
 * Notificarea către magazin NU mai pleacă de aici: e o notificare care trebuie
 * să ajungă, deci trece prin outbox (`lib/notifications/outbox.ts`, canalul
 * `admin-email`), care o reîncearcă dacă SMTP-ul e picat.
 */
export async function sendCustomerOrderEmail(order: OrderEmailData): Promise<void> {
  await sendEmail({
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
  });
}

/**
 * Bonul electronic trimis după confirmarea plății. A înlocuit vechiul email de
 * confirmare, care spunea doar că banii au intrat: BNM cere ca după plată
 * clientul să primească pe email dovada cumpărăturii — ce a cumpărat, cât a
 * plătit, prin ce metodă și cu ce referință de tranzacție.
 */
export async function sendPaymentReceiptEmail(receipt: PaymentReceiptData): Promise<void> {
  // PDF-ul e un plus, nu o condiție: dacă generarea eșuează, emailul pleacă tot,
  // fiindcă el e dovada cerută. Nu rămâne clientul fără nimic pentru un atașament.
  let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined;
  try {
    const pdf = await buildReceiptPdf(receipt);
    attachments = [
      {
        filename: `Bon-${receipt.orderNumber}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ];
  } catch (error) {
    console.error("[email] generarea bonului PDF a eșuat:", error);
  }

  await sendEmail({
    to: receipt.customerEmail,
    subject: `Bon electronic — comanda ${receipt.orderNumber} (${receipt.total.toFixed(2)} lei)`,
    react: PaymentReceiptEmail({ receipt }),
    attachments,
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
