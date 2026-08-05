import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";
import { HeaderActions } from "./HeaderActions";
import { getAllCategories } from "@/lib/categories";

// Async ca să dea categoriile către meniul mobil — pe telefon, unde
// SecondaryNav (mega-meniul) e ascuns (`hidden md:block`), categoriile
// trebuie să fie accesibile din altă parte: din meniul hamburger.
export async function MainHeader() {
  const categories = await getAllCategories();

  return (
    // `relative`: meniul de pe telefon se ancorează de bara asta și coboară
    // exact sub ea (vezi MobileMenu, panoul cu `top-full`).
    <div className="relative border-b border-border bg-cream">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:gap-x-6 sm:px-6 sm:py-4 lg:px-8">
        <MobileMenu categories={categories} />
        <Logo />
        {/* Sub `sm` căutarea nu mai stă aici, ci pe un rând propriu, sub bară
            (vezi Header.tsx): bara rămâne lipită la scroll pe telefon, iar cu
            căutarea în ea ocupa peste 200px din ecran. */}
        <div className="hidden sm:block sm:flex-1">
          <SearchBar />
        </div>
        <HeaderActions />
      </div>
    </div>
  );
}
