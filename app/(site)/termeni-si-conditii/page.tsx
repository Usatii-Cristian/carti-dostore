import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description: "Termenii și condițiile de utilizare a magazinului online Dostore Carti.",
};

const sections = [
  {
    title: "1. Acceptarea termenilor",
    body: "Prin plasarea unei comenzi pe Dostore Carti ești de acord cu termenii și condițiile de mai jos. Dacă nu ești de acord cu ele, te rugăm să nu folosești acest site pentru achiziții.",
  },
  {
    title: "2. Produsele și prețurile",
    body: "Prețurile afișate sunt exprimate în lei moldovenești (MDL) și includ TVA. Ne rezervăm dreptul de a modifica prețurile și stocul disponibil fără notificare prealabilă, comenzile deja confirmate nefiind afectate.",
  },
  {
    title: "3. Comanda și confirmarea",
    body: "O comandă este considerată confirmată după finalizarea plății sau, în cazul rambursului la livrare, după validarea telefonică a datelor de livrare.",
  },
  {
    title: "4. Livrarea",
    body: "Livrăm în toată Moldova, în termen de 1-3 zile lucrătoare de la confirmarea comenzii. Detalii complete despre costuri și termene găsești pe pagina Livrare și plată.",
  },
  {
    title: "5. Plata",
    body: "Acceptăm plata online cu cardul, prin maib, și plata ramburs la livrare. Toate tranzacțiile online sunt procesate criptat, prin conexiuni securizate.",
  },
  {
    title: "6. Dreptul de retur",
    body: "Ai dreptul să returnezi produsele în termen de 14 zile calendaristice de la primirea comenzii, conform politicii descrise pe pagina Retur și rambursare.",
  },
  {
    title: "7. Limitarea răspunderii",
    body: "Dostore Carti depune eforturi rezonabile pentru a asigura acuratețea informațiilor despre produse, dar nu poate garanta absența oricăror erori minore de descriere sau imagine.",
  },
  {
    title: "8. Modificarea termenilor",
    body: "Acești termeni pot fi actualizați periodic. Versiunea în vigoare este cea publicată pe această pagină la momentul plasării comenzii.",
  },
];

export default function TermeniSiConditiiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
        Termeni și condiții
      </h1>
      <p className="mt-3 text-sm text-ink-soft">Ultima actualizare: iulie 2026</p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif text-lg font-semibold text-ink">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
