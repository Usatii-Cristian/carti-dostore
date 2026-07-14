"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminErrorPage({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">A apărut o eroare</h1>
      <p className="mt-2 text-sm text-slate-500">
        Ceva nu a mers bine în panoul de administrare.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark"
      >
        Încearcă din nou
      </button>
    </div>
  );
}
