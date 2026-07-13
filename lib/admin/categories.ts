import { prisma } from "@/lib/prisma";

export async function getAdminCategories() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const counts = await Promise.all(
    categories.map((category) => prisma.book.count({ where: { categoryId: category.id } }))
  );

  return categories.map((category, index) => ({
    ...category,
    bookCount: counts[index],
  }));
}

export function getCategoryForEdit(id: string) {
  return prisma.category.findUnique({ where: { id } });
}
