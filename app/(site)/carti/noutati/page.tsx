import type { Metadata } from "next";
import { getNewBooks } from "@/lib/books";
import { SimpleBookListing } from "@/components/catalog/SimpleBookListing";

export const metadata: Metadata = {
  title: "Noutăți — BookStore",
  description: "Cele mai proaspete apariții editoriale, disponibile acum pe BookStore.",
};

export default async function NoutatiPage() {
  const books = await getNewBooks();

  return (
    <SimpleBookListing
      title="Noutăți"
      subtitle="Cele mai proaspete apariții editoriale"
      books={books}
      emptyMessage="Nu avem noutăți momentan — revino în curând."
    />
  );
}
