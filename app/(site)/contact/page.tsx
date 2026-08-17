import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, Building2, Store } from "lucide-react";

// Conținut fix, scris în cod: pagina se prerandează la build și se servește
// din CDN, fără nicio revalidare — răspuns instant.
export const revalidate = false;

export const metadata: Metadata = {
  title: "Contact",
  description: "Datele de contact Dostore Carti — telefon, email, adresă și program de lucru.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Contact</h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Ai o întrebare despre o comandă, o carte sau o colaborare? Scrie-ne sau sună-ne —
        îți răspundem în cel mai scurt timp.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <a
          href="tel:+37368812853"
          className="flex items-start gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70 transition-colors hover:ring-terracotta/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
            <Phone className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">Telefon</p>
            <p className="mt-1 text-sm text-ink-soft">+373 68 812 853</p>
          </div>
        </a>

        <a
          href="mailto:dostore.moldova@gmail.com"
          className="flex items-start gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70 transition-colors hover:ring-terracotta/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">Email</p>
            <p className="mt-1 text-sm text-ink-soft">dostore.moldova@gmail.com</p>
          </div>
        </a>

        {/* Adresa juridică se afișează AICI, obligatoriu: BNM a cerut-o expres
            pe pagina de Contact, la verificarea comerciantului pentru MIA. */}
        <div className="flex items-start gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">Adresa juridică</p>
            <p className="mt-1 text-sm text-ink-soft">
              Free Life SRL, cod fiscal 1025600059594
              <br />
              Str. Petru Zadnipru 19/2, Chișinău, Republica Moldova
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">Livrare</p>
            <p className="mt-1 text-sm text-ink-soft">În toată Republica Moldova, prin FAN Courier</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">Program</p>
            <p className="mt-1 text-sm text-ink-soft">Luni–Vineri, 09:00–18:00</p>
          </div>
        </div>
      </div>

      {/* Vânzare exclusiv online — declarat explicit, cum cere BNM: dacă nu
          există punct de vânzare fizic, comerciantul trebuie să spună asta. */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-border p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
          <Store className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-ink">Punct de vânzare</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Dostore Cărți funcționează exclusiv online: nu avem magazin fizic și nici ridicare
            personală de la sediu. Toate comenzile se livrează prin curier, în toată Republica
            Moldova. Adresa de mai sus este sediul juridic al companiei, pentru corespondență
            oficială.
          </p>
        </div>
      </div>
    </div>
  );
}
