import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCatalog, parseCatalogQuery } from "@/lib/catalog";
import { formatProductCount } from "@/lib/format";
import { FacetSidebar } from "@/components/catalog/FacetSidebar";
import { Pagination } from "@/components/catalog/Pagination";
import { BookGrid } from "@/components/books/BookGrid";

export const metadata: Metadata = {
  title: "Toate produsele",
  description:
    "Cărți, uleiuri esențiale, materiale de training și promoționale — filtrează după categorie, preț și oferte.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function CatalogContent({ searchParams }: PageProps) {
  const search = await searchParams;
  const query = parseCatalogQuery(search);
  const { books, total, totalPages, facets } = await getCatalog(query);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[256px_1fr]">
      <FacetSidebar facets={facets} minPrice={query.minPrice} maxPrice={query.maxPrice} />

      <div>
        <p className="mb-5 text-sm text-ink-soft">{formatProductCount(total)}</p>

        <BookGrid
          books={books}
          variant="compact"
          emptyMessage="Niciun produs nu corespunde filtrelor alese. Încearcă să le relaxezi."
        />

        <Pagination
          basePath="/carti"
          currentPage={query.page}
          totalPages={totalPages}
          query={{
            sort: query.sort,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
            categorii: query.categorii.join(",") || undefined,
            reduceri: query.reduceri ? "1" : undefined,
            bestsellers: query.bestsellers ? "1" : undefined,
            noutati: query.noutati ? "1" : undefined,
          }}
        />
      </div>
    </div>
  );
}

export default function CatalogPage(props: PageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/" className="hover:text-terracotta">
          Acasă
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Produse</span>
      </nav>

      <h1 className="mb-6 font-serif text-3xl font-semibold text-ink sm:text-4xl">Produse</h1>

      {/* FacetSidebar citește searchParams prin useSearchParams, deci are nevoie
          de un Suspense boundary ca pagina să nu devină integral dinamică. */}
      <Suspense fallback={<p className="text-sm text-ink-soft">Se încarcă produsele…</p>}>
        <CatalogContent {...props} />
      </Suspense>
    </div>
  );
}
