import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2,
  Store,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";

// Conținut fix, scris în cod: pagina se prerandează la build și se servește
// din CDN, fără nicio revalidare — răspuns instant.
export const revalidate = false;

export const metadata: Metadata = {
  title: "Contact",
  description: "Datele de contact Dostore Carti — telefon, email, adresă și program de lucru.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
          Suntem la un mesaj distanță
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-ink sm:text-4xl">Contact</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          Ai o întrebare despre o comandă, un produs sau o colaborare? Scrie-ne ori sună-ne —
          răspundem în aceeași zi lucrătoare.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Coloana de acțiuni: ce face clientul cel mai des — sună sau scrie. */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="tel:+37368812853"
              className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/70 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-terracotta/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
                <Phone className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Telefon
              </p>
              <p className="mt-1 font-serif text-xl font-semibold text-ink">+373 68 812 853</p>
              <p className="mt-1 text-sm text-ink-soft">Luni–Vineri, 09:00–18:00</p>
              <ArrowUpRight
                className="absolute right-5 top-5 h-4 w-4 text-ink-soft/40 transition-colors group-hover:text-terracotta"
                aria-hidden="true"
              />
            </a>

            <a
              href="mailto:dostore.moldova@gmail.com"
              className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/70 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-terracotta/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Email
              </p>
              <p className="mt-1 break-all font-serif text-xl font-semibold text-ink">
                dostore.moldova@gmail.com
              </p>
              <p className="mt-1 text-sm text-ink-soft">Răspundem în aceeași zi lucrătoare</p>
              <ArrowUpRight
                className="absolute right-5 top-5 h-4 w-4 text-ink-soft/40 transition-colors group-hover:text-terracotta"
                aria-hidden="true"
              />
            </a>
          </div>

          {/* Trei informații scurte, pe un singur rând — nu merită câte un card
              întreg fiecare, cum era înainte (rămânea și unul orfan pe rând). */}
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-border/70 shadow-sm ring-1 ring-border/70 sm:grid-cols-3">
            <div className="flex items-start gap-3 bg-card p-5">
              <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-terracotta" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Program
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">Luni–Vineri, 09:00–18:00</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card p-5">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-terracotta" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Livrare
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  Toată Moldova, prin FAN Courier
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card p-5">
              <Store className="mt-0.5 h-4.5 w-4.5 shrink-0 text-terracotta" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Punct de vânzare
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  Exclusiv online, fără magazin fizic
                </dd>
              </div>
            </div>
          </dl>

          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-ink-soft">
                Cauți un produs anume sau ai nevoie de o comandă mai mare? Spune-ne ce îți trebuie
                și îți răspundem cu disponibilitate și termen de livrare.
              </p>
            </div>
            <Link
              href="/intrebari-frecvente"
              className="shrink-0 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
            >
              Întrebări frecvente
            </Link>
          </div>
        </div>

        {/* Datele firmei, adunate într-un singur panou — inclusiv adresa
            juridică, cerută de BNM la verificarea comerciantului pentru MIA. */}
        <aside className="h-fit rounded-2xl bg-navy p-7 text-cream shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream/10 text-gold">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-serif text-xl font-semibold">Date companie</h2>
          <p className="mt-1 text-sm text-cream/60">
            Pentru facturi și corespondență oficială
          </p>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-cream/50">Denumire</dt>
              <dd className="mt-1 font-medium">Free Life SRL</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-cream/50">Cod fiscal (IDNO)</dt>
              <dd className="mt-1 font-medium tabular-nums">1025600059594</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-cream/50">Adresa juridică</dt>
              <dd className="mt-1 font-medium leading-relaxed">
                Str. Petru Zadnipru 19/2
                <br />
                Chișinău, Republica Moldova
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-cream/50">IBAN</dt>
              <dd className="mt-1 break-all font-medium">
                MD46VI022511400000572MDL
                <span className="block text-cream/60">VictoriaBank</span>
              </dd>
            </div>
          </dl>

          <p className="mt-6 border-t border-cream/10 pt-4 text-xs leading-relaxed text-cream/60">
            Magazinul funcționează exclusiv online: nu avem punct de vânzare fizic și nici
            ridicare personală de la sediu. Toate comenzile se livrează prin curier.
          </p>
        </aside>
      </div>
    </div>
  );
}
