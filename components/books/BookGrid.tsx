import type { BookCardData } from "@/lib/types";
import { PackageX } from "lucide-react";
import { BookCard } from "./BookCard";

const VARIANT_CLASSES = {
  wide: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  // 6 pe rând pe desktop (cerut explicit pentru bestsellers) — cardurile se
  // strâng automat odată cu grid-ul, fără să schimbe BookCard.
  compact: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
};

export function BookGrid({
  books,
  variant = "wide",
  emptyMessage = "Nu am găsit nicio carte aici, momentan.",
}: {
  books: BookCardData[];
  variant?: keyof typeof VARIANT_CLASSES;
  emptyMessage?: string;
}) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
        <PackageX className="h-8 w-8 text-ink-soft" aria-hidden="true" />
        <p className="text-sm text-ink-soft">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 sm:gap-5 ${VARIANT_CLASSES[variant]}`}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
