"use client";

import { useState } from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";
import type { BookCardData } from "@/lib/types";

export type Variant = { label: string; price?: number | null; stock?: number };

/**
 * Alegerea tipurilor pentru produsele care se vând în mai multe variante
 * (etichetele au 14 tipuri, cărțile pot fi în 3 limbi).
 *
 * Clientul pune cantitate pe fiecare tip și adaugă totul dintr-un singur click:
 * cine vrea 2 seturi „Suplimente" și 1 „Top 10 provocări" face o singură
 * operație, iar în coș apar ca linii separate.
 */
export function VariantPicker({
  book,
  variants,
  compact = false,
  onAdded,
}: {
  book: BookCardData;
  variants: Variant[];
  /** În fereastra din catalog nu repetăm titlul și cadrul secțiunii. */
  compact?: boolean;
  /** Anunță părintele (fereastra) că s-a adăugat, ca să se poată închide. */
  onAdded?: () => void;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState(false);

  function setQuantity(label: string, value: number, maxStock: number) {
    setQuantities((current) => ({ ...current, [label]: Math.max(0, Math.min(maxStock, value)) }));
    setJustAdded(false);
  }

  const chosen = variants.filter((variant) => (quantities[variant.label] ?? 0) > 0);
  const totalPieces = chosen.reduce((sum, v) => sum + (quantities[v.label] ?? 0), 0);
  const totalPrice = chosen.reduce(
    (sum, v) => sum + (v.price ?? book.discountPrice ?? book.price) * (quantities[v.label] ?? 0),
    0
  );

  function handleAdd() {
    for (const variant of chosen) {
      addItem(
        variant.price != null ? { ...book, price: variant.price, discountPrice: null } : book,
        quantities[variant.label] ?? 0,
        variant.label
      );
    }
    setQuantities({});
    setJustAdded(true);
    onAdded?.();
    window.setTimeout(() => setJustAdded(false), 2500);
  }

  return (
    <div className={compact ? "" : "mt-6 rounded-xl border border-border bg-card p-4 sm:p-5"}>
      {!compact && (
        <>
          <h2 className="font-serif text-lg font-semibold text-ink">Alege tipul</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Pune cantitatea dorită la fiecare tip. Poți comanda mai multe tipuri odată.
          </p>
        </>
      )}

      <ul className="mt-4 divide-y divide-border">
        {variants.map((variant) => {
          const quantity = quantities[variant.label] ?? 0;
          const maxStock = variant.stock ?? 0;
          const isOutOfStock = maxStock === 0;

          return (
            <li
              key={variant.label}
              className={`flex flex-wrap items-center justify-between gap-3 py-2.5 ${isOutOfStock ? "opacity-50" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">
                  {variant.label}
                  {isOutOfStock && <span className="ml-2 text-xs font-semibold text-red-600">Epuizat</span>}
                  {!isOutOfStock && maxStock > 0 && maxStock <= 5 && (
                    <span className="ml-2 text-xs text-orange-600">Doar {maxStock} în stoc</span>
                  )}
                </p>
                {variant.price != null && (
                  <p className="text-xs text-ink-soft">{formatPrice(variant.price)}</p>
                )}
              </div>

              <div
                className={`flex items-center gap-1 rounded-full border ${
                  quantity > 0 ? "border-terracotta bg-terracotta/5" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(variant.label, quantity - 1, maxStock)}
                  disabled={quantity === 0 || isOutOfStock}
                  aria-label={`Scade cantitatea pentru ${variant.label}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink sm:h-8 sm:w-8 transition-colors hover:bg-cream-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(variant.label, quantity + 1, maxStock)}
                  disabled={quantity >= maxStock || isOutOfStock}
                  aria-label={`Crește cantitatea pentru ${variant.label}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink sm:h-8 sm:w-8 transition-colors hover:bg-cream-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={handleAdd}
        disabled={totalPieces === 0}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {justAdded ? (
          <>
            <Check className="h-4.5 w-4.5" aria-hidden="true" />
            Adăugat în coș
          </>
        ) : (
          <>
            <ShoppingCart className="h-4.5 w-4.5" aria-hidden="true" />
            {totalPieces === 0
              ? "Alege cel puțin un tip"
              : `Adaugă în coș · ${totalPieces} buc. · ${formatPrice(totalPrice)}`}
          </>
        )}
      </button>
    </div>
  );
}
