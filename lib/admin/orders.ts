import type { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const ADMIN_ORDERS_PAGE_SIZE = 20;

export async function getAdminOrders({
  status,
  page = 1,
}: {
  status?: string;
  page?: number;
}) {
  const where: Prisma.OrderWhereInput = {};
  const validStatuses: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  if (status && validStatuses.includes(status as OrderStatus)) {
    where.status = status as OrderStatus;
  }

  const skip = (page - 1) * ADMIN_ORDERS_PAGE_SIZE;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_ORDERS_PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_ORDERS_PAGE_SIZE)),
  };
}

export function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}
