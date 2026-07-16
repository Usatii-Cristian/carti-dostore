import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { getAdminPublishers } from "@/lib/admin/publishers";
import { deletePublisher } from "@/lib/actions/admin-publishers";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Edituri — Admin Dostore Carti" };

export default async function AdminPublishersPage() {
  const publishers = await getAdminPublishers();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Edituri</h1>
        <Link
          href="/admin/edituri/nou"
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Editură nouă
        </Link>
      </div>

      {publishers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Building2 className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
          <p className="mt-3 text-sm text-slate-600">
            Nu ai adăugat încă nicio editură. Adaugă una ca s-o poți alege la cărți.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Editură</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Cărți</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publishers.map((publisher) => (
                <tr key={publisher.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                      <span className="font-medium text-slate-900">{publisher.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{publisher.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{publisher.bookCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <DeleteButton
                        action={deletePublisher.bind(null, publisher.id)}
                        confirmMessage={`Sigur ștergi editura „${publisher.name}”?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
