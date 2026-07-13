import type { Metadata } from "next";
import { createCategory } from "@/lib/actions/admin-categories";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Categorie nouă — Admin BookStore" };

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Categorie nouă</h1>
      <CategoryForm action={createCategory} />
    </div>
  );
}
