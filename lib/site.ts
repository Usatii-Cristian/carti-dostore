/**
 * Adresa publică a magazinului — folosită pentru sitemap, robots.txt, linkurile
 * din emailuri și `metadataBase` (OpenGraph, canonical).
 *
 * NU o mai derivăm din `NEXTAUTH_URL`: aceea e adresa pe care o folosește
 * autentificarea și pe Vercel rămăsese pe domeniul `*.vercel.app`. Rezultatul a
 * fost că sitemap-ul publica toate cele 33 de adrese pe `dostore-carti.vercel.app`
 * în loc de domeniul real, iar Search Console le respingea cu „URL not allowed
 * for a Sitemap at this location" (un sitemap poate lista doar adrese de pe
 * același domeniu de pe care e servit).
 *
 * Domeniul canonic e cel cu `www`: `dostore.md` face redirect 308 către el.
 * Se poate suprascrie cu `NEXT_PUBLIC_SITE_URL` dacă se schimbă vreodată.
 */
const PRODUCTION_URL = "https://www.dostore.md";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") return PRODUCTION_URL;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
