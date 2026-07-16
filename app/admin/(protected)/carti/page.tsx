import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, AlertTriangle, PackageX } from "lucide-react";
import { getAdminBooks, getStockAlerts, LOW_STOCK_THRESHOLD } from "@/lib/admin/books";
import { deleteBook } from "@/lib/actions/admin-books";
import { formatPrice, formatBookCount } from "@/lib/format";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const metadata: Metadata = { title: "Cărți — Admin Dostore Carti" };

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminBooksPage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ books, total, totalPages }, alerts] = await Promise.all([
    getAdminBooks({ q, page }),
    getStockAlerts(),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cărți</h1>
          <p className="text-sm text-slate-500">{formatBookCount(total)} în total</p>
        </div>
        <Link
          href="/admin/carti/nou"
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Carte nouă
        </Link>
      </div>

      {(alerts.outOfStock > 0 || alerts.lowStock > 0) && (
        <div className="mb-5 flex flex-col gap-2 sm:flex-row">
          {alerts.outOfStock > 0 && (
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <PackageX className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              {alerts.outOfStock}{" "}
              {alerts.outOfStock === 1 ? "carte fără stoc" : "cărți fără stoc"} (ascunse de pe
              site)
            </div>
          )}
          {alerts.lowStock > 0 && (
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              {alerts.lowStock}{" "}
              {alerts.lowStock === 1 ? "carte cu stoc redus" : "cărți cu stoc redus"} (≤{" "}
              {LOW_STOCK_THRESHOLD})
            </div>
          )}
        </div>
      )}

      <form method="GET" className="mb-5">
        <div className="relative max-w-sm">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Caută după titlu sau autor..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Carte</th>
              <th className="px-4 py-3">Categorie</th>
              <th className="px-4 py-3">Preț</th>
              <th className="px-4 py-3">Stoc</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      <Image
                        src={book.coverImage}
                        alt={`Coperta cărții ${book.title}`}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{book.title}</p>
                      <p className="truncate text-xs text-slate-500">{book.author}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{book.category.name}</td>
                <td className="px-4 py-3 text-slate-900">{formatPrice(book.price)}</td>
                <td className="px-4 py-3">
                  {book.stock <= 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      <PackageX className="h-3 w-3" aria-hidden="true" /> Epuizat
                    </span>
                  ) : book.stock <= LOW_STOCK_THRESHOLD ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Redus · {book.stock}
                    </span>
                  ) : (
                    <span className="text-slate-600">{book.stock}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/carti/${book.id}/editare`}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-navy hover:bg-navy/5"
                    >
                      Editează
                    </Link>
                    <DeleteButton
                      action={deleteBook.bind(null, book.id)}
                      confirmMessage={`Sigur ștergi „${book.title}”?`}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {books.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Nicio carte găsită.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        basePath="/admin/carti"
        currentPage={page}
        totalPages={totalPages}
        query={{ q }}
      />
    </div>
  );
}
