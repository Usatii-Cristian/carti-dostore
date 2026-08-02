import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { reviveDates } from "@/lib/revive-dates";

export const BLOG_PAGE_SIZE = 9;

// Interogările publice de blog sunt cachate pe tag: lista de articole era cea
// mai lentă pagină din site (TTFB ~530ms, lovea Atlas la fiecare vizită), deși
// articolele se schimbă foarte rar. Se invalidează din admin la publicare.
//
// ⚠️ `reviveDates` NU e opțional: cache-ul întoarce datele ca string-uri, iar
// `publishedAt` e formatat cu Intl — fără el, build-ul crapă cu
// „toISOString is not a function" (verificat, exact așa a picat prima dată).

const cachedPublishedPosts = unstable_cache(
  (limit: number, skip: number) =>
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip,
    }),
  ["published-posts"],
  { tags: [CACHE_TAGS.blog] }
);

/** Articole publicate, cele mai noi primele. Ciornele nu apar public. */
export async function getPublishedPosts(limit = BLOG_PAGE_SIZE, skip = 0) {
  return reviveDates(await cachedPublishedPosts(limit, skip));
}

export const countPublishedPosts = unstable_cache(
  () => prisma.blogPost.count({ where: { published: true } }),
  ["count-published-posts"],
  { tags: [CACHE_TAGS.blog] }
);

const cachedPostBySlug = unstable_cache(
  (slug: string) => prisma.blogPost.findUnique({ where: { slug } }),
  ["post-by-slug"],
  { tags: [CACHE_TAGS.blog] }
);

export async function getPostBySlug(slug: string) {
  return reviveDates(await cachedPostBySlug(slug));
}

const cachedRelatedPosts = unstable_cache(
  (excludeId: string, limit: number) =>
    prisma.blogPost.findMany({
      where: { published: true, id: { not: excludeId } },
      orderBy: { publishedAt: "desc" },
      take: limit,
    }),
  ["related-posts"],
  { tags: [CACHE_TAGS.blog] }
);

/** Alte articole, pentru secțiunea „Citește mai departe" de la finalul unui post. */
export async function getRelatedPosts(excludeId: string, limit = 3) {
  return reviveDates(await cachedRelatedPosts(excludeId, limit));
}

/** Toate articolele, inclusiv ciornele — doar pentru admin. */
export function getAllPostsForAdmin() {
  return prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
}

export function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Chisinau",
  }).format(date);
}

/** Timp estimat de citire — ~200 cuvinte/minut, minim 1 minut. */
export function readingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
