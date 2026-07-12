import Link from "next/link";
import { Search, Heart, ShoppingCart } from "lucide-react";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function MainHeader() {
  return (
    <div className="border-b border-border bg-cream">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
        <MobileMenu />
        <Logo />

        <form
          action="/cautare"
          method="GET"
          role="search"
          className="order-last w-full sm:order-none sm:flex-1"
        >
          <label htmlFor="site-search" className="sr-only">
            Caută cărți, autori sau categorii
          </label>
          <div className="relative">
            <input
              id="site-search"
              type="search"
              name="q"
              placeholder="Caută cărți, autori sau categorii..."
              className="w-full rounded-full border border-border bg-card py-2.5 pl-4 pr-11 text-sm text-ink placeholder:text-ink-soft focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/30"
            />
            <button
              type="submit"
              aria-label="Caută"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-terracotta text-cream transition-colors hover:bg-terracotta-dark"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <Link
            href="/favorite"
            aria-label="Favorite"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-cream-soft"
          >
            <Heart className="h-5.5 w-5.5" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-cream">
              0
            </span>
          </Link>

          <Link
            href="/cos"
            aria-label="Coșul de cumpărături"
            className="flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 text-navy hover:bg-cream-soft"
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <ShoppingCart className="h-5.5 w-5.5" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-cream">
                0
              </span>
            </span>
            <span className="hidden text-sm font-semibold sm:inline">0 lei</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
