"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { VariantPicker, type Variant } from "./VariantPicker";
import type { BookCardData } from "@/lib/types";

/**
 * Fereastra care se deschide când clientul apasă pe coș, în catalog, la un
 * produs care se vinde în mai multe tipuri.
 *
 * Fără ea, apăsarea adăuga în coș „produsul" generic — care nu există ca atare:
 * etichetele au 4 tipuri, cartonașele 14, iar comanda ajungea la noi fără să
 * știm ce trebuie pus în plic. Acum alegerea tipului e obligatorie: se poate
 * adăuga doar din lista de aici (sau de pe pagina produsului).
 */
export function VariantDialog({
  book,
  variants,
  onClose,
}: {
  book: BookCardData;
  variants: Variant[];
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Alege tipul pentru ${book.title}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (!panelRef.current?.contains(event.target as Node)) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">Alege tipul</p>
            <h2 className="mt-0.5 font-serif text-xl font-semibold text-ink">{book.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-cream-soft hover:text-ink"
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-2 text-sm text-ink-soft">
          Produsul se vinde în {variants.length} tipuri. Pune cantitatea la cele dorite — poți
          alege mai multe odată.
        </p>

        <div className="mt-3">
          <VariantPicker book={book} variants={variants} compact onAdded={onClose} />
        </div>

        <Link
          href={`/carti/${book.slug}`}
          className="mt-3 block text-center text-sm font-medium text-terracotta hover:text-terracotta-dark"
        >
          Vezi detaliile produsului
        </Link>
      </div>
    </div>
  );
}
