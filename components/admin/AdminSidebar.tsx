import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AdminNavLinks } from "./AdminNavLinks";
import { LogoutButton } from "./LogoutButton";

export function AdminSidebar({ adminEmail }: { adminEmail?: string | null }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy-dark px-4 py-6 lg:flex">
      <Link href="/admin" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="font-semibold text-white">BookStore Admin</span>
      </Link>

      <div className="flex-1">
        <AdminNavLinks />
      </div>

      <div className="border-t border-white/10 pt-4">
        {adminEmail && <p className="mb-2 truncate px-3 text-xs text-slate-400">{adminEmail}</p>}
        <LogoutButton />
      </div>
    </aside>
  );
}
