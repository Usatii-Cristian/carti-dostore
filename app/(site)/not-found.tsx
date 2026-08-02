import Link from "next/link";
import { Home, Search } from "lucide-react";
import { NotFoundRedirect } from "@/components/layout/NotFoundRedirect";

/**
 * 404 pentru rutele magazinului care cheamă `notFound()` (ex. o carte ștearsă).
 * Se randează în interiorul layout-ului public, deci păstrează header+footer.
 * Pentru adresele care nu se potrivesc cu nicio rută vezi app/global-not-found.tsx.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="font-serif text-[5rem] font-semibold leading-none text-terracotta/25 sm:text-[7rem]">
        404
      </p>

      <h1 className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
        Pagina nu a fost găsită
      </h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Cartea sau pagina pe care o cauți nu există sau a fost mutată. Hai să te ducem
        înapoi la cărți.
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
    </div>
  );
}
