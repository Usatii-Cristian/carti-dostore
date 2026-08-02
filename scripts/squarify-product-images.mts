// Optimizează imaginile de produs, PĂSTRÂND coperta întreagă.
//
// Istoric (nu repeta greșeala): o versiune veche a acestui script făcea `trim`
// pe marginile uniforme și apoi încadra totul într-o pânză pătrată. Coperțile
// sunt portret (706x1000), iar pătratul le tăia lateral — toate cele 18 produse
// au apărut luni de zile cu imaginea „prea apropiată", tăiată. Reparat prin
// restaurarea originalelor din git și afișarea la proporția reală (5/7 în
// BookCard / ImageGallery).
//
// De-asta scriptul NU mai face nici `trim`, nici încadrare pătrată: doar
// redimensionează păstrând proporția. Dacă vreodată ai nevoie de pătrat, scalează
// imaginea ÎNTREAGĂ înăuntru (fit: "inside") peste un fundal — niciodată `cover`.
//
// Rulare:
//   npx tsx scripts/squarify-product-images.mts

import sharp from "sharp";
import { readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/products";
const MAX_WIDTH = 800;
const MAX_HEIGHT = 1133;

let processed = 0;
let beforeTotal = 0;
let afterTotal = 0;

for (const file of readdirSync(DIR)) {
  if (!/\.(webp|jpg|jpeg|png)$/i.test(file)) continue;

  const path = join(DIR, file);
  const sizeBefore = statSync(path).size;
  // Citim noi fișierul: dacă lăsăm sharp să deschidă calea, păstrează un handle
  // și pe Windows scrierea ulterioară peste același fișier eșuează.
  const input = readFileSync(path);
  const metaBefore = await sharp(input).metadata();

  const output = await sharp(input)
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  writeFileSync(path, output);

  const metaAfter = await sharp(output).metadata();
  beforeTotal += sizeBefore;
  afterTotal += output.length;
  processed++;

  console.log(
    `  ✓ ${file.padEnd(44)} ${metaBefore.width}x${metaBefore.height}` +
      ` → ${metaAfter.width}x${metaAfter.height}  ` +
      `${(sizeBefore / 1024).toFixed(0)}KB → ${(output.length / 1024).toFixed(0)}KB`
  );
}

console.log(
  `\n${processed} imagini procesate (proporție păstrată). ` +
    `Total ${(beforeTotal / 1024).toFixed(0)}KB → ${(afterTotal / 1024).toFixed(0)}KB.`
);
