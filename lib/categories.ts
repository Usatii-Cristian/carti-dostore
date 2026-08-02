import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";

/**
 * Toate categoriile, în ordinea stabilită din admin (`featuredOrder`), ca
 * meniul, footerul și pagina de categorii să arate aceeași ordine ca secțiunea
 * de pe homepage. Numele rămâne doar ca departajare la ordine egală.
 *
 * Cachat: header-ul îl cheamă la FIECARE pagină din site, iar categoriile se
 * schimbă foarte rar. Fără cache era o interogare Atlas pe fiecare navigare.
 * Se invalidează din admin la orice modificare de categorie (revalidateTag).
 */
export const getAllCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: [{ featuredOrder: "asc" }, { name: "asc" }],
    }),
  ["all-categories"],
  { tags: [CACHE_TAGS.categories] }
);

/**
 * Categoriile din secțiunea „Categorii populare" de pe pagina principală.
 * Adminul le alege prin bifa „Afișează pe pagina principală" și le ordonează
 * cu `featuredOrder`. Dacă nu e bifată niciuna, cădem pe primele alfabetic,
 * ca secțiunea să nu rămână goală.
 */
export async function getPopularCategories(limit = 4) {
  const featured = await prisma.category.findMany({
    where: { featured: true },
    orderBy: [{ featuredOrder: "asc" }, { name: "asc" }],
    take: limit,
  });

  if (featured.length > 0) return featured;

  const all = await getAllCategories();
  return all.slice(0, limit);
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}
