import { prisma } from "@/lib/prisma";

export const ADMIN_BOOKS_PAGE_SIZE = 20;

export async function getAdminBooks({ q, page = 1 }: { q?: string; page?: number }) {
  const where = q
    ? { searchText: { contains: q.trim().toLowerCase() } }
    : {};

  const skip = (page - 1) * ADMIN_BOOKS_PAGE_SIZE;

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_BOOKS_PAGE_SIZE,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    total,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_BOOKS_PAGE_SIZE)),
  };
}

export function getBookForEdit(id: string) {
  return prisma.book.findUnique({ where: { id } });
}
