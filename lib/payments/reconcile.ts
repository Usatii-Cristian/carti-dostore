import "server-only";
import { prisma } from "@/lib/prisma";
import { confirmOrderPayment } from "@/lib/payments/confirm";
import { tgPaymentExpired } from "@/lib/telegram";

/**
 * Închide comenzile online rămase „în aer", întrebând banca ce s-a întâmplat.
 *
 * De ce există: pagina de plată întreabă banca doar cât timp e deschisă. Dacă
 * clientul plătește și închide fila înainte să apucăm să confirmăm, comanda
 * rămâne UNPAID pentru totdeauna — deci fără AWB, fără email de confirmare, iar
 * magazinul nu are de unde ști că banii au intrat. Invers, dacă nu plătește
 * deloc, comanda rămâne „în așteptare" la nesfârșit și pare o comandă bună
 * (exact ce s-a întâmplat cu trei comenzi reale, apărute pe Telegram dar
 * niciodată în contul de curierat).
 *
 * Reconcilierea rezolvă ambele cazuri:
 * - plătită la bancă → `confirmOrderPayment` face tot ce trebuia (marchează
 *   PAID, trimite emailul, creează AWB-ul);
 * - QR expirat/anulat → comanda trece pe FAILED + CANCELLED și pleacă o
 *   notificare pe Telegram, ca magazinul să poată suna clientul.
 */

/** Cât timp în urmă mai are rost să ne uităm (QR-urile expiră oricum repede). */
const MAX_AGE_DAYS = 7;
/** Răgaz înainte de a declara o comandă „neplătită": clientul poate plăti încă. */
const MIN_AGE_MINUTES = 15;

export type ReconcileSummary = {
  checked: number;
  confirmed: number;
  failed: number;
  stillPending: number;
};

export async function reconcilePendingPayments(limit = 25): Promise<ReconcileSummary> {
  const now = Date.now();

  const orders = await prisma.order.findMany({
    where: {
      paymentMethod: "ONLINE",
      paymentStatus: "UNPAID",
      status: { notIn: ["CANCELLED", "DELIVERED"] },
      NOT: { qrHeaderUUID: null },
      createdAt: {
        gte: new Date(now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000),
        lte: new Date(now - MIN_AGE_MINUTES * 60 * 1000),
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const summary: ReconcileSummary = {
    checked: orders.length,
    confirmed: 0,
    failed: 0,
    stillPending: 0,
  };

  for (const order of orders) {
    const status = await confirmOrderPayment(order.orderNumber);

    if (status === "paid") {
      summary.confirmed++;
      continue;
    }

    if (status === "pending") {
      summary.stillPending++;
      continue;
    }

    // „failed" = QR expirat / anulat la bancă. Închidem comanda o singură dată.
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "FAILED",
        status: "CANCELLED",
        statusHistory: [...order.statusHistory, { status: "CANCELLED", at: new Date() }],
      },
    });

    await tgPaymentExpired({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      total: order.total,
    });

    summary.failed++;
  }

  return summary;
}
