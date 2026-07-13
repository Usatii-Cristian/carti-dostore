import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQueryString } from "@/lib/url";

export function AdminPagination({
  basePath,
  currentPage,
  totalPages,
  query,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  query: Record<string, string | number | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => `${basePath}${buildQueryString({ ...query, page })}`;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginare" className="mt-6 flex items-center justify-center gap-1.5">
      <Link
        href={hrefFor(Math.max(1, currentPage - 1))}
        aria-label="Pagina anterioară"
        aria-disabled={currentPage === 1}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 transition-colors ${
          currentPage === 1
            ? "pointer-events-none text-slate-300"
            : "text-slate-600 hover:border-navy hover:text-navy"
        }`}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={hrefFor(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-navy text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={hrefFor(Math.min(totalPages, currentPage + 1))}
        aria-label="Pagina următoare"
        aria-disabled={currentPage === totalPages}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none text-slate-300"
            : "text-slate-600 hover:border-navy hover:text-navy"
        }`}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}
