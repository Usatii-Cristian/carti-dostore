import Link from "next/link";
import { getBestsellers } from "@/lib/books";
import { BookGrid } from "@/components/books/BookGrid";

export async function BestsellersSection() {
  const books = await getBestsellers(6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-medium uppercase tracking-widest text-terracotta">
            Cele mai populare
          </p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-ink">
            Cărți bestsellers
          </h2>
        </div>
        <Link
          href="/carti/bestsellers"
          className="hidden shrink-0 text-sm font-semibold text-terracotta hover:text-terracotta-dark sm:block"
        >
          Vezi toate →
        </Link>
      </div>

      <BookGrid books={books} variant="compact" />
    </section>
  );
}
