import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookCardData } from "@/lib/types";

export type CartItem = BookCardData & { quantity: number };

type CartState = {
  items: CartItem[];
  addItem: (book: BookCardData, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (book, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === book.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === book.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...book, quantity }] };
        }),
      removeItem: (bookId) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== bookId) })),
      setQuantity: (bookId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== bookId)
              : state.items.map((item) =>
                  item.id === bookId ? { ...item, quantity } : item
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

export const FREE_SHIPPING_THRESHOLD = 199;
export const SHIPPING_COST = 39;

export function getShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}
