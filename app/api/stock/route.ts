import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

/**
 * Lista produselor epuizate, ca id-uri.
 *
 * Coșul trăiește în localStorage, deci poate conține produse adăugate acum o
 * săptămână, între timp epuizate. Pagina coșului și cea de checkout întreabă
 * aici ca să marcheze liniile respective ÎNAINTE de trimiterea comenzii — fără
 * asta clientul ar afla abia la apăsarea butonului final.
 *
 * E un răspuns minuscul (doar id-urile epuizate, de obicei niciunul sau câteva)
 * și e cachat pe tag-ul `books`, deci se reîmprospătează imediat ce se
 * modifică un produs din admin.
 */
export const revalidate = 300;

const getStockData = unstable_cache(
  async () => {
    const books = await prisma.book.findMany({
      select: { id: true, stock: true, variants: true },
    });
    
    const stockData: Record<string, { stock: number; variants: Record<string, number> }> = {};
    for (const book of books) {
      const variantsData: Record<string, number> = {};
      for (const v of book.variants) {
        variantsData[v.label] = v.stock ?? 0;
      }
      stockData[book.id] = {
        stock: book.stock ?? 0,
        variants: variantsData,
      };
    }
    return stockData;
  },
  ["stock-data-v2"],
  { tags: [CACHE_TAGS.books], revalidate: 300 }
);

export async function GET() {
  return NextResponse.json({ stockData: await getStockData() });
}
