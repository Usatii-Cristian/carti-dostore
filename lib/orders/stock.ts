import { prisma } from "@/lib/prisma";

export async function adjustOrderStock(orderId: string, action: "decrement" | "increment") {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.items.length === 0) return;

  for (const item of order.items) {
    const book = await prisma.book.findUnique({ where: { id: item.bookId } });
    if (!book) continue;

    const modifier = action === "decrement" ? -item.quantity : item.quantity;

    if (item.variantLabel) {
      const newVariants = book.variants.map((v) => {
        if (v.label === item.variantLabel) {
          return { ...v, stock: Math.max(0, (v.stock ?? 0) + modifier) };
        }
        return v;
      });
      await prisma.book.update({
        where: { id: book.id },
        data: { variants: newVariants },
      });
    } else {
      await prisma.book.update({
        where: { id: book.id },
        data: { stock: Math.max(0, book.stock + modifier) },
      });
    }
  }
}
