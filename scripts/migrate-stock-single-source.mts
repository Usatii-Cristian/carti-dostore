/**
 * Trece disponibilitatea pe o singură sursă: stocul.
 *
 * 1. Șterge din documente câmpul `inStock` (comutatorul care putea contrazice
 *    numărul). MongoDB n-are migrări, deci câmpul rămâne în documente după ce
 *    dispare din schemă — iar Prisma se plânge de câmpuri necunoscute.
 * 2. Pune stoc pe variantele rămase pe 0. Produsele cu variante își țin stocul
 *    pe fiecare tip, iar acelea au rămas toate pe 0 când s-a adăugat câmpul —
 *    adică două produse reale nu puteau fi comandate deloc.
 *
 *   npx tsx scripts/migrate-stock-single-source.mts
 *
 * Idempotent: se poate rula de câte ori vrei.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const { prisma } = await import("@/lib/prisma");

// 1. Scoatem câmpul vechi din documente
const unset = await prisma.$runCommandRaw({
  update: "Book",
  updates: [{ q: { inStock: { $exists: true } }, u: { $unset: { inStock: "" } }, multi: true }],
});
console.log("documente curățate de `inStock`:", unset);

// 2. Variantele pe 0 primesc stocul de la nivel de produs, ca punct de plecare
const books = await prisma.book.findMany({
  where: { NOT: { variants: { isEmpty: true } } },
  select: { id: true, title: true, stock: true, variants: true },
});

for (const book of books) {
  const total = book.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  if (total > 0) {
    console.log(`= ${book.title}: variante deja cu stoc (${total}), nu ating`);
    continue;
  }

  const start = book.stock > 0 ? book.stock : 25;
  await prisma.book.update({
    where: { id: book.id },
    data: { variants: book.variants.map((v) => ({ ...v, stock: start })) },
  });
  console.log(`+ ${book.title}: ${book.variants.length} variante × ${start} buc.`);
}

await prisma.$disconnect();
process.exit(0);
