"use client";

import { useState } from "react";
import { Plus, Trash2, ListPlus } from "lucide-react";

export type VariantDraft = { label: string; price: string };

/**
 * Tipurile în care se vinde produsul (ex. cele 14 tipuri de etichete, sau cele
 * 3 limbi ale unei cărți). Se trimit ca un singur câmp JSON (`variants`), la fel
 * ca specificațiile și recenziile. Rândurile fără denumire se ignoră la salvare.
 *
 * Prețul e opțional: gol = costă cât produsul de bază.
 */
export function VariantEditor({ initialVariants = [] }: { initialVariants?: VariantDraft[] }) {
  const [variants, setVariants] = useState<VariantDraft[]>(initialVariants);
  const [bulk, setBulk] = useState("");

  function update(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  /** Lipești lista de tipuri, câte unul pe rând — pentru produsele cu 14 tipuri. */
  function addBulk() {
    const rows = bulk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((label) => ({ label, price: "" }));
    if (rows.length === 0) return;
    setVariants((current) => [...current, ...rows]);
    setBulk("");
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      {variants.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          Produsul se vinde într-un singur tip. Adaugă tipuri doar dacă are variante (culori,
          limbi, seturi diferite) — atunci clientul le alege pe pagina produsului.
        </p>
      )}

      {variants.map((variant, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            value={variant.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="Denumirea tipului (ex: Suplimente)"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
          />
          <input
            value={variant.price}
            onChange={(e) => update(index, { price: e.target.value })}
            placeholder="Preț (opțional)"
            inputMode="decimal"
            className="w-36 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setVariants((c) => c.filter((_, i) => i !== index))}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Șterge tipul"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setVariants((c) => [...c, { label: "", price: "" }])}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Adaugă un tip
      </button>

      <details className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          Adaugă mai multe tipuri deodată
        </summary>
        <p className="mt-2 text-xs text-slate-500">
          Lipește lista, câte un tip pe rând. Util la produsele cu 14 tipuri.
        </p>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={4}
          placeholder={"Soluții naturale pentru copii și bebeluși\nSoluții naturale pentru familie și casă\nSuplimente"}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
        <button
          type="button"
          onClick={addBulk}
          className="mt-2 flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          <ListPlus className="h-4 w-4" aria-hidden="true" />
          Adaugă lista
        </button>
      </details>
    </div>
  );
}
