// Populează blogul cu articolele de start (idempotent — rulările repetate nu
// duplică și nu suprascriu ce ai editat între timp din admin).
// Imaginile de copertă se descarcă de pe Unsplash, se optimizează WebP și se
// servesc local din public/blog/ — fără dependență de un domeniu extern.
//
// Rulare: npx tsx scripts/seed-blog.mts

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import sharp from "sharp";

for (const line of readFileSync("e:/bookstore/.env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { PrismaClient } = await import("@prisma/client");
const { slugify } = await import("../lib/slugify.ts");
const prisma = new PrismaClient();

mkdirSync("public/blog", { recursive: true });

const POSTS = [
  {
    title: "Cum alegi uleiul esențial potrivit pentru tine",
    photoId: "photo-1608571423902-eed4a5ad8108",
    excerpt:
      "Lavandă pentru somn, mentă pentru energie, lămâie pentru limpezime — un ghid onest despre cum să începi, fără să cumperi zece sticluțe deodată.",
    tags: ["uleiuri esențiale", "ghid"],
    content: `Când intri prima dată în lumea uleiurilor esențiale, primul impuls e să le vrei pe toate. E de înțeles — fiecare pare să facă ceva minunat. Dar adevărul e mai simplu: **trei uleiuri folosite constant fac mai mult decât cincisprezece uitate într-un sertar.**

## Începe de la o problemă, nu de la o listă

Nu întreba „ce uleiuri să cumpăr?", ci „ce mă deranjează acum?". Răspunsul te duce direct la două-trei opțiuni.

- **Dormi prost** → lavandă. E cel mai blând loc de pornire și iartă greșelile de dozaj.
- **Te blochezi după-amiaza** → mentă. Câteva picături pe palme, respiri adânc, gata.
- **Răcești des iarna** → arbore de ceai sau eucalipt, în difuzor.
- **Ai burta sensibilă** → ghimbir sau mentă, diluate, în masaj pe abdomen.

## Calitatea contează mai mult decât cantitatea

Un ulei ieftin, tăiat cu ulei vegetal sau sintetice, nu e o variantă mai economică — e alt produs. Caută pe etichetă numele botanic latin, țara de origine și metoda de extracție. Dacă lipsesc, întreabă.

> Un ulei bun costă mai mult pe sticlă, dar mai puțin pe utilizare: ai nevoie de mai puține picături ca să simți efectul.

## Diluează. Aproape întotdeauna

Uleiurile esențiale sunt concentrate. „Pur și natural" nu înseamnă „se aplică direct pe piele". Regula practică pentru adulți e 2–3%: cam 12–18 picături la 30 ml de ulei purtător (cocos fracționat, migdale dulci, jojoba).

Pentru copii, vârstnici sau piele sensibilă, înjumătățește. Și fă întotdeauna un test pe o porțiune mică de piele înainte.

## Trei greșeli pe care le face toată lumea la început

1. **Prea multe picături.** Mai mult nu înseamnă mai bine — de multe ori înseamnă iritație.
2. **Difuzor pornit ore în șir.** 30–60 de minute e suficient. Nasul obosește, efectul scade.
3. **Depozitare la lumină.** Sticlele sunt închise la culoare dintr-un motiv. Ține-le la răcoare, închise bine.

## De unde să începi concret

Dacă ar fi să iei doar trei: **lavandă, mentă, lămâie**. Acoperă somnul, energia și curățenia, se combină bine între ele și sunt greu de stricat.

Restul vine după ce înveți cum reacționează corpul tău. Nu invers.`,
  },
  {
    title: "5 cărți care chiar schimbă felul în care lucrezi",
    photoId: "photo-1544716278-ca5e3f4abd8c",
    excerpt:
      "Fără promisiuni de îmbogățire peste noapte. Cinci cărți pe care le recomandăm des pentru că oamenii se întorc și ne spun că au funcționat.",
    tags: ["cărți", "dezvoltare personală"],
    content: `Sunt multe cărți despre productivitate care te fac să te simți bine două zile și apoi nu mai schimbă nimic. Astea cinci sunt altfel — nu pentru că sunt spectaculoase, ci pentru că propun lucruri mici, pe care le poți face de mâine.

## 1. Despre obiceiuri mici, repetate

Ideea centrală: nu ai nevoie de motivație, ai nevoie de un sistem care face acțiunea evidentă și ușoară. Dacă vrei să citești mai mult, pune cartea pe pernă. Serios, atât.

Ce ne place: nu-ți cere să devii altcineva. Îți cere să muți obiectele din casă.

## 2. Despre atenție și muncă profundă

Argumentul e simplu și incomod: capacitatea de a te concentra ore în șir devine rară, deci devine valoroasă. Iar tu ți-o antrenezi sau ți-o pierzi.

> Concentrarea nu e un talent cu care te naști. E un mușchi care se atrofiază dacă îl întrerupi la fiecare notificare.

## 3. Despre a spune „nu"

Cea mai practică lecție: dacă răspunsul nu e „da, categoric", atunci e „nu". Sună dur până înțelegi câte lucruri mediocre îți ocupă săptămâna.

## 4. Despre bani și liniște

Nu e o carte de investiții. E o carte despre de ce oameni deștepți iau decizii proaste cu banii — frică, comparație, grabă. Îți schimbă mai degrabă comportamentul decât strategia.

## 5. Despre conversații grele

Cum spui ce ai de spus fără să strici relația. Util la muncă, dar sincer, mai util acasă.

---

**Cum le-am ales:** niciuna nu promite rezultate în 30 de zile. Toate cer răbdare. Asta e, de fapt, semnul bun.

Dacă vrei să începi cu una singură, ia-o pe prima. Restul au mai mult sens după ea.`,
  },
  {
    title: "Cum ne alegem cărțile pe care le aducem în stoc",
    photoId: "photo-1507842217343-583bb7270b66",
    excerpt:
      "Nu aducem tot ce se vinde bine. Un text scurt despre criteriile după care decidem ce merită să ajungă la tine acasă.",
    tags: ["din culise", "Dostore Carti"],
    content: `Ne întreabă des oamenii de ce nu avem cutare titlu care e peste tot. Răspunsul cinstit: pentru că nu tot ce se vinde bine merită recomandat.

## Trei filtre prin care trece orice carte

**Primul: o citește cineva din echipă.** Nu răsfoiește — o citește. Dacă nimeni nu vrea să o termine, e un semn.

**Al doilea: rezistă la întrebarea „cui i-o dau?".** Dacă nu ne vine în minte o persoană concretă căreia i-ar folosi, probabil nu e pentru raftul nostru.

**Al treilea: traducerea.** O carte bună într-o traducere proastă e o carte proastă. Am renunțat la titluri populare exact din motivul ăsta.

## Ce înseamnă asta pentru tine

Un catalog mai mic, dar în care poți avea încredere. Dacă găsești ceva la noi, cineva a stat cu ea în mână și a zis „da, asta".

> Preferăm să-ți recomandăm 20 de cărți bune decât să-ți vindem 200 dintre care alegi singur.

## Ce facem când greșim

Se întâmplă. Dacă o carte nu e ce te așteptai, o poți returna în 14 zile. Și dacă ne scrii de ce, chiar contează — de câteva ori am scos titluri din stoc după feedback-ul clienților.

Scrie-ne oricând pe pagina de [contact](/contact). Citim tot.`,
  },
];

let created = 0;
let skipped = 0;

for (const post of POSTS) {
  const slug = slugify(post.title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    console.log(`  = ${post.title} (există deja)`);
    skipped++;
    continue;
  }

  const imagePath = `public/blog/${slug}.webp`;
  if (!existsSync(imagePath)) {
    const res = await fetch(
      `https://images.unsplash.com/${post.photoId}?auto=format&fit=crop&w=1400&q=80`
    );
    const buf = Buffer.from(await res.arrayBuffer());
    const optimized = await sharp(buf)
      .resize(1400, 875, { fit: "cover" })
      .webp({ quality: 76 })
      .toBuffer();
    writeFileSync(imagePath, optimized);
    console.log(
      `    imagine: ${(buf.length / 1024).toFixed(0)}KB → ${(optimized.length / 1024).toFixed(0)}KB`
    );
  }

  await prisma.blogPost.create({
    data: {
      title: post.title,
      slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: `/blog/${slug}.webp`,
      tags: post.tags,
      published: true,
      publishedAt: new Date(Date.now() - created * 3 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`  ✓ ${post.title}`);
  created++;
}

console.log(`\n${created} articole create, ${skipped} sărite.`);
await prisma.$disconnect();
