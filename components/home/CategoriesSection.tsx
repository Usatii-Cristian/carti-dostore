import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getPopularCategories } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";

export async function CategoriesSection() {
  const categories = await getPopularCategories(6);

  return (
    <section className="bg-cream-soft py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="font-medium uppercase tracking-widest text-terracotta">Explorează</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-ink">Categorii populare</h2>
        </div>

        {/* Toate pe un rând pe desktop. Când categoria are imagine, ea umple
            partea de sus a cardului; altfel rămâne iconița. */}
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/carti?categorii=${category.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-border/70 transition-shadow hover:shadow-md"
              >
                {category.image ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center pt-6">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-terracotta transition-colors group-hover:bg-terracotta/10">
                      <CategoryIcon slug={category.slug} name={category.name} className="h-6 w-6" />
                    </span>
                  </div>
                )}

                <div className={`flex flex-1 flex-col p-5 ${category.image ? "" : "text-center"}`}>
                  <h3 className="font-serif text-lg font-semibold leading-snug text-ink group-hover:text-terracotta">
                    {category.name}
                  </h3>
                  <span
                    className={`mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-terracotta ${
                      category.image ? "" : "justify-center"
                    }`}
                  >
                    Vezi produsele
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
