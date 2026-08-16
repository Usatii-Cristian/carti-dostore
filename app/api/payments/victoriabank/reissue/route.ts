import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createQrPayment } from "@/lib/payments/victoriabank";

/**
 * Generează un cod QR NOU pentru o comandă online neachitată.
 *
 * Codul MIA trăiește 30 de minute. Clientul care revine mai târziu — din linkul
 * primit pe email, de pe pagina comenzii sau pur și simplu după ce a fost
 * întrerupt — găsea un cod mort și nu mai avea cum să plătească; singura opțiune
 * rămânea să facă altă comandă. Acum poate cere un cod nou pentru aceeași
 * comandă, iar comanda anulată automat la expirare revine în așteptare.
 *
 * Nu atinge niciodată comenzile deja plătite sau rambursate.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const orderNumber = new URL(request.url).searchParams.get("order");
  if (!orderNumber) {
    return NextResponse.json({ error: "Lipsește numărul comenzii." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) {
    return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });
  }
  if (order.paymentMethod !== "ONLINE") {
    return NextResponse.json({ error: "Comanda nu se plătește online." }, { status: 400 });
  }
  if (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") {
    return NextResponse.json({ error: "Comanda e deja achitată." }, { status: 409 });
  }

  const qr = await createQrPayment({ orderNumber: order.orderNumber, amount: order.total });
  if (qr.skipped || !qr.qrHeaderUUID) {
    return NextResponse.json({ error: "Plata online nu e disponibilă acum." }, { status: 503 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      qrHeaderUUID: qr.qrHeaderUUID,
      qrExtensionUUID: qr.qrExtensionUUID,
      qrPayUrl: qr.payUrl,
      // Comanda anulată automat la expirarea codului precedent redevine activă.
      paymentStatus: "UNPAID",
      status: order.status === "CANCELLED" ? "PENDING" : order.status,
      statusHistory:
        order.status === "CANCELLED"
          ? [...order.statusHistory, { status: "PENDING" as const, at: new Date() }]
          : order.statusHistory,
    },
  });

  return NextResponse.json({ ok: true });
}
