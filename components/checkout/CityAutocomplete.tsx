"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

type Suggestion = { city: string; county: string; label: string };

/**
 * Câmpul „Oraș / localitate" din checkout, cu sugestii din lista oficială FAN
 * Courier (1521 localități). Pe lângă `city`, scrie într-un input ascuns și
 * `county` (raionul) — FAN îl cere obligatoriu la generarea AWB-ului, iar
 * clientul n-are de unde să-l știe, deci îl deducem din localitatea aleasă.
 */
export function CityAutocomplete({
  defaultCity = "",
  defaultCounty = "",
  inputClassName,
}: {
  defaultCity?: string;
  defaultCounty?: string;
  inputClassName?: string;
}) {
  const [value, setValue] = useState(defaultCity);
  const [county, setCounty] = useState(defaultCounty);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- golim lista la input prea scurt
      setSuggestions([]);
      return;
    }

    // Debounce: nu interogăm la fiecare tastă.
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/shipping/localitati?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(data.results ?? []);
      } catch {
        // abort sau rețea picată — lăsăm lista goală, câmpul rămâne utilizabil
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  // Închide lista la click în afara componentei.
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function select(suggestion: Suggestion) {
    setValue(suggestion.city);
    setCounty(suggestion.county);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id="city"
        name="city"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setCounty(""); // orice editare manuală invalidează raionul dedus
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="address-level2"
        placeholder="Începe să scrii localitatea…"
        className={inputClassName}
      />
      {/* Raionul călătorește odată cu formularul, dar nu-l cerem clientului. */}
      <input type="hidden" name="county" value={county} />

      {loading && (
        <Loader2
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-soft"
          aria-hidden="true"
        />
      )}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
          {suggestions.map((suggestion) => (
            <li key={suggestion.label}>
              <button
                type="button"
                onClick={() => select(suggestion)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-cream-soft"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-terracotta" aria-hidden="true" />
                <span className="font-medium">{suggestion.city}</span>
                <span className="text-xs text-ink-soft">{suggestion.county}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {county && (
        <p className="mt-1 text-xs text-ink-soft">
          Raion: <span className="font-medium text-ink">{county}</span>
        </p>
      )}
    </div>
  );
}
