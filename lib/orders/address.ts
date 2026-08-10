/**
 * Adresa de livrare, într-un singur rând: stradă + bloc/casă + apartament.
 *
 * Blocul și apartamentul se cer separat în checkout (curierul are nevoie de ele
 * ca să nu sune clientul), dar peste tot unde adresa se afișează sau pleacă mai
 * departe — email, Telegram, admin, AWB-ul FAN — trebuie să apară lipite.
 */
export type ShippingAddressParts = {
  shippingAddress: string;
  building?: string | null;
  apartment?: string | null;
};

/** „3" → „bl. 3", dar „casă" rămâne „casă" (clientul a scris deja cuvântul). */
function withPrefix(value: string | null | undefined, prefix: string): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  return /^\d/.test(trimmed) ? `${prefix} ${trimmed}` : trimmed;
}

export function formatShippingAddress(parts: ShippingAddressParts): string {
  return [
    parts.shippingAddress.trim(),
    withPrefix(parts.building, "bl."),
    withPrefix(parts.apartment, "ap."),
  ]
    .filter(Boolean)
    .join(", ");
}
