import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

type StaticRoute = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

// Doar pagini publice, indexabile. NU includem /cos, /favorite, /checkout,
// /admin sau /api — sunt blocate în robots.txt, iar un sitemap care le listează
// se contrazice singur.
const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/carti", priority: 0.9, changeFrequency: "daily" },
  { path: "/categorii", priority: 0.8, changeFrequency: "weekly" },
  { path: "/carti/bestsellers", priority: 0.8, changeFrequency: "daily" },
  { path: "/carti/noutati", priority: 0.7, changeFrequency: "daily" },
  { path: "/carti/recomandate", priority: 0.7, changeFrequency: "weekly" },
  { path: "/carti/reduceri", priority: 0.7, changeFrequency: "daily" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/livrare-si-plata", priority: 0.6, changeFrequency: "monthly" },
  { path: "/intrebari-frecvente", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/despre-noi", priority: 0.5, changeFrequency: "monthly" },
  { path: "/retur-si-rambursare", priority: 0.4, changeFrequency: "monthly" },
  { path: "/edituri", priority: 0.4, changeFrequency: "monthly" },
  { path: "/colectii", priority: 0.4, changeFrequency: "monthly" },
  { path: "/librarii", priority: 0.3, changeFrequency: "monthly" },
  { path: "/cariere", priority: 0.3, changeFrequency: "monthly" },
  { path: "/termeni-si-conditii", priority: 0.3, changeFrequency: "yearly" },
  { path: "/confidentialitate", priority: 0.3, changeFrequency: "yearly" },
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
    const [books, categories, posts] = await Promise.all([
      prisma.book.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    // Categoriile trăiesc ca filtre în catalogul unic (/carti/categorie/:slug
    // face redirect aici), deci adresa canonică e cea cu parametru.
    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE_URL}/carti?categorii=${category.slug}`,
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

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    dynamicEntries = [...categoryEntries, ...bookEntries, ...postEntries];
  } catch (error) {
    console.error("[sitemap] baza de date indisponibilă — doar rute statice:", error);
  }

  return [...staticEntries, ...dynamicEntries];
}
