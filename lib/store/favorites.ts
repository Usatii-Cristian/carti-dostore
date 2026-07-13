import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookCardData } from "@/lib/types";

type FavoritesState = {
  items: BookCardData[];
  toggle: (book: BookCardData) => void;
  remove: (bookId: string) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (book) =>
        set((state) => {
          const exists = state.items.some((item) => item.id === book.id);
          return {
            items: exists
              ? state.items.filter((item) => item.id !== book.id)
              : [...state.items, book],
          };
        }),
      remove: (bookId) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== bookId) })),
    }),
    { name: "bookstore-favorites", skipHydration: true }
  )
);
