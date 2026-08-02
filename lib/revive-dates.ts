/**
 * Repune la loc obiectele `Date` după o citire din cache.
 *
 * `unstable_cache` serializează rezultatul, deci câmpurile `Date` din Prisma se
 * întorc ca string-uri ISO. Fără asta, orice `date.toISOString()` /
 * `Intl.format(date)` crapă cu „toISOString is not a function" — exact eroarea
 * care a oprit build-ul când am cachat lista de articole.
 *
 * Convertim doar string-urile care chiar arată a dată ISO completă, ca să nu
 * transformăm din greșeală un titlu sau un slug.
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

export function reviveDates<T>(value: T): T {
  if (typeof value === "string") {
    return (ISO_DATE.test(value) ? new Date(value) : value) as T;
  }
  if (Array.isArray(value)) {
    return value.map(reviveDates) as T;
  }
  if (value instanceof Date || value === null || typeof value !== "object") {
    return value;
  }
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = reviveDates(item);
  }
  return out as T;
}
