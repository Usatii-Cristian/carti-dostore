import type { Metadata } from "next";
import { getDiscountedBooks } from "@/lib/books";
import { SimpleBookListing } from "@/components/catalog/SimpleBookListing";

// Date din catalog: prerandate și reîmprospătate la 5 minute (ISR), plus
// invalidare imediată la orice modificare din admin.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Reduceri",
  description: "Cărți la preț redus, pentru o vreme limitată.",
};

export default async function ReduceriPage() {
  const books = await getDiscountedBooks(24);

  return (
    <SimpleBookListing
      title="Reduceri"
      subtitle="Cărți alese, la prețuri mai mici pentru o vreme"
      books={books}
      emptyMessage="Nu avem reduceri momentan — revino în curând."
    />
  );
}
