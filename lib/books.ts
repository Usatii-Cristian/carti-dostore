import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { reviveDates } from "@/lib/revive-dates";

export const CATEGORY_PAGE_SIZE = 12;

// Fereastra în care o carte e considerată „nouă" (apare la Noutăți).
const NEW_WINDOW_DAYS = 14;

// „recomandat" e sortarea implicită: ordinea aleasă manual din admin
// (`displayOrder`), ca produsele dintr-o categorie să poată fi aranjate cum
// vrem, nu doar după data adăugării. „noi" a rămas ca opțiune separată.
export type CategorySort = "recomandat" | "noi" | "pret-asc" | "pret-desc" | "rating";

const SORT_LABELS: Record<CategorySort, string> = {
  recomandat: "Recomandate",
  noi: "Cele mai noi",
  "pret-asc": "Preț crescător",
  "pret-desc": "Preț descrescător",
  rating: "Rating",
};

export const SORT_OPTIONS: { value: CategorySort; label: string }[] = (
  ["recomandat", "noi", "pret-asc", "pret-desc", "rating"] as CategorySort[]
).map((value) => ({ value, label: SORT_LABELS[value] }));

export function sortToOrderBy(
  sort: CategorySort
): Prisma.BookOrderByWithRelationInput | Prisma.BookOrderByWithRelationInput[] {
  switch (sort) {
    case "pret-asc":
      return { price: "asc" };
    case "pret-desc":
      return { price: "desc" };
    case "rating":
      return { rating: "desc" };
    case "noi":
      return { createdAt: "desc" };
    case "recomandat":
    default:
      // `createdAt` rămâne ca departajare pentru produsele lăsate pe 0.
      return [{ displayOrder: "asc" }, { createdAt: "desc" }];
  }
}

// Toate listele de mai jos trec prin cache-ul de date al Next: partajat între
// instanțe, invalidat de mutațiile din admin și reîmprospătat oricum la 5
// minute. Fără el, fiecare vizitator lovea Atlas pentru aceleași produse.
const cachedBestsellers = cachedQuery(
  (limit: number) =>
    prisma.book.findMany({
    where: { isBestseller: true },
    // Ordine explicită, controlabilă din admin; rating-ul rămâne doar ca
    // departajare pentru produsele lăsate pe aceeași poziție.
      orderBy: [{ bestsellerOrder: "asc" }, { rating: "desc" }],
      take: limit,
    }),
  ["bestsellers"],
  [CACHE_TAGS.books]
);

export async function getBestsellers(limit = 6) {
  return reviveDates(await cachedBestsellers(limit));
}

// Noutăți: orice carte adăugată în ultimele 2 săptămâni apare automat aici. Dacă
// nu s-a adăugat nimic nou de 2 săptămâni, păstrăm ultimele 3 cărți permanent ca
// pagina să nu rămână goală.
const cachedNewBooks = cachedQuery(
  async (limit: number) => {
    const since = new Date(Date.now() - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const recent = await prisma.book.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    if (recent.length > 0) return recent;

    return prisma.book.findMany({ orderBy: { createdAt: "desc" }, take: 3 });
  },
  ["new-books"],
  [CACHE_TAGS.books]
);

export async function getNewBooks(limit = 24) {
  return reviveDates(await cachedNewBooks(limit));
}

const cachedTopRated = cachedQuery(
  (limit: number) =>
    prisma.book.findMany({
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: limit,
    }),
  ["top-rated"],
  [CACHE_TAGS.books]
);

export async function getTopRatedBooks(limit = 24) {
  return reviveDates(await cachedTopRated(limit));
}

const cachedDiscounted = cachedQuery(
  (limit: number) =>
    prisma.book.findMany({
      where: { discountPrice: { not: null } },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ["discounted"],
  [CACHE_TAGS.books]
);

export async function getDiscountedBooks(limit = 24) {
  return reviveDates(await cachedDiscounted(limit));
}

const cachedBookBySlug = cachedQuery(
  (slug: string) => prisma.book.findUnique({ where: { slug }, include: { category: true } }),
  ["book-by-slug"],
  [CACHE_TAGS.books]
);

export async function getBookBySlug(slug: string) {
  const book = await cachedBookBySlug(slug);
  return book ? reviveDates(book) : null;
}

const cachedSimilar = cachedQuery(
  (categoryId: string, excludeBookId: string, limit: number) =>
    prisma.book.findMany({
      where: { categoryId, id: { not: excludeBookId } },
      orderBy: { rating: "desc" },
      take: limit,
    }),
  ["similar-books"],
  [CACHE_TAGS.books]
);

export async function getSimilarBooks(categoryId: string, excludeBookId: string, limit = 4) {
  return reviveDates(await cachedSimilar(categoryId, excludeBookId, limit));
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
