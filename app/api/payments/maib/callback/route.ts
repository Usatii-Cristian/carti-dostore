import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMaibSignature } from "@/lib/payments/maib";
import { sendPaymentConfirmedEmail } from "@/lib/email/notifications";
import { tgPaymentConfirmed } from "@/lib/telegram";

// maib reîncearcă acest callback dacă nu răspundem cu 200, așa că orice
// ramură din funcția asta trebuie să se termine cu un 200 — inclusiv erorile.
export async function POST(request: NextRequest) {
  let payload: { result?: Record<string, unknown>; signature?: string };

  try {
    payload = await request.json();
  } catch {
    console.error("[maib callback] payload invalid (JSON malformat)");
    return NextResponse.json({ ok: true });
  }

  const { result, signature } = payload;
  const signatureKey = process.env.MAIB_SIGNATURE_KEY;

  if (!result || !signature || !signatureKey) {
    console.error("[maib callback] lipsesc result, signature sau MAIB_SIGNATURE_KEY");
    return NextResponse.json({ ok: true });
  }

  if (!verifyMaibSignature(result, signature, signatureKey)) {
    console.error("[maib callback] semnătură invalidă — callback ignorat", {
      orderId: result.orderId,
    });
    return NextResponse.json({ ok: true });
  }

  const orderNumber = typeof result.orderId === "string" ? result.orderId : undefined;
  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber } })
    : null;

  if (!order) {
    console.error("[maib callback] comandă negăsită pentru orderId:", orderNumber);
    return NextResponse.json({ ok: true });
  }

  const paid = result.status === "OK";
  const payId = typeof result.payId === "string" ? result.payId : order.paymentId;

  const wasAlreadyPaid = order.paymentStatus === "PAID";
  const confirmNow = paid && !wasAlreadyPaid;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: paid ? "PAID" : "FAILED",
      status: paid ? "CONFIRMED" : order.status,
      paymentId: payId,
      // Marcăm în timeline momentul confirmării plății (o singură dată).
      ...(confirmNow
        ? { statusHistory: { push: { status: "CONFIRMED" as const, at: new Date() } } }
        : {}),
    },
  });

  // Email de confirmare a plății — o singură dată (maib poate re-trimite
  // callback-ul; nu retrimitem dacă era deja marcată plătită).
  if (paid && !wasAlreadyPaid) {
    await Promise.allSettled([
      sendPaymentConfirmedEmail({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        total: order.total,
      }),
      tgPaymentConfirmed({ orderNumber: order.orderNumber, total: order.total }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
