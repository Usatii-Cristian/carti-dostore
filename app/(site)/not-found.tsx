import Link from "next/link";
import { BookX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-soft text-terracotta">
        <BookX className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-serif text-3xl font-semibold text-ink sm:text-4xl">
        Pagina nu a fost găsită
      </h1>
      <p className="mt-3 text-ink-soft">
        Cartea sau pagina pe care o cauți nu există sau a fost mutată. Poate a fost ștearsă
        din catalog, sau adresa e greșită.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
        >
          Înapoi la BookStore
        </Link>
        <Link
          href="/carti/bestsellers"
          className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
        >
          Vezi bestsellers
        </Link>
      </div>
    </div>
  );
}
