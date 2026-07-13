"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { PriceTag } from "@/components/books/PriceTag";

type Suggestion = {
  slug: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  discountPrice: number | null;
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setOpen(true);
      } catch {
        // cerere anulată sau eșuată — ignorăm, sugestiile sunt un bonus
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative order-last w-full sm:order-none sm:flex-1">
      <form action="/cautare" method="GET" role="search">
        <label htmlFor="site-search" className="sr-only">
          Caută cărți, autori sau categorii
        </label>
        <div className="relative">
          <input
            id="site-search"
            type="search"
            name="q"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Caută cărți, autori sau categorii..."
            className="w-full rounded-full border border-border bg-card py-2.5 pl-4 pr-11 text-sm text-ink placeholder:text-ink-soft focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          />
          <button
            type="submit"
            aria-label="Caută"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-terracotta text-cream transition-colors hover:bg-terracotta-dark"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      {open && query.trim() && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {suggestions.map((book) => (
            <li key={book.slug}>
              <Link
                href={`/carti/${book.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-cream-soft"
              >
                <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-cream-soft">
                  <Image src={book.coverImage} alt="" fill sizes="36px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {book.title}
                  </span>
                  <span className="block truncate text-xs text-ink-soft">{book.author}</span>
                </span>
                <PriceTag price={book.price} discountPrice={book.discountPrice} size="sm" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
