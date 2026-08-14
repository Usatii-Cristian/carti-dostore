"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check, ListChecks } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import type { BookCardData } from "@/lib/types";

export function AddToCartButton({
  book,
  variant = "icon",
}: {
  book: BookCardData;
  variant?: "icon" | "full";
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  // Produsele cu mai multe tipuri (etichete, cărți în mai multe limbi) NU pot fi
  // adăugate direct din listă: n-am ști ce tip vrea clientul, iar în coș ar
  // ajunge o linie fără variantă, imposibil de expediat corect. Butonul devine
  // link către pagina produsului, unde se alege tipul și cantitatea.
  const hasVariants = (book.variants?.length ?? 0) > 0;

  function handleAdd() {
    addItem(book);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  if (hasVariants) {
    return (
      <Link
        href={`/carti/${book.slug}`}
        aria-label={`Alege tipul pentru „${book.title}”`}
        title="Alege tipul dorit"
        className={
          variant === "full"
            ? "flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
            : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream transition-colors hover:bg-terracotta-dark"
        }
      >
        <ListChecks className={variant === "full" ? "h-4.5 w-4.5" : "h-4 w-4"} aria-hidden="true" />
        {variant === "full" && "Alege tipul"}
      </Link>
    );
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
      >
        {justAdded ? (
          <Check className="h-4.5 w-4.5" aria-hidden="true" />
        ) : (
          <ShoppingCart className="h-4.5 w-4.5" aria-hidden="true" />
        )}
        {justAdded ? "Adăugat în coș" : "Adaugă în coș"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={`Adaugă „${book.title}” în coș`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream transition-colors hover:bg-terracotta-dark"
    >
      {justAdded ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
