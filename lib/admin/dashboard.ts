import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [totalOrders, revenueResult, lowStockBooks, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.book.findMany({
      where: { stock: { lt: 5 } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    totalOrders,
    totalRevenue: revenueResult._sum.total ?? 0,
    lowStockBooks,
    recentOrders,
  };
}
