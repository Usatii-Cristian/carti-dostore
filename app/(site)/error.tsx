"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-soft text-terracotta">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-serif text-3xl font-semibold text-ink sm:text-4xl">
        A apărut o eroare
      </h1>
      <p className="mt-3 text-ink-soft">
        Ne pare rău, ceva nu a mers bine. Te rugăm încearcă din nou — dacă problema persistă,
        contactează-ne.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
        >
          Încearcă din nou
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
        >
          Înapoi la BookStore
        </Link>
      </div>
    </div>
  );
}
