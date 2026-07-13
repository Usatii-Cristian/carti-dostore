"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PAID", "FAILED", "REFUNDED"];

export async function updateOrderStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");

  if (
    !ORDER_STATUSES.includes(status as OrderStatus) ||
    !PAYMENT_STATUSES.includes(paymentStatus as PaymentStatus)
  ) {
    throw new Error("Status invalid.");
  }

  await prisma.order.update({
    where: { id },
    data: {
      status: status as OrderStatus,
      paymentStatus: paymentStatus as PaymentStatus,
    },
  });

  revalidatePath(`/admin/comenzi/${id}`);
  revalidatePath("/admin/comenzi");
  redirect(`/admin/comenzi/${id}`);
}
