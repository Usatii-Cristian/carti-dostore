/**
 * Tag-urile de cache pentru datele de catalog.
 *
 * Interogările publice (catalog, categorii) sunt cachate, ca filtrele să nu mai
 * lovească MongoDB Atlas la fiecare click. Orice mutație din admin invalidează
 * tag-ul potrivit, deci modificările se văd imediat, fără să așteptăm expirarea.
 */
export const CACHE_TAGS = {
  books: "books",
  categories: "categories",
} as const;
