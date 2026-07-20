import Link from "next/link";
import type { Category } from "@prisma/client";
import { CategoryIcon } from "@/components/CategoryIcon";

export function CategorySidebar({
  categories,
  currentSlug,
}: {
  categories: Category[];
  currentSlug?: string;
}) {
  return (
    <nav aria-label="Categorii" className="shrink-0 lg:w-60">
      <h2 className="font-serif text-lg font-semibold text-ink">Categorii</h2>
      <ul className="mt-3 space-y-1">
        {categories.map((category) => {
          const isActive = category.slug === currentSlug;
          return (
            <li key={category.id}>
              <Link
                href={`/carti?categorii=${category.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-terracotta/10 font-semibold text-terracotta"
                    : "text-ink-soft hover:bg-cream-soft hover:text-ink"
                }`}
              >
                <CategoryIcon slug={category.slug} name={category.name} className="h-4 w-4 shrink-0" />
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
