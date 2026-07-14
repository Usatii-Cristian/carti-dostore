import type { Metadata } from "next";
import { Briefcase, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Cariere",
  description: "Alătură-te echipei Dostore Carti.",
};

export default function CarierePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Cariere</h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Suntem o echipă mică, pasionată de cărți și de cititorii din Moldova. Nu avem
        posturi deschise chiar acum, dar suntem mereu curioși să cunoaștem oameni
        talentați care iubesc ceea ce facem.
      </p>

      <div className="mt-8 flex items-start gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
          <Briefcase className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-ink">Nicio poziție deschisă momentan</p>
          <p className="mt-1 text-sm text-ink-soft">
            Trimite-ne oricând un CV la adresa de mai jos — îl păstrăm pentru viitoarele
            oportunități.
          </p>
          <a
            href="mailto:cariere@bookstore.md"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:underline"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            cariere@bookstore.md
          </a>
        </div>
      </div>
    </div>
  );
}
