import "server-only";
import { prisma } from "@/lib/prisma";
import { getQrStatus } from "@/lib/payments/victoriabank";
import { sendPaymentReceiptEmail } from "@/lib/email/notifications";
import { tgPaymentConfirmed } from "@/lib/telegram";
import { createAwbForOrder } from "@/lib/shipping/create-awb";
import { runAfterResponse } from "@/lib/after-response";

/**
 * Confirmă plata unei comenzi întrebând BANCA (status autentificat), nu
 * bazându-ne pe input din exterior. Idempotent: emailul + Telegram pleacă o
 * singură dată. Folosit atât de pagina de plată (polling), cât și de webhook-ul
 * de semnal — ambele doar „declanșează verificarea", sursa de adevăr e banca.
 *
 * Întoarce statusul final pentru UI: "paid" | "pending" | "failed".
 */
export async function confirmOrderPayment(
  orderNumber: string
): Promise<"paid" | "pending" | "failed"> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order || !order.qrHeaderUUID) return "failed";

  if (order.paymentStatus === "PAID") return "paid";

  const result = await getQrStatus(order.qrHeaderUUID);
  if (!result) return "pending";

  if (result.status === "Paid") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: order.status === "PENDING" ? "CONFIRMED" : order.status,
        paymentId: result.paymentReference ?? order.paymentId,
      },
    });

    // Notificările nu trebuie așteptate: pagina de plată doar întreabă „e gata?",
    // iar SMTP-ul poate dura secunde bune.
    runAfterResponse(
      Promise.allSettled([
        // Bonul electronic către client — dovada cumpărăturii, cerută de BNM.
        sendPaymentReceiptEmail({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingAddress: order.shippingAddress,
          building: order.building,
          apartment: order.apartment,
          city: order.city,
          items: order.items.map((item) => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          total: order.total,
          paymentReference: result.paymentReference ?? order.paymentId,
          paidAt: new Date(),
        }),
        tgPaymentConfirmed({ orderNumber: order.orderNumber, total: order.total }),
      ])
    );

    // Comanda e plătită, deci e sigură — creăm expediția FAN acum, ca să apară
    // în contul de curierat fără intervenție manuală. Rambursul iese automat 0
    // (comanda e deja PAID). Idempotent: dacă are deja AWB, nu face nimic.
    await createAwbForOrder(order.id);

    return "paid";
  }

  if (result.status === "Expired" || result.status === "Cancelled" || result.status === "Inactive") {
    return "failed";
  }

  return "pending";
}
