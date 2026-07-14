import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryForEdit } from "@/lib/admin/categories";
import { updateCategory } from "@/lib/actions/admin-categories";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Editează categoria — Admin Dostore Carti" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await getCategoryForEdit(id);

  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Editează „{category.name}”
      </h1>
      <CategoryForm action={updateCategory.bind(null, id)} initialCategory={category} />
    </div>
  );
}
