"use client";

import { useEffect, useState } from "react";
import { Menu, X, BookOpen } from "lucide-react";
import { AdminNavLinks } from "./AdminNavLinks";
import { LogoutButton } from "./LogoutButton";

export function AdminMobileNav({ adminEmail }: { adminEmail?: string | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-navy-dark px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2 text-white">
        <BookOpen className="h-5 w-5" aria-hidden="true" />
        <span className="font-semibold">BookStore Admin</span>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Deschide meniul"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Închide meniul"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-dark px-4 py-6">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="font-semibold text-white">Meniu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Închide meniul"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/10"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1">
              <AdminNavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-white/10 pt-4">
              {adminEmail && (
                <p className="mb-2 truncate px-3 text-xs text-slate-400">{adminEmail}</p>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
