import type { Metadata } from "next";
import { Search } from "lucide-react";
import { searchBooks } from "@/lib/search";
import { BookGrid } from "@/components/books/BookGrid";

export const metadata: Metadata = {
  title: "Căutare — BookStore",
  description: "Caută cărți, autori sau categorii pe BookStore.",
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function CautarePage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-terracotta">
          <Search className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Caută pe BookStore
        </h1>
        <p className="mt-3 text-ink-soft">
          Caută după titlu, autor sau categorie, folosind bara de căutare din antet.
        </p>
      </div>
    );
  }

  const { books } = await searchBooks(query);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
          Rezultate pentru <span className="text-terracotta">„{query}”</span>
        </h1>
        <p className="mt-2 text-ink-soft">
          {books.length === 0
            ? "Niciun rezultat"
            : `${books.length} ${books.length === 1 ? "rezultat" : "rezultate"}`}
        </p>
      </div>

      <BookGrid
        books={books}
        variant="wide"
        emptyMessage="Nu am găsit nimic pentru această căutare. Încearcă alți termeni sau explorează categoriile."
      />
    </div>
  );
}
