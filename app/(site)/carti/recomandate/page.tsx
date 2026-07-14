import type { Metadata } from "next";
import { getTopRatedBooks } from "@/lib/books";
import { SimpleBookListing } from "@/components/catalog/SimpleBookListing";

export const metadata: Metadata = {
  title: "Top recomandări",
  description: "Cărțile cel mai bine evaluate de cititorii Dostore Carti.",
};

export default async function RecomandatePage() {
  const books = await getTopRatedBooks(24);

  return (
    <SimpleBookListing
      title="Top recomandări"
      subtitle="Cele mai bine evaluate cărți din librăria noastră"
      books={books}
      emptyMessage="Nu avem recomandări momentan — revino în curând."
    />
  );
}
