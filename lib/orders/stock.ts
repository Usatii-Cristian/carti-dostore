import { prisma } from "@/lib/prisma";

/**
 * Scade (sau readaugă) stocul pentru o comandă.
 *
 * IDEMPOTENTĂ, prin `stockTakenAt` de pe comandă. Fără asta, aceeași comandă
 * își pierdea stocul de două ori: o dată la plasare (plată la livrare) și încă
 * o dată dacă adminul o trecea pe „Confirmată".
 *
 * Se cheamă din trei locuri, după aceeași regulă ca la AWB — o comandă „ia"
 * stocul în momentul în care devine sigură:
 * - plata la livrare → la plasare (lib/actions/checkout.ts): coletul pleacă
 *   imediat, AWB-ul se creează pe loc;
 * - plata online → la confirmarea de la bancă (lib/payments/confirm.ts);
 * - din admin, la schimbarea manuală de status (lib/actions/admin-orders.ts):
 *   confirmare → scade, anulare → readaugă.
 */
export async function adjustOrderStock(orderId: string, action: "decrement" | "increment") {
  // Claim atomic: `updateMany` condiționat trece comanda dintr-o stare în alta
  // doar dacă nimeni n-a făcut-o deja. Dacă `count` e 0, altcineva a apucat
  // primul (sau operația nu se aplică) și nu mai atingem stocul.
  //
  // ⚠️ `isSet: false` nu e de prisos: pe MongoDB, comenzile create înainte de
  // adăugarea câmpului nu îl au deloc în document, iar Prisma NU le potrivește
  // cu `stockTakenAt: null` — verificat. Fără varianta asta, claim-ul întorcea
  // mereu 0 și stocul nu se atingea niciodată.
  const claim = await prisma.order.updateMany({
    where:
      action === "decrement"
        ? { id: orderId, OR: [{ stockTakenAt: null }, { stockTakenAt: { isSet: false } }] }
        : { id: orderId, stockTakenAt: { not: null } },
    data: { stockTakenAt: action === "decrement" ? new Date() : null },
  });
  if (claim.count === 0) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.items.length === 0) return;

  for (const item of order.items) {
    const book = await prisma.book.findUnique({ where: { id: item.bookId } });
    if (!book) continue;

    const modifier = action === "decrement" ? -item.quantity : item.quantity;

    if (item.variantLabel) {
      const newVariants = book.variants.map((v) =>
        v.label === item.variantLabel ? { ...v, stock: Math.max(0, (v.stock ?? 0) + modifier) } : v
      );
      await prisma.book.update({ where: { id: book.id }, data: { variants: newVariants } });
    } else {
      await prisma.book.update({
        where: { id: book.id },
        data: { stock: Math.max(0, book.stock + modifier) },
      });
    }
  }
}
