// 404 pentru adresele care nu se potrivesc cu NICIO rută.
//
// De ce e nevoie de acest fișier (și nu doar de app/(site)/not-found.tsx):
// aplicația are DOUĂ root layout-uri — app/(site)/layout.tsx și
// app/admin/layout.tsx — deci Next n-are un layout unic din care să compună un
// 404 global. Fără el, o adresă complet necunoscută primea pagina implicită
// „This page could not be found". Activat cu `experimental.globalNotFound` în
// next.config.ts.
//
// ATENȚIE: fișierul ocolește randarea normală, deci trebuie să-și aducă singur
// stilurile, fonturile ȘI documentul HTML complet (<html> + <body>).

import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import { BookX, Home, Search } from "lucide-react";
import { NotFoundRedirect } from "@/components/layout/NotFoundRedirect";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: ["600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită — Dostore Cărți",
  description: "Adresa căutată nu există pe Dostore Cărți.",
};

export default function GlobalNotFound() {
  return (
    <html lang="ro" className={`${playfairDisplay.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <p className="font-serif text-[5rem] font-semibold leading-none text-terracotta/25 sm:text-[7rem]">
            404
          </p>

          <span className="-mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-card text-terracotta shadow-sm ring-1 ring-border/70 sm:-mt-8">
            <BookX className="h-8 w-8" aria-hidden="true" />
          </span>

          <h1 className="mt-6 max-w-xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Pagina nu a fost găsită
          </h1>
          <p className="mt-3 max-w-md text-ink-soft">
            Adresa pe care ai deschis-o nu există sau a fost mutată. Hai să te ducem înapoi
            la cărți.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
            >
              <Home className="h-4.5 w-4.5" aria-hidden="true" />
              Pagina principală
            </Link>
            <Link
              href="/carti"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3 font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
            >
              <Search className="h-4.5 w-4.5" aria-hidden="true" />
              Vezi toate produsele
            </Link>
          </div>

          <NotFoundRedirect />
        </main>
      </body>
    </html>
  );
}
