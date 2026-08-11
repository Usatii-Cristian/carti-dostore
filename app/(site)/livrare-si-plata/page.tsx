import type { Metadata } from "next";
import Image from "next/image";
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
            <li>
              • Livrăm exclusiv prin curier — nu avem magazin fizic și nici ridicare personală,
              deci livrarea face parte din orice comandă, iar costul ei apare separat în coș și
              la finalizarea comenzii, înainte de plată.
            </li>
          </ul>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">
              MIA Plăți Instant (MIA Instant Payments)
            </h2>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Plătești instant, direct din aplicația băncii tale: la finalizarea comenzii îți
            generăm un cod QR pe care îl scanezi și confirmi plata. Funcționează din aplicația
            oricărei bănci participante la MIA, sistemul național de plăți instant al Băncii
            Naționale a Moldovei. Datele cardului sau ale contului tău nu trec prin site-ul
            nostru.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            După confirmarea plății primești pe email bonul electronic al cumpărăturii, cu
            produsele achitate, suma, metoda de plată și referința tranzacției.
          </p>
          <Image
            src="/plati/mia-logo.svg"
            alt="MIA Plăți Instant"
            width={291}
            height={54}
            className="mt-4 h-8 w-auto"
          />
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
