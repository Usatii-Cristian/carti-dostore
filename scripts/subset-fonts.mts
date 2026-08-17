// Taie fonturile la strictul necesar pentru site: alfabetul latin cu diacritice
// românești, cifre, punctuație și simbolurile de monedă.
//
// De ce: variantele complete de pe Google Fonts (latin + latin-ext) trăgeau
// ~200KB pe FIECARE pagină, cel mai mare cost fix din tot site-ul. Subsetul
// coboară sub 40KB, cu exact aceleași litere pe ecran.
//
// Rulare: npx tsx scripts/subset-fonts.mts
// Fonturile sursă (variabile, latin-ext) se descarcă de la Fontsource.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import subsetFont from "subset-font";

const OUT = join(process.cwd(), "app/fonts");

const SOURCES = [
  {
    name: "Inter",
    file: "inter-latin-ro.woff2",
    url: "https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-ext-wght-normal.woff2",
  },
  {
    name: "Playfair Display",
    file: "playfair-latin-ro.woff2",
    url: "https://cdn.jsdelivr.net/fontsource/fonts/playfair-display:vf@latest/latin-ext-wght-normal.woff2",
  },
];

/** Toate caracterele care pot apărea în textele site-ului. */
function buildCharset(): string {
  const ranges: [number, number][] = [
    [0x20, 0x7e], // latin de bază, cifre, punctuație ASCII
    [0xa0, 0xff], // latin-1: â, î, ç, ü, ș pe unele tastaturi vechi
    [0x100, 0x17f], // latin extended-A: ă, ș, ț, ș̦, ł, š…
    [0x218, 0x21b], // Ș ș Ț ț (forma corectă, cu virguliță)
    [0x2010, 0x2027], // liniuțe, ghilimele, puncte de suspensie
    [0x2030, 0x205e], // ‰, ‹ ›, „ ", †
    [0x20a0, 0x20bf], // simboluri de monedă (€, ₴, ₽)
    [0x2190, 0x2193], // săgeți simple
    [0x2713, 0x2714], // bifă
  ];

  let out = "";
  for (const [start, end] of ranges) {
    for (let code = start; code <= end; code++) out += String.fromCodePoint(code);
  }
  return out;
}

const charset = buildCharset();
console.log(`caractere păstrate: ${charset.length}`);

for (const source of SOURCES) {
  const res = await fetch(source.url);
  if (!res.ok) throw new Error(`${source.name}: descărcarea a eșuat (${res.status})`);
  const original = Buffer.from(await res.arrayBuffer());

  const subset = await subsetFont(original, charset, { targetFormat: "woff2" });
  writeFileSync(join(OUT, source.file), subset);

  const kb = (b: Buffer) => (b.length / 1024).toFixed(1);
  console.log(
    `${source.name.padEnd(18)} ${kb(original)}KB → ${kb(subset)}KB  (${source.file})`
  );
}
