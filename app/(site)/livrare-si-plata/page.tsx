import type { Metadata } from "next";
import { Truck, CreditCard, Banknote } from "lucide-react";

export const metadata: Metadata = {
  title: "Livrare și plată",
  description: "Află tot ce trebuie despre livrare și metodele de plată disponibile pe Dostore Carti.",
};

export default function LivrareSiPlataPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
        Livrare și plată
      </h1>

      <div className="mt-8 space-y-8">
        <section className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">Livrare</h2>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li>• Livrare gratuită pentru comenzi peste 199 lei</li>
            <li>• Transport 39 lei pentru comenzi sub 199 lei</li>
            <li>• Livrare în 1-3 zile lucrătoare, oriunde în Moldova</li>
          </ul>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">Plată online</h2>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Plătești în siguranță cu cardul bancar, printr-o conexiune criptată, prin maib
            (Moldova Agroindbank).
          </p>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <Banknote className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">Ramburs la livrare</h2>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Poți alege și plata numerar, direct la curier, în momentul livrării comenzii.
          </p>
        </section>
      </div>
    </div>
  );
}
