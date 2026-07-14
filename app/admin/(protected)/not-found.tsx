import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 text-navy">
        <FileQuestion className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Pagina nu a fost găsită</h1>
      <p className="mt-2 text-sm text-slate-500">
        Elementul căutat nu există sau a fost șters.
      </p>
      <Link
        href="/admin"
        className="mt-6 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark"
      >
        Înapoi la dashboard
      </Link>
    </div>
  );
}
