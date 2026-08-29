/**
 * Disponibilitatea unui produs, calculată dintr-un SINGUR loc.
 *
 * A existat o perioadă cu două surse care se puteau contrazice: un comutator
 * „în stoc / nu e în stoc" (boolean) și numărul de bucăți. Cardul din catalog
 * și pagina produsului se uitau la comutator, iar coșul și checkout-ul la
 * număr — așa au ajuns două produse să se afișeze disponibile deși toate
 * variantele lor erau pe 0, iar comanda era refuzată abia la final.
 *
 * Acum contează doar numărul. Produsele cu variante (etichete, cărți în mai
 * multe limbi) își țin stocul pe fiecare variantă, deci al lor e suma: dacă
 * măcar un tip mai există, produsul se poate comanda.
 */

type WithStock = {
  stock?: number | null;
  variants?: { stock?: number | null }[] | null;
};

export function totalStock(book: WithStock): number {
  if (book.variants && book.variants.length > 0) {
    return book.variants.reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
  }
  return book.stock ?? 0;
}

export function isAvailable(book: WithStock): boolean {
  return totalStock(book) > 0;
}
