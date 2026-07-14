import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Întrebări frecvente",
  description: "Răspunsuri la cele mai frecvente întrebări despre comenzi, livrare și plată pe Dostore Carti.",
};

const faqs = [
  {
    question: "Cât durează livrarea?",
    answer:
      "Comenzile sunt livrate în 1-3 zile lucrătoare, oriunde în Moldova, de la confirmarea comenzii.",
  },
  {
    question: "Ce metode de plată acceptați?",
    answer:
      "Poți plăti online cu cardul bancar, prin maib, sau ramburs la livrare, direct la curier.",
  },
  {
    question: "Pot returna o carte dacă nu îmi place?",
    answer:
      "Da, ai la dispoziție 14 zile calendaristice de la primirea comenzii pentru a returna produsul, conform politicii de retur.",
  },
  {
    question: "Livrarea este gratuită?",
    answer:
      "Livrarea este gratuită pentru comenzile de peste 199 lei. Sub această valoare, costul de transport este de 39 lei.",
  },
  {
    question: "Cum verific statusul comenzii mele?",
    answer:
      "Vei primi un email de confirmare imediat după plasarea comenzii. Pentru orice detaliu suplimentar, ne poți contacta oricând la contact@bookstore.md.",
  },
  {
    question: "Aveți cărți în stoc pe care nu le văd pe site?",
    answer:
      "Catalogul afișat este actualizat constant. Dacă o carte nu apare, cel mai probabil nu este momentan disponibilă — ne poți scrie și verificăm posibilitatea de reaprovizionare.",
  },
];

export default function IntrebariFrecventePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
        Întrebări frecvente
      </h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Cele mai comune întrebări ale clienților noștri. Nu găsești răspunsul? Scrie-ne pe
        pagina de contact.
      </p>

      <div className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl bg-card p-5 shadow-sm ring-1 ring-border/70 open:ring-terracotta/40"
          >
            <summary className="cursor-pointer list-none font-semibold text-ink marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {faq.question}
                <span className="shrink-0 text-terracotta transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-ink-soft">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
