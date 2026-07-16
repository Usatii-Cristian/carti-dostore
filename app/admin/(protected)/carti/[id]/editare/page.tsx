import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategories } from "@/lib/categories";
import { getAllPublishers } from "@/lib/publishers";
import { getBookForEdit } from "@/lib/admin/books";
import { updateBook } from "@/lib/actions/admin-books";
import { BookForm } from "@/components/admin/BookForm";

export const metadata: Metadata = { title: "Editează cartea — Admin Dostore Carti" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBookPage({ params }: PageProps) {
  const { id } = await params;
  const [book, categories, publishers] = await Promise.all([
    getBookForEdit(id),
    getAllCategories(),
    getAllPublishers(),
  ]);

  if (!book) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Editează „{book.title}”</h1>
      <BookForm
        action={updateBook.bind(null, id)}
        categories={categories}
        publishers={publishers}
        initialBook={book}
      />
    </div>
  );
}
