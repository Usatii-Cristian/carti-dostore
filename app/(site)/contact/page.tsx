import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Datele de contact BookStore — telefon, email, adresă și program de lucru.",
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
          href="tel:+37322000000"
          className="flex items-start gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70 transition-colors hover:ring-terracotta/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
            <Phone className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">Telefon</p>
            <p className="mt-1 text-sm text-ink-soft">+373 22 000 000</p>
          </div>
        </a>

        <a
          href="mailto:contact@bookstore.md"
          className="flex items-start gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70 transition-colors hover:ring-terracotta/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">Email</p>
            <p className="mt-1 text-sm text-ink-soft">contact@bookstore.md</p>
          </div>
        </a>

        <div className="flex items-start gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">Adresă</p>
            <p className="mt-1 text-sm text-ink-soft">Str. Ismail 47, Chișinău, Moldova</p>
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
    </div>
  );
}
