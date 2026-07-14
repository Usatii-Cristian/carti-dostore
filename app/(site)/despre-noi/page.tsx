import type { Metadata } from "next";
import { BookOpen, Heart, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Despre noi",
  description: "Povestea BookStore — librăria ta online din Moldova.",
};

export default function DespreNoiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Despre noi</h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        BookStore a pornit dintr-o pasiune simplă: cărțile bune ar trebui să ajungă ușor la
        cititorii din Moldova, indiferent de oraș. Am construit o librărie online unde
        alegem cu grijă fiecare titlu — de la literatură română și universală, până la
        dezvoltare personală, psihologie și cărți pentru cei mici.
      </p>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Lucrăm direct cu edituri de încredere și livrăm rapid, oriunde în țară, pentru că
        știm cât de mult contează să ții cartea potrivită în mână la momentul potrivit.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl bg-card p-6 text-center shadow-sm ring-1 ring-border/70">
          <BookOpen className="mx-auto h-7 w-7 text-terracotta" aria-hidden="true" />
          <p className="mt-3 font-semibold text-ink">Cărți alese cu grijă</p>
          <p className="mt-1 text-sm text-ink-soft">Un catalog curatoriat, nu doar unul mare.</p>
        </div>
        <div className="rounded-xl bg-card p-6 text-center shadow-sm ring-1 ring-border/70">
          <Truck className="mx-auto h-7 w-7 text-terracotta" aria-hidden="true" />
          <p className="mt-3 font-semibold text-ink">Livrare rapidă</p>
          <p className="mt-1 text-sm text-ink-soft">Oriunde în Moldova, în 1-3 zile lucrătoare.</p>
        </div>
        <div className="rounded-xl bg-card p-6 text-center shadow-sm ring-1 ring-border/70">
          <Heart className="mx-auto h-7 w-7 text-terracotta" aria-hidden="true" />
          <p className="mt-3 font-semibold text-ink">Făcut cu drag</p>
          <p className="mt-1 text-sm text-ink-soft">Pentru cititorii de acasă.</p>
        </div>
      </div>
    </div>
  );
}
