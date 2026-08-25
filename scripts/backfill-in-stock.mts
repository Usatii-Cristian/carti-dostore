/**
 * Completează `inStock` pe produsele existente.
 *
 * MongoDB nu are migrări de schemă: documentele salvate înainte de adăugarea
 * câmpului pur și simplu nu îl au, iar Prisma refuză să citească un câmp
 * obligatoriu care lipsește din document. Rulat o singură dată, după
 * `prisma db push`; e idempotent, deci se poate relua fără efecte.
 *
 *   npx tsx scripts/backfill-in-stock.mts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const { prisma } = await import("@/lib/prisma");

// Prisma nu poate filtra pe „câmp inexistent", deci mergem prin driverul brut.
const result = await prisma.$runCommandRaw({
  update: "Book",
  updates: [
    {
      q: { inStock: { $exists: false } },
      u: { $set: { inStock: true } },
      multi: true,
    },
  ],
});

console.log("Produse actualizate:", result);
await prisma.$disconnect();
process.exit(0);
