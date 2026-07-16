import { prisma } from "@/lib/prisma";
import { IN_STOCK } from "@/lib/books";

export function getAllPublishers() {
  return prisma.publisher.findMany({ orderBy: { name: "asc" } });
}

export function getPublisherBySlug(slug: string) {
  return prisma.publisher.findUnique({ where: { slug } });
}

// Cărțile unei edituri sunt legate prin numele editurii (Book.publisher).
export function getBooksByPublisher(name: string) {
  return prisma.book.findMany({
    where: { publisher: name, ...IN_STOCK },
    orderBy: { createdAt: "desc" },
  });
}
