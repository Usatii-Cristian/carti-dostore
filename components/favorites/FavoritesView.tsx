"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/lib/store/favorites";
import { BookGrid } from "@/components/books/BookGrid";

export function FavoritesView() {
  const items = useFavoritesStore((state) => state.items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-terracotta">
          <Heart className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Nu ai nicio carte favorită
        </h1>
        <p className="mt-3 text-ink-soft">
          Apasă pe inimioara de pe orice carte ca s-o salvezi aici pentru mai târziu.
        </p>
        <Link
          href="/carti/bestsellers"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
        >
          Vezi bestsellers
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Favorite</h1>
      <p className="mt-2 text-ink-soft">
        {items.length} {items.length === 1 ? "carte salvată" : "cărți salvate"}
      </p>

      <div className="mt-8">
        <BookGrid books={items} variant="wide" />
      </div>
    </div>
  );
}
