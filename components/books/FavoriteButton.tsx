"use client";

import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/lib/store/favorites";
import type { BookCardData } from "@/lib/types";

export function FavoriteButton({
  book,
  variant = "icon",
}: {
  book: BookCardData;
  variant?: "icon" | "full";
}) {
  const isFavorite = useFavoritesStore((state) =>
    state.items.some((item) => item.id === book.id)
  );
  const toggle = useFavoritesStore((state) => state.toggle);

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(book)}
        aria-pressed={isFavorite}
        className={`flex items-center gap-2 rounded-full border px-5 py-3 font-semibold transition-colors ${
          isFavorite
            ? "border-terracotta bg-terracotta/10 text-terracotta"
            : "border-border text-ink hover:border-terracotta hover:text-terracotta"
        }`}
      >
        <Heart
          className="h-4.5 w-4.5"
          fill={isFavorite ? "currentColor" : "none"}
          aria-hidden="true"
        />
        {isFavorite ? "În favorite" : "Favorite"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(book)}
      aria-label={isFavorite ? "Scoate din favorite" : "Adaugă la favorite"}
      aria-pressed={isFavorite}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors ${
        isFavorite ? "text-terracotta" : "text-navy hover:text-terracotta"
      }`}
    >
      <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}
