import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCatalog, parseCatalogQuery } from "@/lib/catalog";
import { formatProductCount } from "@/lib/format";
import { FacetSidebar } from "@/components/catalog/FacetSidebar";
import { BookGrid } from "@/components/books/BookGrid";
import { buildQueryString } from "@/lib/url";

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

        {books.length < total && (
          <div className="mt-10 text-center">
            <Link
              href={`/carti${buildQueryString({
                sort: query.sort === "noi" ? undefined : query.sort,
                minPrice: query.minPrice,
                maxPrice: query.maxPrice,
                categorii: query.categorii.join(",") || undefined,
                reduceri: query.reduceri ? "1" : undefined,
                bestsellers: query.bestsellers ? "1" : undefined,
                noutati: query.noutati ? "1" : undefined,
                page: query.page + 1,
              })}`}
              scroll={false}
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
            >
              Afișează mai multe ({total - books.length} rămase)
            </Link>
          </div>
        )}
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
