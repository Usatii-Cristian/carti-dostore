"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

export type FaqDraft = {
  question: string;
  answer: string;
  defaultOpen: boolean;
};

/**
 * Editor de întrebări frecvente pentru un produs.
 *
 * Trimite datele ca un singur câmp JSON (`faqs`), ca să nu trebuiască nume
 * indexate în FormData — Server Action-ul îl parsează. „Deschisă implicit" e
 * exclusiv (radio, nu checkbox): două acordeoane deschise din start ar face
 * pagina să sară, deci permitem cel mult unul.
 */
export function FaqEditor({ initialFaqs = [] }: { initialFaqs?: FaqDraft[] }) {
  const [faqs, setFaqs] = useState<FaqDraft[]>(initialFaqs);

  function update(index: number, patch: Partial<FaqDraft>) {
    setFaqs((current) =>
      current.map((faq, i) => (i === index ? { ...faq, ...patch } : faq))
    );
  }

  function setDefaultOpen(index: number) {
    setFaqs((current) =>
      current.map((faq, i) => ({ ...faq, defaultOpen: i === index ? !faq.defaultOpen : false }))
    );
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="faqs" value={JSON.stringify(faqs)} />

      {faqs.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          Niciun FAQ încă. Adaugă întrebări pe care clienții le pun des despre acest produs.
        </p>
      )}

      {faqs.map((faq, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-200 bg-slate-50/60 p-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <GripVertical className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Întrebarea {index + 1}
            </span>
            <button
              type="button"
              onClick={() => setFaqs((current) => current.filter((_, i) => i !== index))}
              className="ml-auto rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label={`Șterge întrebarea ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <input
            value={faq.question}
            onChange={(event) => update(index, { question: event.target.value })}
            placeholder="Ex: Cum se folosește acest ulei?"
            className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
          <textarea
            value={faq.answer}
            onChange={(event) => update(index, { answer: event.target.value })}
            rows={3}
            placeholder="Răspunsul, pe înțelesul clientului."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />

          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={faq.defaultOpen}
              onChange={() => setDefaultOpen(index)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Deschisă implicit pe pagina produsului
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setFaqs((current) => [...current, { question: "", answer: "", defaultOpen: false }])
        }
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Adaugă o întrebare
      </button>
    </div>
  );
}
