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
            <li>• Chișinău — 60 lei</li>
            <li>• Restul Republicii Moldova — 85 lei</li>
            <li>• Livrare în 1-3 zile lucrătoare, prin FAN Courier</li>
            <li>• Costul nu depinde de valoarea comenzii</li>
          </ul>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">Plată online prin MIA</h2>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Plătești instant, direct din aplicația băncii tale: la finalizarea comenzii îți
            generăm un cod QR pe care îl scanezi și confirmi plata. Funcționează din aplicația
            oricărei bănci participante la MIA, sistemul național de plăți instant al Băncii
            Naționale a Moldovei. Datele cardului sau ale contului tău nu trec prin site-ul
            nostru.
          </p>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <Banknote className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">Plata la livrare</h2>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Poți plăti și la primirea coletului, cu cardul sau în numerar, direct curierului.
            Pentru această opțiune se adaugă o taxă de ramburs de 15 lei la costul comenzii.
          </p>
        </section>
      </div>
    </div>
  );
}
