"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/books";
import type { CatalogFacets } from "@/lib/catalog";

type Props = {
  facets: CatalogFacets;
  minPrice?: number;
  maxPrice?: number;
};

function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-navy">{title}</h3>
      {children}
    </div>
  );
}

function CheckboxRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const disabled = count === 0 && !checked;

  return (
    <label
      className={`flex items-center gap-2.5 py-1.5 text-sm ${
        disabled ? "cursor-not-allowed text-ink-soft/50" : "cursor-pointer text-ink-soft hover:text-ink"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-border text-terracotta accent-terracotta focus:ring-1 focus:ring-terracotta"
      />
      <span className="flex-1">{label}</span>
      <span className="text-xs tabular-nums text-ink-soft/70">({count})</span>
    </label>
  );
}

export function FacetSidebar({ facets, minPrice, maxPrice }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedCategories = (params.get("categorii") ?? "").split(",").filter(Boolean);

  // Valorile din slider trăiesc local ca să nu lovim serverul la fiecare pixel;
  // se comit în URL abia la eliberarea mouse-ului (onPointerUp/onChange final).
  const [localMin, setLocalMin] = useState(minPrice ?? facets.priceMin);
  const [localMax, setLocalMax] = useState(maxPrice ?? facets.priceMax);

  // Sincronizăm sliderul local cu URL-ul când filtrele se schimbă din altă parte.
  /* eslint-disable react-hooks/set-state-in-effect -- sync intenționat prop→state */
  useEffect(() => {
    setLocalMin(minPrice ?? facets.priceMin);
    setLocalMax(maxPrice ?? facets.priceMax);
  }, [minPrice, maxPrice, facets.priceMin, facets.priceMax]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function apply(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page"); // orice schimbare de filtru te duce înapoi la pagina 1
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  function toggleCategory(slug: string, checked: boolean) {
    const next = checked
      ? [...selectedCategories, slug]
      : selectedCategories.filter((value) => value !== slug);
    apply((params) => {
      if (next.length > 0) params.set("categorii", next.join(","));
      else params.delete("categorii");
    });
  }

  function toggleFlag(key: string, checked: boolean) {
    apply((params) => {
      if (checked) params.set(key, "1");
      else params.delete(key);
    });
  }

  function commitPrice(min: number, max: number) {
    apply((params) => {
      if (min > facets.priceMin) params.set("minPrice", String(min));
      else params.delete("minPrice");
      if (max < facets.priceMax) params.set("maxPrice", String(max));
      else params.delete("maxPrice");
    });
  }

  const activeCount =
    selectedCategories.length +
    (params.get("reduceri") ? 1 : 0) +
    (params.get("bestsellers") ? 1 : 0) +
    (params.get("noutati") ? 1 : 0) +
    (params.get("minPrice") || params.get("maxPrice") ? 1 : 0);

  const span = Math.max(1, facets.priceMax - facets.priceMin);
  const leftPct = ((localMin - facets.priceMin) / span) * 100;
  const rightPct = ((localMax - facets.priceMin) / span) * 100;

  const content = (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-navy">Sortează după</h3>
        <select
          value={params.get("sort") ?? "noi"}
          onChange={(event) =>
            apply((params) => {
              if (event.target.value === "noi") params.delete("sort");
              else params.set("sort", event.target.value);
            })
          }
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-ink focus:border-terracotta focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <FacetGroup title="Preț">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={localMin}
              min={facets.priceMin}
              max={localMax}
              onChange={(event) => setLocalMin(Number(event.target.value))}
              onBlur={() => commitPrice(localMin, localMax)}
              aria-label="Preț minim"
              className="w-full rounded-lg border border-border bg-card py-2 pl-3 pr-10 text-sm tabular-nums text-ink focus:border-terracotta focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-ink-soft">
              MDL
            </span>
          </div>
          <span className="text-ink-soft">—</span>
          <div className="relative flex-1">
            <input
              type="number"
              value={localMax}
              min={localMin}
              max={facets.priceMax}
              onChange={(event) => setLocalMax(Number(event.target.value))}
              onBlur={() => commitPrice(localMin, localMax)}
              aria-label="Preț maxim"
              className="w-full rounded-lg border border-border bg-card py-2 pl-3 pr-10 text-sm tabular-nums text-ink focus:border-terracotta focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-ink-soft">
              MDL
            </span>
          </div>
        </div>

        {/* Slider cu două capete: două input[range] suprapuse peste o bară comună. */}
        <div className="relative mt-4 h-5">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-terracotta"
            style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
          />
          <input
            type="range"
            min={facets.priceMin}
            max={facets.priceMax}
            value={localMin}
            aria-label="Preț minim (glisor)"
            onChange={(event) => setLocalMin(Math.min(Number(event.target.value), localMax))}
            onPointerUp={() => commitPrice(localMin, localMax)}
            onKeyUp={() => commitPrice(localMin, localMax)}
            className="pointer-events-none absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cream [&::-webkit-slider-thumb]:bg-terracotta [&::-webkit-slider-thumb]:shadow"
          />
          <input
            type="range"
            min={facets.priceMin}
            max={facets.priceMax}
            value={localMax}
            aria-label="Preț maxim (glisor)"
            onChange={(event) => setLocalMax(Math.max(Number(event.target.value), localMin))}
            onPointerUp={() => commitPrice(localMin, localMax)}
            onKeyUp={() => commitPrice(localMin, localMax)}
            className="pointer-events-none absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cream [&::-webkit-slider-thumb]:bg-terracotta [&::-webkit-slider-thumb]:shadow"
          />
        </div>
      </FacetGroup>

      <FacetGroup title="Oferte">
        <CheckboxRow
          label="Doar la reducere"
          count={facets.reduceri}
          checked={params.get("reduceri") === "1"}
          onChange={(checked) => toggleFlag("reduceri", checked)}
        />
      </FacetGroup>

      <FacetGroup title="Categorie">
        {facets.categorii.map((option) => (
          <CheckboxRow
            key={option.value}
            label={option.label}
            count={option.count}
            checked={selectedCategories.includes(option.value)}
            onChange={(checked) => toggleCategory(option.value, checked)}
          />
        ))}
      </FacetGroup>

      <FacetGroup title="Etichete">
        <CheckboxRow
          label="Bestsellers"
          count={facets.bestsellers}
          checked={params.get("bestsellers") === "1"}
          onChange={(checked) => toggleFlag("bestsellers", checked)}
        />
        <CheckboxRow
          label="Noutăți"
          count={facets.noutati}
          checked={params.get("noutati") === "1"}
          onChange={(checked) => toggleFlag("noutati", checked)}
        />
      </FacetGroup>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-terracotta hover:text-terracotta"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Resetează filtrele ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobil: filtrele stau într-un sertar, ca să nu împingă produsele în jos. */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-sm font-semibold text-cream lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filtre{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative ml-auto h-full w-[85%] max-w-sm overflow-y-auto bg-cream p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">Filtre</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Închide filtrele"
                className="rounded-full p-1.5 text-ink-soft hover:bg-cream-soft hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}

      <aside aria-label="Filtre produse" className="hidden shrink-0 lg:block lg:w-64">
        {content}
      </aside>
    </>
  );
}
