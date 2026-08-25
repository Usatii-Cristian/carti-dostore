import "server-only";
import { sendEmail } from "./send";
import { SITE_URL } from "@/lib/site";
import { AdminOrderNotificationEmail } from "./templates/AdminOrderNotificationEmail";
import type { OrderEmailData } from "./types";

/**
 * Emailul de „comandă nouă" către magazin. Stă separat de restul emailurilor
 * (`lib/email/notifications.ts`) din două motive:
 *
 * - e o notificare care TREBUIE să ajungă, deci trece prin outbox
 *   (`lib/notifications/outbox.ts`) și se reîncearcă la eșec — de aceea
 *   întoarce rezultatul în loc să-l înghită;
 * - outbox-ul îl importă direct, iar `notifications.ts` aduce cu el PDFKit și
 *   toate template-urile; separarea ține coada ușoară.
 */

/**
 * Destinatarul notificărilor de comandă. Ultimul refugiu e cutia poștală a
 * magazinului (contul SMTP): mai bine ajunge acolo decât nicăieri, dacă
 * `EMAIL_ADMIN` lipsește sau e o adresă uitată de la instalare.
 */
export function adminRecipient(): string | undefined {
  return process.env.EMAIL_ADMIN ?? process.env.ADMIN_EMAIL ?? process.env.SMTP_USER;
}

export async function sendAdminOrderEmail(
  order: OrderEmailData,
  orderId: string
): Promise<{ ok: boolean; error?: string }> {
  const to = adminRecipient();
  if (!to) return { ok: true }; // nimic configurat: no-op, ca peste tot

  const result = await sendEmail({
    to,
    subject: `Comandă nouă ${order.orderNumber} — ${order.total} lei`,
    react: AdminOrderNotificationEmail({
      order,
      adminUrl: `${SITE_URL}/admin/comenzi/${orderId}`,
    }),
    replyTo: order.customerEmail,
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error ?? "trimitere eșuată" };
}
