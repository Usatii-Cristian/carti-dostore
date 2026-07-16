import type { Metadata } from "next";
import { getAllCategories } from "@/lib/categories";
import { getAllPublishers } from "@/lib/publishers";
import { createBook } from "@/lib/actions/admin-books";
import { BookForm } from "@/components/admin/BookForm";

export const metadata: Metadata = { title: "Carte nouă — Admin Dostore Carti" };

export default async function NewBookPage() {
  const [categories, publishers] = await Promise.all([getAllCategories(), getAllPublishers()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Carte nouă</h1>
      <BookForm action={createBook} categories={categories} publishers={publishers} />
    </div>
  );
}
