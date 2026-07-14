import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCategories } from "@/lib/admin/categories";
import { deleteCategory } from "@/lib/actions/admin-categories";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CategoryIcon } from "@/components/CategoryIcon";

export const metadata: Metadata = { title: "Categorii — Admin Dostore Carti" };

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const categories = await getAdminCategories();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Categorii</h1>
        <Link
          href="/admin/categorii/nou"
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Categorie nouă
        </Link>
      </div>

      {error && (
        <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Categorie</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Cărți</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <CategoryIcon
                      slug={category.slug}
                      name={category.name}
                      className="h-4 w-4 shrink-0 text-slate-500"
                    />
                    <span className="font-medium text-slate-900">{category.name}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{category.slug}</td>
                <td className="px-4 py-3 text-slate-600">{category.bookCount}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/categorii/${category.id}/editare`}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-navy hover:bg-navy/5"
                    >
                      Editează
                    </Link>
                    <DeleteButton
                      action={deleteCategory.bind(null, category.id)}
                      confirmMessage={`Sigur ștergi categoria „${category.name}”?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
