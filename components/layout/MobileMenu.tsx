"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, Clock, ArrowRight } from "lucide-react";
import type { Category } from "@prisma/client";
import { secondaryNavLinks } from "@/lib/nav-links";
import { CategoryIcon } from "@/components/CategoryIcon";

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Deschide meniul"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md text-navy hover:bg-cream-soft"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Închide meniul"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-4/5 max-w-xs flex-col bg-navy text-cream shadow-xl">
            <div className="flex items-center justify-between border-b border-cream/10 px-4 py-4">
              <span className="font-serif text-lg font-semibold">Meniu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Închide meniul"
                className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-cream/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Navigație mobilă" className="flex flex-col overflow-y-auto px-2 py-4">
              {/* Categoriile, câte una pe rând, cu imaginea fiecăreia — accesibile
                  direct din meniu, fără să mai treci printr-o pagină separată. */}
              <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-widest text-cream/50">
                Categorii
              </p>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/carti?categorii=${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-cream/10 hover:text-gold"
                >
                  {category.image ? (
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-cream/10">
                      <Image src={category.image} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream/10">
                      <CategoryIcon slug={category.slug} name={category.name} className="h-4 w-4" />
                    </span>
                  )}
                  <span className="flex-1">{category.name}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                </Link>
              ))}

              <div className="my-3 border-t border-cream/10" />

              {secondaryNavLinks
                .filter((link) => link.href !== "/categorii")
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-cream/10 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>

            <div className="mt-auto space-y-2 border-t border-cream/10 px-4 py-4 text-sm text-cream/80">
              <a href="tel:+37368812853" className="flex items-center gap-2 hover:text-gold">
                <Phone className="h-4 w-4" aria-hidden="true" />
                +373 68 812 853
              </a>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Luni–Vineri, 09:00–18:00
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
