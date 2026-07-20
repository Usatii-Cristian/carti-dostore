import { prisma } from "@/lib/prisma";
import type { Prisma, Book } from "@prisma/client";
import { sortToOrderBy, type CategorySort } from "@/lib/books";

// Câte produse se încarcă odată. Restul apar la apăsarea butonului „Afișează
// mai multe" (care crește `page`), ca prima încărcare să fie ușoară.
export const CATALOG_PAGE_SIZE = 12;

export type CatalogQuery = {
  categorii: string[]; // slug-uri de categorii bifate
  minPrice?: number;
  maxPrice?: number;
  reduceri: boolean;
  bestsellers: boolean;
  noutati: boolean;
  sort: CategorySort;
  page: number;
};

export type FacetOption = {
  value: string;
  label: string;
  count: number;
};

export type CatalogFacets = {
  categorii: FacetOption[];
  reduceri: number;
  bestsellers: number;
  noutati: number;
  priceMin: number;
  priceMax: number;
};

// Doar produsele pe stoc apar în catalog — la fel ca în restul site-ului.
const IN_STOCK: Prisma.BookWhereInput = { stock: { gt: 0 } };

const DISCOUNTED: Prisma.BookWhereInput = { discountPrice: { not: null } };

function buildWhere(query: CatalogQuery, categoryIds: string[]): Prisma.BookWhereInput {
  return {
    ...IN_STOCK,
    ...(categoryIds.length > 0 && { categoryId: { in: categoryIds } }),
    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      price: {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      },
    }),
    ...(query.reduceri && DISCOUNTED),
    ...(query.bestsellers && { isBestseller: true }),
    ...(query.noutati && { isNew: true }),
  };
}

export async function getCatalog(query: CatalogQuery): Promise<{
  books: Book[];
  total: number;
  totalPages: number;
  facets: CatalogFacets;
}> {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const selectedIds = categories
    .filter((category) => query.categorii.includes(category.slug))
    .map((category) => category.id);

  const where = buildWhere(query, selectedIds);
  // `page` = câte pagini sunt afișate CUMULAT: butonul „Afișează mai multe" o
  // incrementează și adăugăm produse la cele deja vizibile, în loc să paginăm.
  const take = query.page * CATALOG_PAGE_SIZE;

  // Numărătorile pe categorii ignoră filtrul de categorie (altfel bifarea uneia
  // ar duce restul la 0 și n-ai mai putea adăuga a doua) — dar respectă
  // celelalte filtre active, ca cifrele să fie sincere.
  const whereWithoutCategory = buildWhere({ ...query, categorii: [] }, []);

  const [books, total, grouped, reduceri, bestsellers, noutati, priceRange] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: sortToOrderBy(query.sort),
      take,
    }),
    prisma.book.count({ where }),
    prisma.book.groupBy({
      by: ["categoryId"],
      where: whereWithoutCategory,
      _count: { _all: true },
    }),
    prisma.book.count({ where: { ...whereWithoutCategory, ...DISCOUNTED } }),
    prisma.book.count({ where: { ...whereWithoutCategory, isBestseller: true } }),
    prisma.book.count({ where: { ...whereWithoutCategory, isNew: true } }),
    prisma.book.aggregate({ where: IN_STOCK, _min: { price: true }, _max: { price: true } }),
  ]);

  const countByCategory = new Map(grouped.map((row) => [row.categoryId, row._count._all]));

  return {
    books,
    total,
    totalPages: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)),
    facets: {
      categorii: categories.map((category) => ({
        value: category.slug,
        label: category.name,
        count: countByCategory.get(category.id) ?? 0,
      })),
      reduceri,
      bestsellers,
      noutati,
      priceMin: Math.floor(priceRange._min.price ?? 0),
      priceMax: Math.ceil(priceRange._max.price ?? 1000),
    },
  };
}

export function parseCatalogQuery(search: Record<string, string | string[] | undefined>): CatalogQuery {
  const one = (key: string): string | undefined => {
    const value = search[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const positive = (key: string): number | undefined => {
    const raw = one(key);
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };

  const validSorts: CategorySort[] = ["noi", "pret-asc", "pret-desc", "rating"];
  const rawSort = one("sort") as CategorySort | undefined;

  return {
    categorii: (one("categorii") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    minPrice: positive("minPrice"),
    maxPrice: positive("maxPrice"),
    reduceri: one("reduceri") === "1",
    bestsellers: one("bestsellers") === "1",
    noutati: one("noutati") === "1",
    sort: rawSort && validSorts.includes(rawSort) ? rawSort : "noi",
    page: Math.max(1, Number(one("page")) || 1),
  };
}
