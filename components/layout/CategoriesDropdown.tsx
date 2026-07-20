"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";

type Cat = { id: string; name: string; slug: string };

export function CategoriesDropdown({ categories }: { categories: Cat[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Panoul e poziționat `fixed`, ancorat sub buton, ca să nu fie tăiat de
  // containerul nav-ului (care are overflow-x-auto pentru scroll-ul linkurilor).
  const reposition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom, left: rect.left });
  }, []);

  const show = useCallback(() => {
    reposition();
    setOpen(true);
  }, [reposition]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (
        !triggerRef.current?.contains(t) &&
        !panelRef.current?.contains(t)
      ) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, reposition]);

  return (
    <div
      className="shrink-0"
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 whitespace-nowrap transition-colors hover:text-gold"
      >
        Categorii
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed z-50 pt-2"
          style={{ top: pos.top, left: pos.left }}
          onMouseEnter={show}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="grid w-[34rem] max-w-[90vw] grid-cols-2 gap-0.5 rounded-xl border border-border bg-card p-3 shadow-xl">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/carti?categorii=${cat.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-cream-soft hover:text-terracotta"
              >
                <CategoryIcon
                  slug={cat.slug}
                  name={cat.name}
                  className="h-4 w-4 shrink-0 text-terracotta"
                />
                {cat.name}
              </Link>
            ))}
            <Link
              href="/categorii"
              onClick={() => setOpen(false)}
              className="col-span-2 mt-1 border-t border-border pt-2.5 text-center text-sm font-semibold text-navy transition-colors hover:text-terracotta"
            >
              Vezi toate categoriile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
