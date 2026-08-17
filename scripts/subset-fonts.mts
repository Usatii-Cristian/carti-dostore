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
    // Fontul COMPLET, nu bucata "latin-ext" de la Fontsource: aceea conține
    // doar caracterele extinse, fără alfabetul de bază (am pățit-o).
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf",
    // Păstrăm doar greutățile folosite în site și fixăm axa optică: un font
    // variabil cu axele întregi cântărește de câteva ori mai mult degeaba.
    axes: { wght: { min: 400, max: 700 }, opsz: 16 },
  },
  {
    name: "Playfair Display",
    file: "playfair-latin-ro.woff2",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf",
    // Titlurile folosesc exclusiv 600 (font-serif + font-semibold).
    axes: { wght: 600 },
  },
];

/** Toate caracterele care pot apărea în textele site-ului. */
function buildCharset(): string {
  // Blocuri întregi doar unde chiar avem nevoie de tot: latin de bază și
  // latin-1 (nume străine cu é, ü, ç). Din Latin Extended-A luăm punctual doar
  // literele românești și câteva vecine — restul blocului erau ~90 de glife
  // moarte. Ce nu intră aici cade pe fontul de sistem, ceea ce e acceptabil
  // pentru caractere care nu apar în catalog.
  const ranges: [number, number][] = [
    [0x20, 0x7e], // latin de bază, cifre, punctuație ASCII
    [0xa0, 0xff], // latin-1 supplement
    [0x218, 0x21b], // Ș ș Ț ț — forma corectă, cu virguliță
    [0x2190, 0x2193], // săgeți
  ];

  const singles = [
    0x102, 0x103, // Ă ă
    0x15e, 0x15f, // Ş ş (varianta cu sedilă, din texte mai vechi)
    0x160, 0x161, // Š š
    0x162, 0x163, // Ţ ţ (sedilă)
    0x178, 0x17d, 0x17e, // Ÿ Ž ž
    0x2013, 0x2014, // – —
    0x2018, 0x2019, 0x201a, // ghilimele simple
    0x201c, 0x201d, 0x201e, // ghilimele duble, inclusiv „
    0x2022, 0x2026, // bulină, puncte de suspensie
    0x2039, 0x203a, 0x2044, // ‹ › ⁄
    0x20ac, // euro
    0x2713, // bifă
  ];

  let out = "";
  for (const [start, end] of ranges) {
    for (let code = start; code <= end; code++) out += String.fromCodePoint(code);
  }
  for (const code of singles) out += String.fromCodePoint(code);
  return out;
}

const charset = buildCharset();
console.log(`caractere păstrate: ${charset.length}`);

for (const source of SOURCES) {
  const res = await fetch(source.url);
  if (!res.ok) throw new Error(`${source.name}: descărcarea a eșuat (${res.status})`);
  const original = Buffer.from(await res.arrayBuffer());

  const subset = await subsetFont(original, charset, {
    targetFormat: "woff2",
    variationAxes: source.axes,
  });
  writeFileSync(join(OUT, source.file), subset);

  const kb = (b: Buffer) => (b.length / 1024).toFixed(1);
  console.log(
    `${source.name.padEnd(18)} ${kb(original)}KB → ${kb(subset)}KB  (${source.file})`
  );
}
