import { prisma } from "@/lib/prisma";

export async function getAdminPublishers() {
  const publishers = await prisma.publisher.findMany({ orderBy: { name: "asc" } });
  const counts = await Promise.all(
    publishers.map((p) => prisma.book.count({ where: { publisher: p.name } }))
  );

  return publishers.map((publisher, index) => ({
    ...publisher,
    bookCount: counts[index],
  }));
}
