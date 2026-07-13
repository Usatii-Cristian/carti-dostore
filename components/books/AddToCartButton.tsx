"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import type { BookCardData } from "@/lib/types";

export function AddToCartButton({
  book,
  outOfStock,
  variant = "icon",
}: {
  book: BookCardData;
  outOfStock: boolean;
  variant?: "icon" | "full";
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    if (outOfStock) return;
    addItem(book);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className="flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-soft"
      >
        {justAdded ? (
          <Check className="h-4.5 w-4.5" aria-hidden="true" />
        ) : (
          <ShoppingCart className="h-4.5 w-4.5" aria-hidden="true" />
        )}
        {outOfStock ? "Stoc epuizat" : justAdded ? "Adăugat în coș" : "Adaugă în coș"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={outOfStock}
      aria-label={`Adaugă „${book.title}” în coș`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-soft"
    >
      {justAdded ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
