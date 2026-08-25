"use client";

import { useState } from "react";
import { ShoppingCart, Check, PackageX } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { VariantDialog } from "./VariantDialog";
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
  const [pickerOpen, setPickerOpen] = useState(false);

  // Produsele cu mai multe tipuri (etichete, cărți în mai multe limbi) NU pot fi
  // adăugate direct din listă: n-am ști ce tip vrea clientul, iar în coș ar
  // ajunge o linie fără variantă, imposibil de expediat corect. Butonul deschide
  // o fereastră în care alegerea tipului e obligatorie.
  const hasVariants = (book.variants?.length ?? 0) > 0;

  // Produsele marcate „nu este în stoc" din admin rămân vizibile în catalog,
  // dar nu se pot comanda: butonul e inactiv, iar serverul refuză oricum
  // comanda dacă produsul ajunge în coș pe altă cale (coș vechi din
  // localStorage, dinainte ca produsul să se epuizeze).
  const outOfStock = book.inStock === false;

  function handleAdd() {
    addItem(book);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  if (outOfStock) {
    return variant === "full" ? (
      <span className="flex cursor-not-allowed items-center gap-2 rounded-full bg-ink/10 px-7 py-3 font-semibold text-ink-soft">
        <PackageX className="h-4.5 w-4.5" aria-hidden="true" />
        Stoc epuizat
      </span>
    ) : (
      <span
        aria-label={`„${book.title}” nu este în stoc`}
        title="Nu este în stoc"
        className="flex h-11 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-ink/10 text-ink-soft sm:h-9 sm:w-9"
      >
        <PackageX className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }

  if (hasVariants) {
    return (
      <>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-label={`Alege tipul pentru „${book.title}”`}
          title="Alege tipul dorit"
          className={
            variant === "full"
              ? "flex cursor-pointer items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
              : "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-terracotta sm:h-9 sm:w-9 text-cream transition-colors hover:bg-terracotta-dark"
          }
        >
          {/* Aceeași iconiță de coș ca la restul produselor — clientul nu are de
              ce să vadă un buton diferit; diferența apare abia la apăsare, când
              se deschide fereastra de alegere a tipului. */}
          <ShoppingCart
            className={variant === "full" ? "h-4.5 w-4.5" : "h-4 w-4"}
            aria-hidden="true"
          />
          {variant === "full" && "Adaugă în coș"}
        </button>

        {pickerOpen && (
          <VariantDialog
            book={book}
            variants={book.variants ?? []}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </>
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
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta sm:h-9 sm:w-9 text-cream transition-colors hover:bg-terracotta-dark"
    >
      {justAdded ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
