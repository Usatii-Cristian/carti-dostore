"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type Faq = {
  question: string;
  answer: string;
  defaultOpen: boolean;
};

/**
 * Un rând de acordeon. Animăm `height` de la 0 la înălțimea REALĂ a
 * conținutului (măsurată din DOM), nu de la un `max-height` ghicit — cu
 * max-height, răspunsurile scurte se deschid instant iar cele lungi se taie.
 */
function FaqItem({ faq, open, onToggle }: { faq: Faq; open: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const measure = () => setHeight(element.scrollHeight);
    measure();

    // Dacă textul se re-așază (redimensionare fereastră, font încărcat târziu),
    // recalculăm ca animația să nu rămână cu o înălțime veche.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [faq.answer]);

  return (
    <div className="border-b border-border last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 py-4 text-left"
        >
          <span className="font-medium text-ink">{faq.question}</span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-terracotta transition-transform duration-300 ease-out ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>

      <div
        style={{ height: open ? height : 0 }}
        className="overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
      >
        <div ref={contentRef} className="pb-4 pr-8 text-sm leading-relaxed text-ink-soft">
          {faq.answer}
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  // Cel mult unul deschis din start (adminul poate bifa doar unul).
  const [openIndex, setOpenIndex] = useState<number | null>(() => {
    const index = faqs.findIndex((faq) => faq.defaultOpen);
    return index === -1 ? null : index;
  });

  if (faqs.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-2 font-serif text-2xl font-semibold text-ink">Întrebări frecvente</h2>
      <div className="mt-4 rounded-xl border border-border bg-card px-5">
        {faqs.map((faq, index) => (
          <FaqItem
            key={faq.question + index}
            faq={faq}
            open={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}
