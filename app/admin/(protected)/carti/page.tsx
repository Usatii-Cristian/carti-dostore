import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getAdminBooks } from "@/lib/admin/books";
import { deleteBook } from "@/lib/actions/admin-books";
import { formatPrice, formatBookCount } from "@/lib/format";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const metadata: Metadata = { title: "Cărți — Admin BookStore" };

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminBooksPage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { books, total, totalPages } = await getAdminBooks({ q, page });

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
                      <Image src={book.coverImage} alt="" fill sizes="40px" className="object-cover" />
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
                  <span
                    className={
                      book.stock < 5
                        ? "font-semibold text-red-600"
                        : "text-slate-600"
                    }
                  >
                    {book.stock}
                  </span>
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
