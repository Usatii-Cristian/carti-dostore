import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Categorii",
  description: "Toate categoriile de cărți disponibile pe BookStore.",
};

export default async function CategoriiPage() {
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Categorii</h1>
      <p className="mt-2 text-ink-soft">Explorează cărțile după categoria care te interesează</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/carti/categorie/${category.slug}`}
            className="group flex flex-col items-center gap-3 rounded-xl bg-card p-5 text-center shadow-sm ring-1 ring-border/70 transition-shadow hover:shadow-md"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-2xl transition-colors group-hover:bg-terracotta/10">
              {category.icon}
            </span>
            <span className="text-sm font-semibold text-ink group-hover:text-terracotta">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
