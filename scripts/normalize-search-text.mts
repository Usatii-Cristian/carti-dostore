// Migrare one-off (rulabilă oricând, idempotentă): normalizează searchText
// pentru toate cărțile existente — lowercase + fără diacritice — ca să se
// alinieze cu noua construcție din admin-books.ts / seed.ts și cu interogarea
// din lib/search.ts. Context: produsele adăugate din admin înainte de fix
// aveau searchText cu diacritice, deci „carti" nu găsea „cărți".
//
// Rulare: npx tsx scripts/normalize-search-text.mts

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { PrismaClient } = await import("@prisma/client");
const { normalizeForSearch } = await import("../lib/slugify.ts");

const prisma = new PrismaClient();

const books = await prisma.book.findMany({ select: { id: true, title: true, searchText: true } });
let changed = 0;

for (const book of books) {
  const normalized = normalizeForSearch(book.searchText);
  if (normalized !== book.searchText) {
    await prisma.book.update({ where: { id: book.id }, data: { searchText: normalized } });
    changed++;
    console.log(`  ✓ ${book.title}`);
  }
}

console.log(`\n${books.length} cărți verificate, ${changed} actualizate.`);
await prisma.$disconnect();
