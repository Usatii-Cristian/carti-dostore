import { TopBar } from "./TopBar";
import { MainHeader } from "./MainHeader";
import { SecondaryNav } from "./SecondaryNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      <TopBar />
      <MainHeader />
      <SecondaryNav />
    </header>
  );
}
