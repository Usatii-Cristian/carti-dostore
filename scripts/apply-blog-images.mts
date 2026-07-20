// Preia imaginile trimise de utilizator din public/ (fișierele „ChatGPT Image …"),
// le optimizează în public/blog/ și le atașează articolelor potrivite,
// creând articolul lipsă pentru imaginea cu cutia cadou.
//
// Rulare: npx tsx scripts/apply-blog-images.mts

import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import sharp from "sharp";

for (const line of readFileSync("e:/bookstore/.env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { PrismaClient } = await import("@prisma/client");
const { slugify } = await import("../lib/slugify.ts");
const prisma = new PrismaClient();

// Fișierele vin nedenumite din generator; le luăm în ordinea în care au fost
// create (numele conține ora) și le mapăm pe temele vizibile în ele.
const incoming = readdirSync("public")
  .filter((f) => f.startsWith("ChatGPT Image"))
  .sort();

if (incoming.length < 3) {
  console.error(`Am găsit doar ${incoming.length} imagini noi în public/. Aștept 3.`);
  process.exit(1);
}

const TARGETS = [
  { file: incoming[0], name: "teanc-de-carti" }, // teanc de cărți vechi + frunze
  { file: incoming[1], name: "carti-si-flori-uscate" }, // cărți în picioare + flori uscate
  { file: incoming[2], name: "cutie-cadou" }, // cutie cadou cu fundă
];

for (const target of TARGETS) {
  const buf = readFileSync(`public/${target.file}`);
  const out = await sharp(buf).resize(1400, 875, { fit: "cover" }).webp({ quality: 76 }).toBuffer();
  writeFileSync(`public/blog/${target.name}.webp`, out);
  console.log(
    `  ✓ ${target.name}.webp  ${(buf.length / 1024).toFixed(0)}KB → ${(out.length / 1024).toFixed(0)}KB`
  );
  unlinkSync(`public/${target.file}`); // nu lăsăm PNG-uri de 1.5MB în deploy
}

// --- Reatribuim imaginile articolelor cărora li se potrivesc -----------------

const updates: [string, string][] = [
  ["5-carti-care-chiar-schimba-felul-in-care-lucrezi", "/blog/teanc-de-carti.webp"],
  ["cum-ne-alegem-cartile-pe-care-le-aducem-in-stoc", "/blog/carti-si-flori-uscate.webp"],
];

for (const [slug, coverImage] of updates) {
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (!existing) continue;
  await prisma.blogPost.update({ where: { slug }, data: { coverImage } });
  console.log(`  ↻ ${existing.title} → ${coverImage}`);
}

// --- Articolul nou, pentru imaginea cu cutia cadou ---------------------------

const giftTitle = "Cum alegi o carte cadou fără să dai greș";
const giftSlug = slugify(giftTitle);

const existingGift = await prisma.blogPost.findUnique({ where: { slug: giftSlug } });
if (!existingGift) {
  await prisma.blogPost.create({
    data: {
      title: giftTitle,
      slug: giftSlug,
      excerpt:
        "O carte e cel mai personal cadou ieftin și cel mai riscant cadou scump. Câteva reguli simple ca să nimerești de prima dată.",
      coverImage: "/blog/cutie-cadou.webp",
      tags: ["cadouri", "ghid"],
      published: true,
      publishedAt: new Date(),
      content: `O carte spune „m-am gândit la tine" mai bine decât aproape orice altceva la același preț. Dar tot ea poate să spună „am luat ce era la intrare", dacă alegi greșit. Diferența stă în două-trei întrebări puse înainte.

## Nu cumpăra cartea pe care vrei TU să o citească

E cea mai frecventă greșeală. Alegem cartea care ne-a schimbat pe noi și o dăm mai departe ca pe o rețetă. Dar cadoul nu e despre gustul tău, ci despre al lui.

> Întrebarea corectă nu e „ce carte e bună?", ci „ce carte i-ar face lui plăcere să deschidă sâmbătă dimineața?".

## Trei întrebări care restrâng imediat lista

1. **Citește des sau rar?** Cine citește rar are nevoie de ceva scurt și cu ritm. Cine citește mult are deja tot ce e evident — mergi pe ceva de nișă.
2. **Ce urmărește sau ascultă?** Documentare despre natură, podcasturi de business, seriale istorice — toate se traduc direct într-un raft.
3. **Prin ce trece acum?** Schimbare de job, copil mic, mutare, o perioadă grea. Cartea potrivită la momentul potrivit se ține minte ani.

## Ce funcționează aproape întotdeauna

- **Cărți frumoase ca obiect.** Copertă cartonată, hârtie bună. Se văd pe raft și se simt a cadou.
- **Cărți practice pentru o pasiune existentă.** Cineva care gătește, cineva care aleargă, cineva care are grijă de plante.
- **Un set mic în loc de un volum mare.** Două cărți subțiri, legate tematic, arată mai gândit decât una groasă.

## Ce e riscant

Cărțile de dezvoltare personală date cuiva care nu ți-a cerut sfaturi. Chiar dacă e cea mai bună carte din lume, mesajul care ajunge e „cred că ai o problemă". Dă-le doar dacă știi sigur că persoana le caută.

## Ambalajul contează mai mult decât crezi

O carte pusă într-o pungă e o carte. Aceeași carte, împachetată, cu un bilet scris de mână în care spui **de ce** ai ales-o tocmai pe ea, e un cadou.

Biletul e partea importantă. Două rânduri ajung.

---

La noi poți cere împachetare pentru orice comandă — scrie-ne în observațiile de la [checkout](/checkout) și ne ocupăm. Dacă nu te decizi, spune-ne pentru cine e și îți dăm trei variante concrete.`,
    },
  });
  console.log(`  + articol nou: ${giftTitle}`);
} else {
  await prisma.blogPost.update({
    where: { slug: giftSlug },
    data: { coverImage: "/blog/cutie-cadou.webp" },
  });
  console.log(`  ↻ ${giftTitle} → /blog/cutie-cadou.webp`);
}

const total = await prisma.blogPost.count({ where: { published: true } });
console.log(`\n${total} articole publicate.`);
await prisma.$disconnect();
