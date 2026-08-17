import type { Metadata } from "next";
import Link from "next/link";
import { getCatalogSnapshot, parseCatalogQuery } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export const metadata: Metadata = {
  title: "Toate produsele",
  description:
    "Cărți, uleiuri esențiale, materiale de training și promoționale — filtrează după categorie, preț și oferte.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
export default async function CatalogPage({ searchParams }: PageProps) {
  const [snapshot, search] = await Promise.all([getCatalogSnapshot(), searchParams]);
  const initial = parseCatalogQuery(search);

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

      <CatalogBrowser snapshot={snapshot} initial={initial} />
    </div>
  );
}
