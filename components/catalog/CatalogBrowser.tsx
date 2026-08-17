"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FacetSidebar, type FacetValue } from "./FacetSidebar";
import { BookGrid } from "@/components/books/BookGrid";
import { formatProductCount } from "@/lib/format";
import { CATALOG_PAGE_SIZE, parseCatalogQuery, type CatalogBook, type CatalogSnapshot } from "@/lib/catalog";

/**
 * Catalogul: datele vin de la server (o singură interogare, cachată), filtrarea
 * și sortarea se fac aici, în browser.
 *
 * Motivul e simplu: fiecare bifă însemna înainte o navigare completă și șapte
 * interogări în baza de date, deci o pauză vizibilă la fiecare click. Produsele
 * sunt câteva zeci — le ținem în memorie și filtrăm instant, fără niciun drum
 * la server. Adresa paginii se actualizează totuși (fără reîncărcare), ca un
 * link cu filtre să poată fi trimis mai departe.
 */
export function CatalogBrowser({ snapshot }: { snapshot: CatalogSnapshot }) {
  const [value, setValue] = useState<FacetValue>({
    categorii: [],
    minPrice: snapshot.priceMin,
    maxPrice: snapshot.priceMax,
    reduceri: false,
    bestsellers: false,
    noutati: false,
    sort: "recomandat",
  });
  const [visiblePages, setVisiblePages] = useState(1);

  // Filtrele din adresă (/carti?categorii=…) se aplică aici: la deschiderea unui
  // link partajat, DAR și când clientul e deja pe pagină și alege o categorie din
  // meniul din antet — acela e un link intern, deci componenta nu se remontează
  // și fără urmărirea adresei filtrul nu s-ar aplica (exact ce se întâmpla).
  // Pagina rămâne prerandată: adresa se citește în browser, nu pe server.
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  /* eslint-disable react-hooks/set-state-in-effect -- sincronizare intenționată adresă→stare */
  useEffect(() => {
    const params = new URLSearchParams(search);
    if ([...params.keys()].length === 0) return;

    const query = parseCatalogQuery(Object.fromEntries(params.entries()));
    setValue({
      categorii: query.categorii,
      minPrice: query.minPrice ?? snapshot.priceMin,
      maxPrice: query.maxPrice ?? snapshot.priceMax,
      reduceri: query.reduceri,
      bestsellers: query.bestsellers,
      noutati: query.noutati,
      sort: query.sort,
    });
    setVisiblePages(query.page);
  }, [search, snapshot.priceMin, snapshot.priceMax]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Ține adresa în pas cu filtrele, fără să renavigheze pagina. */
  function syncUrl(next: FacetValue) {
    const params = new URLSearchParams();
    if (next.categorii.length > 0) params.set("categorii", next.categorii.join(","));
    if (next.minPrice > snapshot.priceMin) params.set("minPrice", String(next.minPrice));
    if (next.maxPrice < snapshot.priceMax) params.set("maxPrice", String(next.maxPrice));
    if (next.reduceri) params.set("reduceri", "1");
    if (next.bestsellers) params.set("bestsellers", "1");
    if (next.noutati) params.set("noutati", "1");
    if (next.sort !== "recomandat") params.set("sort", next.sort);

    const query = params.toString();
    window.history.replaceState(null, "", query ? `/carti?${query}` : "/carti");
  }

  function update(next: FacetValue) {
    setValue(next);
    setVisiblePages(1); // orice schimbare de filtru repornește de la primul lot
    syncUrl(next);
  }

  // Filtrele care NU țin de categorie — le folosim și la numărătorile de pe
  // categorii, ca bifarea unei categorii să nu ducă restul la zero.
  const matchesCommon = useMemo(
    () => (book: CatalogBook) =>
      book.price >= value.minPrice &&
      book.price <= value.maxPrice &&
      (!value.reduceri || book.discountPrice != null) &&
      (!value.bestsellers || book.isBestseller) &&
      (!value.noutati || book.isNew),
    [value.minPrice, value.maxPrice, value.reduceri, value.bestsellers, value.noutati]
  );

  const filtered = useMemo(() => {
    const list = snapshot.books.filter(
      (book) =>
        matchesCommon(book) &&
        (value.categorii.length === 0 || value.categorii.includes(book.categorySlug))
    );

    const sorted = [...list];
    switch (value.sort) {
      case "pret-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "pret-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "noi":
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      default:
        sorted.sort(
          (a, b) => a.displayOrder - b.displayOrder || b.createdAt.localeCompare(a.createdAt)
        );
    }
    return sorted;
  }, [snapshot.books, matchesCommon, value.categorii, value.sort]);

  const facets = useMemo(() => {
    // Numărătorile respectă celelalte filtre active, dar ignoră selecția de
    // categorie — altfel bifarea uneia ar arăta „(0)" la toate celelalte.
    const base = snapshot.books.filter(matchesCommon);
    const withoutFlags = snapshot.books.filter(
      (book) => book.price >= value.minPrice && book.price <= value.maxPrice
    );

    return {
      categorii: snapshot.categories.map((category) => ({
        ...category,
        count: base.filter((book) => book.categorySlug === category.value).length,
      })),
      reduceri: withoutFlags.filter((book) => book.discountPrice != null).length,
      bestsellers: withoutFlags.filter((book) => book.isBestseller).length,
      noutati: withoutFlags.filter((book) => book.isNew).length,
      priceMin: snapshot.priceMin,
      priceMax: snapshot.priceMax,
    };
  }, [snapshot, matchesCommon, value.minPrice, value.maxPrice]);

  const visible = filtered.slice(0, visiblePages * CATALOG_PAGE_SIZE);
  const remaining = filtered.length - visible.length;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[256px_1fr]">
      <FacetSidebar
        facets={facets}
        value={value}
        onChange={update}
        onReset={() =>
          update({
            categorii: [],
            minPrice: snapshot.priceMin,
            maxPrice: snapshot.priceMax,
            reduceri: false,
            bestsellers: false,
            noutati: false,
            sort: "recomandat",
          })
        }
      />

      <div>
        <p className="mb-5 text-sm text-ink-soft">{formatProductCount(filtered.length)}</p>

        <BookGrid
          books={visible}
          variant="compact"
          emptyMessage="Niciun produs nu corespunde filtrelor alese. Încearcă să le relaxezi."
        />

        {remaining > 0 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setVisiblePages((current) => current + 1)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-7 py-3 font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
            >
              Afișează mai multe ({remaining} rămase)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
