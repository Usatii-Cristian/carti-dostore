import localFont from "next/font/local";

/**
 * Fonturile site-ului, într-un SINGUR loc.
 *
 * Două motive:
 *
 * 1. Sunt subseturi proprii, nu variantele complete de pe Google Fonts. Acelea
 *    aduceau ~200KB de woff2 pe fiecare pagină (latin + latin-ext, axă
 *    variabilă întreagă) — cel mai mare cost fix din tot site-ul. Subsetul
 *    păstrează exact literele de care avem nevoie (latin + diacriticele
 *    românești + punctuație + monedă) și coboară la ~34KB.
 *    Regenerare: `npx tsx scripts/subset-fonts.mts`.
 *
 * 2. Declarația e comună pentru toate rădăcinile aplicației (site, admin,
 *    pagina 404 globală). Când fiecare își declara fontul cu opțiuni ușor
 *    diferite, Next genera seturi separate de fișiere și browserul descărca
 *    aceeași literă de două ori.
 */

export const inter = localFont({
  src: "./fonts/inter-latin-ro.woff2",
  variable: "--font-inter",
  // Subsetul păstrează axa de greutate 400–700, cât folosim efectiv.
  weight: "400 700",
  style: "normal",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
});

export const playfairDisplay = localFont({
  src: "./fonts/playfair-latin-ro.woff2",
  variable: "--font-playfair",
  // Subsetul e fixat pe greutatea 600 — singura folosită la titluri.
  weight: "600",
  style: "normal",
  display: "swap",
  // Doar pentru titluri, care apar mai jos în pagină: nu-l punem în lanțul
  // critic, ca textul curent (Inter) să ajungă primul.
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});
