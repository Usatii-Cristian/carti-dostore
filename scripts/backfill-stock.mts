import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Începem backfill-ul pentru stoc...");
  
  const books = await prisma.book.findMany();
  let updatedCount = 0;

  for (const book of books) {
    const newVariants = book.variants.map(v => {
      if (v.stock === undefined || v.stock === null) {
        return { ...v, stock: 0 };
      }
      return v;
    });

    await prisma.book.update({
      where: { id: book.id },
      data: {
        stock: book.stock ?? 0,
        variants: newVariants
      }
    });
    updatedCount++;
  }

  console.log(`Backfill terminat. ${updatedCount} cărți actualizate.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
