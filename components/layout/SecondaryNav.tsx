import Link from "next/link";
import { secondaryNavLinks, secondaryNavRightLinks } from "@/lib/nav-links";
import { getAllCategories } from "@/lib/categories";
import { CategoriesTrigger, CategoriesPanel } from "./CategoriesDropdown";

export async function SecondaryNav() {
  const categories = await getAllCategories();

  return (
    // `group` + `relative` pe toată bara: meniul de categorii coboară sub ea, pe
    // toată lățimea, când butonul e hover/focus (vezi CategoriesPanel).
    <nav aria-label="Navigație principală" className="group relative hidden bg-navy md:block">
      {/* Trei zone: butonul de categorii (stânga), linkurile de catalog
          distribuite egal (centru), linkurile instituționale (dreapta). */}
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2.5 text-sm font-medium text-cream/90 sm:px-6 lg:px-8">
        <CategoriesTrigger />

        <div className="flex flex-1 items-center justify-center gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {secondaryNavLinks
            .filter((link) => link.href !== "/categorii")
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 whitespace-nowrap transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
        </div>

        <div className="flex shrink-0 items-center gap-6">
          {secondaryNavRightLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <CategoriesPanel categories={categories} />
    </nav>
  );
}
