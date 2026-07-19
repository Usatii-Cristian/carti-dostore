export const DIACRITICS_REGEX = /[̀-ͯ]/g;

// Normalizare pentru căutare: lowercase + fără diacritice. Folosită și la
// CONSTRUIREA searchText (seed, admin), și la interogare (lib/search.ts) —
// utilizatorii din Moldova scriu de obicei „carti", nu „cărți", deci ambele
// părți trebuie aduse la aceeași formă.
export function normalizeForSearch(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
