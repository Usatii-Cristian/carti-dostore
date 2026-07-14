import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { AdminNavLinks } from "./AdminNavLinks";
import { LogoutButton } from "./LogoutButton";

export function AdminSidebar({ adminEmail }: { adminEmail?: string | null }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy-dark px-4 py-6 lg:flex">
      <Link href="/admin" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="font-semibold text-white">Dostore Carti Admin</span>
      </Link>

      <div className="flex-1">
        <AdminNavLinks />
      </div>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Vezi site-ul
        </Link>
        {adminEmail && <p className="truncate px-3 text-xs text-slate-400">{adminEmail}</p>}
        <LogoutButton />
      </div>
    </aside>
  );
}
