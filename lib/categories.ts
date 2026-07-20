import { prisma } from "@/lib/prisma";

export function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

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
