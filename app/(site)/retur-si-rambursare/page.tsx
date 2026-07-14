import type { Metadata } from "next";
import { RotateCcw, Clock, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Retur și rambursare",
  description: "Politica de retur și rambursare pentru comenzile plasate pe BookStore.",
};

export default function ReturSiRambursarePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
        Retur și rambursare
      </h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Vrem să fii mulțumit de fiecare comandă. Dacă totuși o carte nu corespunde
        așteptărilor, o poți returna urmând pașii de mai jos.
      </p>

      <div className="mt-8 space-y-8">
        <section className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">Termen de retur</h2>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Ai la dispoziție 14 zile calendaristice de la primirea comenzii pentru a solicita
            returnarea produselor, cu condiția ca acestea să fie în starea inițială, nefolosite.
          </p>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">Cum returnezi</h2>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Scrie-ne la contact@bookstore.md cu numărul comenzii și motivul returului. Îți
            vom confirma adresa de retur și pașii următori în cel mai scurt timp.
          </p>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <Wallet className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">Rambursarea</h2>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Suma este rambursată în același mod în care a fost făcută plata, în termen de
            maximum 14 zile de la primirea produsului returnat.
          </p>
        </section>
      </div>
    </div>
  );
}
