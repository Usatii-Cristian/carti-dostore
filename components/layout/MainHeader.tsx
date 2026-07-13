import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";
import { HeaderActions } from "./HeaderActions";

export function MainHeader() {
  return (
    <div className="border-b border-border bg-cream">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
        <MobileMenu />
        <Logo />
        <SearchBar />
        <HeaderActions />
      </div>
    </div>
  );
}
