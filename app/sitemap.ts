import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/categorii", priority: 0.8, changeFrequency: "weekly" },
  { path: "/carti/bestsellers", priority: 0.8, changeFrequency: "daily" },
  { path: "/carti/noutati", priority: 0.7, changeFrequency: "daily" },
  { path: "/carti/recomandate", priority: 0.7, changeFrequency: "weekly" },
  { path: "/carti/reduceri", priority: 0.7, changeFrequency: "daily" },
  { path: "/edituri", priority: 0.4, changeFrequency: "monthly" },
  { path: "/colectii", priority: 0.4, changeFrequency: "monthly" },
  { path: "/librarii", priority: 0.3, changeFrequency: "monthly" },
  { path: "/livrare-si-plata", priority: 0.3, changeFrequency: "monthly" },
];

// Generat la cerere (nu la build) ca să nu depindă de DATABASE_URL la build-ul
// Vercel. În plus, dacă baza de date e indisponibilă, întoarcem măcar rutele
// statice în loc să pice tot build-ul.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [books, categories] = await Promise.all([
      prisma.book.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ select: { slug: true } }),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE_URL}/carti/categorie/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const bookEntries: MetadataRoute.Sitemap = books.map((book) => ({
      url: `${SITE_URL}/carti/${book.slug}`,
      lastModified: book.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    dynamicEntries = [...categoryEntries, ...bookEntries];
  } catch (error) {
    console.error("[sitemap] baza de date indisponibilă — doar rute statice:", error);
  }

  return [...staticEntries, ...dynamicEntries];
}
