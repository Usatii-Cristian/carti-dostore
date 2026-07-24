import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import type { Category } from "@prisma/client";
import { CategoryIcon } from "@/components/CategoryIcon";

/**
 * Meniu de categorii — CSS pur, fără JavaScript.
 *
 * Se deschide ÎN JOS, pe toată lățimea barei de navigare (mega-menu), nu ca un
 * panou mic ancorat de buton. De aceea `group` + `relative` trăiesc pe
 * containerul barei (vezi SecondaryNav), iar panoul e `left-0 right-0`.
 *
 * Deschiderea se face din `group-hover` / `group-focus-within` — zero JS trimis
 * către browser, funcționează și înainte de hidratare, accesibil cu Tab.
 */

/** Butonul care declanșează meniul (stă în bară). */
export function CategoriesTrigger() {
  return (
    <button
      type="button"
      aria-haspopup="true"
      className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-terracotta px-4 py-2 font-semibold uppercase tracking-wide text-cream transition-colors hover:bg-terracotta-dark"
    >
      <Menu className="h-4 w-4" aria-hidden="true" />
      Categorii
      <ChevronDown
        className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
        aria-hidden="true"
      />
    </button>
  );
}

/** Panoul care coboară sub bară, pe toată lățimea. */
export function CategoriesPanel({ categories }: { categories: Category[] }) {
  return (
    <div className="invisible absolute inset-x-0 top-full z-50 pt-2.5 opacity-0 transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xl">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/carti?categorii=${category.slug}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-cream-soft hover:text-terracotta"
              >
                <CategoryIcon
                  slug={category.slug}
                  name={category.name}
                  className="h-5 w-5 shrink-0 text-terracotta"
                />
                {category.name}
              </Link>
            ))}
          </div>
          <Link
            href="/categorii"
            className="mt-3 block border-t border-border pt-3 text-center text-sm font-semibold text-navy transition-colors hover:text-terracotta"
          >
            Vezi toate categoriile →
          </Link>
        </div>
      </div>
    </div>
  );
}
