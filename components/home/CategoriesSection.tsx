import Link from "next/link";
import { getPopularCategories } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";

export async function CategoriesSection() {
  const categories = await getPopularCategories(6);

  return (
    <section className="bg-cream-soft py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="font-medium uppercase tracking-widest text-terracotta">
            Explorează
          </p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-ink">
            Categorii populare
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/carti/categorie/${category.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl bg-card p-5 text-center shadow-sm ring-1 ring-border/70 transition-shadow hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-terracotta transition-colors group-hover:bg-terracotta/10">
                <CategoryIcon slug={category.slug} name={category.name} className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-ink group-hover:text-terracotta">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
