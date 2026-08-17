import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cachedQuery, CATALOG_REVALIDATE_SECONDS } from "@/lib/cache";
import { reviveDates } from "@/lib/revive-dates";

/**
 * Toate categoriile, în ordinea stabilită din admin (`featuredOrder`), ca
 * meniul, footerul și pagina de categorii să arate aceeași ordine ca secțiunea
 * de pe homepage. Numele rămâne doar ca departajare la ordine egală.
 *
 * Cachat: header-ul îl cheamă la FIECARE pagină din site, iar categoriile se
 * schimbă foarte rar. Fără cache era o interogare Atlas pe fiecare navigare.
 * Se invalidează din admin la orice modificare de categorie (revalidateTag).
 */
const cachedCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: [{ featuredOrder: "asc" }, { name: "asc" }],
    }),
  ["all-categories"],
  { tags: [CACHE_TAGS.categories], revalidate: CATALOG_REVALIDATE_SECONDS }
);

export async function getAllCategories() {
  return reviveDates(await cachedCategories());
}

/**
 * Categoriile din secțiunea „Categorii populare" de pe pagina principală.
 * Adminul le alege prin bifa „Afișează pe pagina principală" și le ordonează
 * cu `featuredOrder`. Dacă nu e bifată niciuna, cădem pe primele alfabetic,
 * ca secțiunea să nu rămână goală.
 */
const cachedPopular = cachedQuery(
  (limit: number) =>
    prisma.category.findMany({
      where: { featured: true },
      orderBy: [{ featuredOrder: "asc" }, { name: "asc" }],
      take: limit,
    }),
  ["popular-categories"],
  [CACHE_TAGS.categories]
);

export async function getPopularCategories(limit = 4) {
  const featured = await cachedPopular(limit);
  if (featured.length > 0) return reviveDates(featured);

  const all = await getAllCategories();
  return all.slice(0, limit);
}

const cachedCategoryBySlug = cachedQuery(
  (slug: string) => prisma.category.findUnique({ where: { slug } }),
  ["category-by-slug"],
  [CACHE_TAGS.categories]
);

export async function getCategoryBySlug(slug: string) {
  const category = await cachedCategoryBySlug(slug);
  return category ? reviveDates(category) : null;
}
