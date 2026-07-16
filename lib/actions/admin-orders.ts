"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/email/notifications";
import { tgStatusChange } from "@/lib/telegram";
import { STATUS_META } from "@/lib/orders/status";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PAID", "FAILED", "REFUNDED"];

export async function updateOrderStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const paymentStatus = String(formData.get("paymentStatus") ?? "") as PaymentStatus;
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();

  if (!ORDER_STATUSES.includes(status) || !PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new Error("Status invalid.");
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Comandă negăsită.");

  const statusChanged = order.status !== status;

  await prisma.order.update({
    where: { id },
    data: {
      status,
      paymentStatus,
      trackingNumber: trackingNumber || null,
      // La schimbarea statusului, adăugăm un eveniment în timeline-ul de tracking.
      ...(statusChanged
        ? { statusHistory: { push: { status, at: new Date() } } }
        : {}),
    },
  });

  // Notificăm clientul prin email la schimbarea de status (doar stadiile
  // relevante — vezi STATUS_EMAIL; nu blochează dacă emailul eșuează).
  if (statusChanged) {
    await Promise.allSettled([
      sendOrderStatusEmail({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        status,
        trackingNumber: trackingNumber || order.trackingNumber,
      }),
      tgStatusChange({
        orderNumber: order.orderNumber,
        statusLabel: STATUS_META[status].customerLabel,
      }),
    ]);
  }

  revalidatePath(`/admin/comenzi/${id}`);
  revalidatePath("/admin/comenzi");
  revalidatePath(`/comanda/${order.orderNumber}`);
  redirect(`/admin/comenzi/${id}`);
}
