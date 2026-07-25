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
    body: "O comandă este considerată confirmată după finalizarea plății online sau, în cazul plății la livrare (card ori numerar), după înregistrarea comenzii. Îți trimitem confirmarea pe email.",
  },
  {
    title: "4. Livrarea",
    body: "Livrarea este asigurată de FAN Courier, în toată Republica Moldova, în 1-3 zile lucrătoare de la confirmarea comenzii. După expediere primești un număr AWB cu care poți urmări coletul. Termenele de livrare și eventualele întârzieri cauzate de curier sunt guvernate de condițiile de transport ale FAN Courier. Detalii despre costuri găsești pe pagina Livrare și plată.",
  },
  {
    title: "5. Plata",
    body: "Acceptăm trei metode: (a) plata online pe site prin MIA — sistemul de plăți instant al Băncii Naționale a Moldovei, disponibil din aplicația oricărei bănci participante, unde scanezi un cod QR și confirmi plata în aplicația băncii tale; (b) plata cu cardul la livrare, la curier; (c) plata în numerar la livrare. Pentru plata online, noi nu vedem și nu stocăm datele cardului sau ale contului tău — tranzacția se desfășoară integral în aplicația băncii tale. Plățile se efectuează în lei moldovenești (MDL).",
  },
  {
    title: "6. Dreptul de retur",
    body: "Ai dreptul să returnezi produsele în termen de 14 zile calendaristice de la primirea comenzii, conform politicii descrise pe pagina Retur și rambursare. Pentru comenzile achitate online prin MIA, rambursarea se face pe același cont din care a fost efectuată plata. Conform regulilor sistemului, o plată poate fi rambursată o singură dată; rambursarea se procesează integral sau parțial, într-o singură operațiune.",
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
