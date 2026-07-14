import "server-only";
import { sendEmail } from "./send";
import { SITE_URL } from "@/lib/site";
import { OrderConfirmationEmail } from "./templates/OrderConfirmationEmail";
import { AdminOrderNotificationEmail } from "./templates/AdminOrderNotificationEmail";
import { PaymentConfirmedEmail } from "./templates/PaymentConfirmedEmail";
import { NewsletterWelcomeEmail } from "./templates/NewsletterWelcomeEmail";
import type { OrderEmailData } from "./types";

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
      react: OrderConfirmationEmail({ order }),
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

export async function sendPaymentConfirmedEmail(input: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  total: number;
}): Promise<void> {
  await sendEmail({
    to: input.customerEmail,
    subject: `Plata pentru comanda ${input.orderNumber} a fost confirmată`,
    react: PaymentConfirmedEmail({
      customerName: input.customerName,
      orderNumber: input.orderNumber,
      total: input.total,
    }),
  });
}

export async function sendNewsletterWelcomeEmail(email: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Bine ai venit în comunitatea Dostore Carti",
    react: NewsletterWelcomeEmail({ siteUrl: SITE_URL }),
  });
}
