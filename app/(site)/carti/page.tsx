import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getCatalogSnapshot } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export const metadata: Metadata = {
  title: "Toate produsele",
  description:
    "Cărți, uleiuri esențiale, materiale de training și promoționale — filtrează după categorie, preț și oferte.",
};

/**
 * Catalogul: serverul aduce TOATE produsele într-o singură interogare cachată,
 * iar filtrarea, sortarea și „afișează mai multe" se fac în browser, instant.
 *
 * Înainte, fiecare bifă declanșa o navigare și șapte interogări în baza de date
 * — vizibil ca pauză la fiecare click, pentru un catalog de câteva zeci de
 * produse. Filtrele din adresă sunt citite în continuare, ca linkurile deja
 * trimise (sau cele partajate) să deschidă aceeași selecție.
 */
// ISR: pagina nu depinde de niciun parametru din adresă, deci se prerandează o
// dată și se servește din CDN pentru toată lumea. Filtrele din link sunt citite
// în browser, de componenta de catalog.
export const revalidate = 300;

export default async function CatalogPage() {
  const snapshot = await getCatalogSnapshot();

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

      {/* Suspense: CatalogBrowser citește adresa (useSearchParams), iar pagina
          rămâne prerandată — fără boundary, Next ar face-o dinamică. */}
      <Suspense fallback={<p className="text-sm text-ink-soft">Se încarcă produsele…</p>}>
        <CatalogBrowser snapshot={snapshot} />
      </Suspense>
    </div>
  );
}
