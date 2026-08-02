"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, Clock, ArrowRight } from "lucide-react";
import type { Category } from "@prisma/client";
import { secondaryNavLinks } from "@/lib/nav-links";
import { CategoryIcon } from "@/components/CategoryIcon";

/**
 * Meniul de pe telefon. Două decizii importante:
 *
 * 1. Coboară SUB bara de sus (panou ancorat de header), nu mai iese ca sertar
 *    lateral — e mai aproape de degetul care apasă butonul.
 * 2. Panoul stă MEREU în DOM, ascuns doar vizual (`opacity`/`visibility`, nu
 *    `display:none` și nu randare condiționată). Înainte era `{open && …}`,
 *    deci imaginile categoriilor abia începeau să se descarce în clipa în care
 *    se deschidea meniul — de-aia apăreau cu întârziere. Acum se încarcă odată
 *    cu pagina și sunt deja în cache la deschidere.
 */
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
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md text-navy hover:bg-cream-soft"
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Fundalul întunecat acoperă pagina de sub bară în jos. Ancorat de bara
          principală (`top-full`), la fel ca panoul, ca să nu întunece header-ul.
          Nu e randat condiționat — doar se stinge, ca tranziția să fie lină. */}
      <button
        type="button"
        aria-label="Închide meniul"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={`absolute inset-x-0 top-full z-40 h-dvh bg-ink/50 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        // `inert` scoate complet panoul închis din navigarea cu tastatura și
        // din cititoarele de ecran, deși rămâne în DOM pentru preîncărcare.
        inert={!open}
        className={`absolute inset-x-0 top-full z-50 max-h-[80dvh] overflow-y-auto border-b border-cream/10 bg-navy text-cream shadow-xl transition-all duration-200 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <nav aria-label="Navigație mobilă" className="flex flex-col px-2 py-3">
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

          <div className="my-2 border-t border-cream/10" />

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

        <div className="space-y-2 border-t border-cream/10 px-4 py-4 text-sm text-cream/80">
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
  );
}
