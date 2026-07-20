import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories, getCategoryBySlug } from "@/lib/categories";
import { getBooksByCategory, type CategorySort, SORT_OPTIONS } from "@/lib/books";
import { formatBookCount } from "@/lib/format";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { Pagination } from "@/components/catalog/Pagination";
import { BookGrid } from "@/components/books/BookGrid";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

function parseSort(value: string | undefined): CategorySort {
  const valid = SORT_OPTIONS.map((option) => option.value);
  return valid.includes(value as CategorySort) ? (value as CategorySort) : "noi";
}

function parsePositiveNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return {};

  const description = `Descoperă cărți din categoria ${category.name}, cu livrare rapidă în Moldova.`;

  return {
    title: category.name,
    description,
    openGraph: { title: category.name, description },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(search.page) || 1);
  const sort = parseSort(search.sort);
  const minPrice = parsePositiveNumber(search.minPrice);
  const maxPrice = parsePositiveNumber(search.maxPrice);

  const [{ books, total, totalPages }, categories] = await Promise.all([
    getBooksByCategory({ categoryId: category.id, page, sort, minPrice, maxPrice }),
    getAllCategories(),
  ]);

  const basePath = `/carti/categorie/${slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/" className="hover:text-terracotta">
          Acasă
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{category.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <CategorySidebar categories={categories} currentSlug={slug} />

        <div>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="font-serif text-3xl font-semibold text-ink">{category.name}</h1>
            <p className="text-sm text-ink-soft">{formatBookCount(total)}</p>
          </div>

          <p className="mb-4 text-sm text-ink-soft">
            Vrei să combini mai multe categorii sau să filtrezi după preț și oferte?{" "}
            <Link
              href={`/carti?categorii=${slug}`}
              className="font-semibold text-terracotta hover:text-terracotta-dark"
            >
              Vezi toate filtrele →
            </Link>
          </p>

          <CatalogFilters basePath={basePath} sort={sort} minPrice={minPrice} maxPrice={maxPrice} />

          <div className="mt-6">
            <BookGrid
              books={books}
              variant="compact"
              emptyMessage="Nu am găsit cărți care să corespundă filtrelor alese."
            />
          </div>

          <Pagination
            basePath={basePath}
            currentPage={page}
            totalPages={totalPages}
            query={{ sort, minPrice, maxPrice }}
          />
        </div>
      </div>
    </div>
  );
}
