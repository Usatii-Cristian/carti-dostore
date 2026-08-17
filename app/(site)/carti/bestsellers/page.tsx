import type { Metadata } from "next";
import { getBestsellers } from "@/lib/books";
import { SimpleBookListing } from "@/components/catalog/SimpleBookListing";

// Date din catalog: prerandate și reîmprospătate la 5 minute (ISR), plus
// invalidare imediată la orice modificare din admin.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bestsellers",
  description: "Cărțile cele mai apreciate și cumpărate de cititorii din Moldova.",
};

export default async function BestsellersPage() {
  const books = await getBestsellers(24);

  return (
    <SimpleBookListing
      title="Bestsellers"
      subtitle="Cărțile cele mai apreciate de cititorii noștri"
      books={books}
      emptyMessage="Nu avem bestsellers momentan — revino în curând."
      variant="compact"
    />
  );
}
