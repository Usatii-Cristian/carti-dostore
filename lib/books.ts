import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Cărțile cu stoc 0 dispar complet de pe site (nu mai apar în liste/căutare).
export const IN_STOCK: Prisma.BookWhereInput = { stock: { gt: 0 } };

export const CATEGORY_PAGE_SIZE = 12;

// Fereastra în care o carte e considerată „nouă" (apare la Noutăți).
const NEW_WINDOW_DAYS = 14;

export type CategorySort = "noi" | "pret-asc" | "pret-desc" | "rating";

const SORT_LABELS: Record<CategorySort, string> = {
  noi: "Cele mai noi",
  "pret-asc": "Preț crescător",
  "pret-desc": "Preț descrescător",
  rating: "Rating",
};

export const SORT_OPTIONS: { value: CategorySort; label: string }[] = (
  ["noi", "pret-asc", "pret-desc", "rating"] as CategorySort[]
).map((value) => ({ value, label: SORT_LABELS[value] }));

function sortToOrderBy(sort: CategorySort): Prisma.BookOrderByWithRelationInput {
  switch (sort) {
    case "pret-asc":
      return { price: "asc" };
    case "pret-desc":
      return { price: "desc" };
    case "rating":
      return { rating: "desc" };
    case "noi":
    default:
      return { createdAt: "desc" };
  }
}

export function getBestsellers(limit = 6) {
  return prisma.book.findMany({
    where: { isBestseller: true, ...IN_STOCK },
    orderBy: { rating: "desc" },
    take: limit,
  });
}

// Noutăți: orice carte adăugată în ultimele 2 săptămâni apare automat aici. Dacă
// nu s-a adăugat nimic nou de 2 săptămâni, păstrăm ultimele 3 cărți permanent ca
// pagina să nu rămână goală.
export async function getNewBooks(limit = 24) {
  const since = new Date(Date.now() - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const recent = await prisma.book.findMany({
    where: { ...IN_STOCK, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (recent.length > 0) return recent;

  return prisma.book.findMany({
    where: IN_STOCK,
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

export function getTopRatedBooks(limit = 24) {
  return prisma.book.findMany({
    where: IN_STOCK,
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    take: limit,
  });
}

export function getDiscountedBooks(limit = 24) {
  return prisma.book.findMany({
    where: { discountPrice: { not: null }, ...IN_STOCK },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function getBookBySlug(slug: string) {
  return prisma.book.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export function getSimilarBooks(categoryId: string, excludeBookId: string, limit = 4) {
  return prisma.book.findMany({
    where: { categoryId, id: { not: excludeBookId }, ...IN_STOCK },
    orderBy: { rating: "desc" },
    take: limit,
  });
}

type BooksByCategoryParams = {
  categoryId: string;
  page: number;
  sort: CategorySort;
  minPrice?: number;
  maxPrice?: number;
};

export async function getBooksByCategory({
  categoryId,
  page,
  sort,
  minPrice,
  maxPrice,
}: BooksByCategoryParams) {
  const where: Prisma.BookWhereInput = {
    categoryId,
    ...IN_STOCK,
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  const skip = (page - 1) * CATEGORY_PAGE_SIZE;

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: sortToOrderBy(sort),
      skip,
      take: CATEGORY_PAGE_SIZE,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    total,
    totalPages: Math.max(1, Math.ceil(total / CATEGORY_PAGE_SIZE)),
  };
}
