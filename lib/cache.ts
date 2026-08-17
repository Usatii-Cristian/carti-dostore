import { unstable_cache } from "next/cache";

/**
 * Fereastra de reîmprospătare a datelor din catalog, în secunde.
 *
 * Aceeași valoare ca ISR-ul paginilor (5 minute): pagina și datele din ea
 * expiră împreună, deci nu poate apărea situația în care HTML-ul e proaspăt și
 * datele vechi. Modificările din admin invalidează tag-urile pe loc, deci cele
 * 5 minute sunt doar plasa de siguranță pentru scrierile făcute direct în baza
 * de date (scripturi de întreținere, importuri).
 */
export const CATALOG_REVALIDATE_SECONDS = 300;

/**
 * Împachetează o interogare în cache-ul de date al Next (partajat între toate
 * instanțele de pe Vercel, nu per proces).
 *
 * Fără el, fiecare vizitator ar lovi MongoDB Atlas pentru aceleași produse și
 * categorii — cu el, prima cerere umple cache-ul, restul primesc răspunsul deja
 * calculat, iar admin-ul îl golește când schimbă ceva.
 */
export function cachedQuery<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  keyParts: string[],
  tags: string[]
) {
  return unstable_cache(fn, keyParts, {
    tags,
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });
}
