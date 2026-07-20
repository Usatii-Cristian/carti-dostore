import { prisma } from "@/lib/prisma";

export const BLOG_PAGE_SIZE = 9;

/** Articole publicate, cele mai noi primele. Ciornele nu apar public. */
export function getPublishedPosts(limit = BLOG_PAGE_SIZE, skip = 0) {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip,
  });
}

export function countPublishedPosts() {
  return prisma.blogPost.count({ where: { published: true } });
}

export function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

/** Alte articole, pentru secțiunea „Citește mai departe" de la finalul unui post. */
export function getRelatedPosts(excludeId: string, limit = 3) {
  return prisma.blogPost.findMany({
    where: { published: true, id: { not: excludeId } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
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
  }).format(date);
}

/** Timp estimat de citire — ~200 cuvinte/minut, minim 1 minut. */
export function readingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
