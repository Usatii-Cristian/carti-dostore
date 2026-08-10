import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookCardData } from "@/lib/types";

export type CartItem = BookCardData & {
  quantity: number;
  /** Tipul ales (ex. „Suplimente"), gol la produsele fără variante. */
  variantLabel?: string | null;
};

/**
 * Cheia unei linii din coș. Același produs poate apărea de mai multe ori, cu
 * tipuri diferite (14 tipuri de etichete, carte în 3 limbi), deci id-ul singur
 * nu mai e suficient.
 */
export function cartItemKey(item: { id: string; variantLabel?: string | null }): string {
  return item.variantLabel ? `${item.id}::${item.variantLabel}` : item.id;
}

type CartState = {
  items: CartItem[];
  addItem: (book: BookCardData, quantity?: number, variantLabel?: string | null) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (book, quantity = 1, variantLabel = null) =>
        set((state) => {
          const key = cartItemKey({ id: book.id, variantLabel });
          const existing = state.items.find((item) => cartItemKey(item) === key);
          if (existing) {
            return {
              items: state.items.map((item) =>
                cartItemKey(item) === key
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...book, quantity, variantLabel }] };
        }),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((item) => cartItemKey(item) !== key) })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => cartItemKey(item) !== key)
              : state.items.map((item) =>
                  cartItemKey(item) === key ? { ...item, quantity } : item
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "bookstore-cart", skipHydration: true }
  )
);

export function cartItemPrice(item: CartItem): number {
  return item.discountPrice ?? item.price;
}

/**
 * Cum apare produsul în comandă: cu tipul ales lipit de titlu, ca să se vadă
 * peste tot (admin, emailuri, conținutul coletului la curier) fără câmpuri noi.
 */
export function cartItemTitle(item: { title: string; variantLabel?: string | null }): string {
  return item.variantLabel ? `${item.title} — ${item.variantLabel}` : item.title;
}

// Transport — NU există livrare gratuită, la nicio sumă a comenzii (a fost o
// afirmație greșită eliminată din tot site-ul). Tariful depinde doar de
// destinație, nu de valoarea comenzii.
export const SHIPPING_LOCAL = 60; // Chișinău (toate sectoarele)
export const SHIPPING_NATIONAL = 85; // restul Republicii Moldova

/**
 * Taxă suplimentară pentru încasarea banilor la livrare (ramburs), indiferent
 * dacă clientul plătește cash sau cu cardul la curier. Nu se aplică la plata
 * online prin MIA, unde banii sunt deja încasați înainte de expediere.
 */
export const COD_FEE = 15;

/** Normalizează pentru comparație: fără diacritice, litere mici, fără spații extra. */
function normalizeCity(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Livrare locală = municipiul Chișinău propriu-zis (toate sectoarele lui apar
 * la FAN sub aceeași localitate, „Chisinau"). Suburbiile cu nume propriu
 * (Durlești, Cricova, Stăuceni…) sunt localități separate în lista FAN, deci
 * intră la tarif național.
 */
export function isLocalDelivery(city: string): boolean {
  return normalizeCity(city) === "chisinau";
}

/** Costul transportului pentru destinația aleasă. Fără oraș încă ales, presupunem tariful național (cel mai mare), ca să nu afișăm un preț mai mic decât cel real. */
export function getShippingCost(city?: string): number {
  if (!city) return SHIPPING_NATIONAL;
  return isLocalDelivery(city) ? SHIPPING_LOCAL : SHIPPING_NATIONAL;
}

/** Taxa de ramburs, aplicată doar la plata la livrare (card sau numerar). */
export function getCodFee(paymentMethod: string): number {
  return paymentMethod === "CARD_ON_DELIVERY" || paymentMethod === "CASH_ON_DELIVERY"
    ? COD_FEE
    : 0;
}
