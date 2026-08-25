import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CategorySort } from "@/lib/books";
import { CACHE_TAGS } from "@/lib/cache-tags";

// Câte produse se văd la prima încărcare. Restul apar la „Afișează mai multe" —
// filtrarea și paginarea se fac acum în browser, pe datele deja aduse.
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

/**
 * Un produs, cu exact câmpurile de care are nevoie catalogul: cardul + ce se
 * filtrează și se sortează. Nu trimitem descrieri, recenzii sau FAQ-uri în
 * browser — ar umfla pagina degeaba.
 */
export type CatalogBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  discountPrice: number | null;
  rating: number;
  reviewCount: number;
  variants: { label: string }[];
  inStock: boolean;
  categorySlug: string;
  isBestseller: boolean;
  isNew: boolean;
  /** ISO — folosit la sortarea „cele mai noi". */
  createdAt: string;
  displayOrder: number;
};

export type CatalogSnapshot = {
  books: CatalogBook[];
  categories: { value: string; label: string }[];
  priceMin: number;
  priceMax: number;
};

/**
 * TOT catalogul, într-o singură interogare cachată.
 *
 * Înainte, fiecare bifă de filtru însemna un drum nou la server: șapte
 * interogări (produse, total, numărători pe categorii, reduceri, bestsellers,
 * noutăți, interval de preț), o navigare Next și o re-randare — vizibil ca
 * întârziere la fiecare click. Catalogul are zeci de produse, nu zeci de mii,
 * deci e mai ieftin să-l aducem o dată întreg și să filtrăm în browser:
 * filtrele devin instantanee, iar serverul face o singură interogare, cachată
 * și invalidată la modificările din admin.
 */
export const getCatalogSnapshot = unstable_cache(
  async (): Promise<CatalogSnapshot> => {
    const [books, categories] = await Promise.all([
      prisma.book.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          author: true,
          coverImage: true,
          price: true,
          discountPrice: true,
          rating: true,
          reviewCount: true,
          variants: { select: { label: true } },
          inStock: true,
          isBestseller: true,
          isNew: true,
          createdAt: true,
          displayOrder: true,
          category: { select: { slug: true, name: true } },
        },
      }),
      prisma.category.findMany({
        orderBy: [{ featuredOrder: "asc" }, { name: "asc" }],
        select: { slug: true, name: true },
      }),
    ]);

    const prices = books.map((book) => book.price);

    return {
      books: books.map((book) => ({
        id: book.id,
        slug: book.slug,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        price: book.price,
        discountPrice: book.discountPrice,
        rating: book.rating,
        reviewCount: book.reviewCount,
        variants: book.variants,
        inStock: book.inStock,
        categorySlug: book.category.slug,
        isBestseller: book.isBestseller,
        isNew: book.isNew,
        createdAt: book.createdAt.toISOString(),
        displayOrder: book.displayOrder,
      })),
      categories: categories.map((category) => ({
        value: category.slug,
        label: category.name,
      })),
      priceMin: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
      priceMax: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0,
    };
  },
  ["catalog-snapshot"],
  {
    tags: [CACHE_TAGS.books, CACHE_TAGS.categories],
    // Aceeași fereastră ca paginile: 5 minute.
    revalidate: 300,
  }
);

/** Citește filtrele din adresa paginii, ca linkurile partajate să funcționeze. */
export function parseCatalogQuery(
  params: Record<string, string | string[] | undefined>
): CatalogQuery {
  const single = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const number = (key: string): number | undefined => {
    const raw = single(key);
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const rawSort = single("sort");
  const validSorts: CategorySort[] = ["recomandat", "noi", "pret-asc", "pret-desc", "rating"];

  return {
    categorii: (single("categorii") ?? "").split(",").filter(Boolean),
    minPrice: number("minPrice"),
    maxPrice: number("maxPrice"),
    reduceri: single("reduceri") === "1",
    bestsellers: single("bestsellers") === "1",
    noutati: single("noutati") === "1",
    sort: rawSort && validSorts.includes(rawSort as CategorySort)
      ? (rawSort as CategorySort)
      : "recomandat",
    page: Math.max(1, Number(single("page") ?? 1) || 1),
  };
}
