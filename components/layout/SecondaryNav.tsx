import Link from "next/link";
import { secondaryNavLinks } from "@/lib/nav-links";

export function SecondaryNav() {
  return (
    <nav
      aria-label="Navigație principală"
      className="hidden bg-navy md:block"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 text-sm font-medium text-cream/90 sm:px-6 lg:px-8">
        {secondaryNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap transition-colors hover:text-gold"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
