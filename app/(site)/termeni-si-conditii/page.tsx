import type { Metadata } from "next";

// Conținut fix, scris în cod: pagina se prerandează la build și se servește
// din CDN, fără nicio revalidare — răspuns instant.
export const revalidate = false;

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description: "Termenii și condițiile de utilizare a magazinului online Dostore Carti.",
};

const sections = [
  {
    title: "1. Dispoziții generale",
    body: "Prezenții termeni și condiții reglementează utilizarea magazinului online Dostore Cărți, condițiile de plasare, livrare, returnare a comenzilor și rambursarea sumelor achitate. Activitatea se desfășoară în conformitate cu legislația Republicii Moldova privind comerțul electronic și protecția consumatorilor, inclusiv Legea nr. 105 din 13.03.2003 privind protecția consumatorilor și prevederile aplicabile contractelor la distanță. Prin plasarea unei comenzi ești de acord cu termenii de mai jos.",
  },
  {
    title: "2. Vânzătorul",
    body: "Magazinul online Dostore Cărți este operat de Free Life SRL, cod fiscal 1025600059594, cu sediul în Str. Petru Zadnipru 19/2, Chișinău, Republica Moldova. Ne poți contacta la dostore.moldova@gmail.com sau +373 68 812 853.",
  },
  {
    title: "3. Produsele și prețurile",
    body: "Vindem cărți și produse conexe (accesorii, uleiuri esențiale). Prețurile afișate sunt exprimate în lei moldovenești (MDL). Ne rezervăm dreptul de a modifica prețurile și disponibilitatea produselor fără notificare prealabilă, comenzile deja confirmate nefiind afectate.",
  },
  {
    title: "4. Comenzile",
    body: "Comenzile se plasează exclusiv ca oaspete (guest checkout) — Dostore Cărți nu creează și nu solicită conturi de utilizator. La checkout completezi nume, telefon, email și adresa de livrare. Prin plasarea comenzii confirmi că datele furnizate sunt corecte și că ești de acord cu acești termeni. O comandă este considerată confirmată după finalizarea plății online sau, în cazul plății la livrare (card ori numerar), după înregistrarea comenzii; confirmarea se trimite pe email.",
  },
  {
    title: "5. Livrarea",
    body:
      "Toate comenzile se livrează prin curier — Dostore Cărți nu are magazin fizic și nu oferă ridicare personală, deci livrarea face parte din orice comandă, iar costul ei se adaugă la valoarea produselor. Livrarea este asigurată de FAN Courier, în toată Republica Moldova, în 1-3 zile lucrătoare de la confirmarea comenzii, la adresa indicată de client. Costul livrării este de 60 MDL pentru municipiul Chișinău și 85 MDL pentru restul Republicii Moldova, indiferent de valoarea comenzii; la plata la livrare (card sau numerar) se adaugă o taxă de ramburs de 15 MDL. Costul exact este afișat în coș și la finalizarea comenzii, înainte de plată, iar clientul confirmă expres acceptarea livrării la checkout. După expediere primești un număr AWB cu care poți urmări coletul. Termenele de livrare și eventualele întârzieri cauzate de curier sunt guvernate de condițiile de transport ale FAN Courier.",
  },
  {
    title: "6. Metodele de plată",
    body:
      "Acceptăm trei metode: (a) MIA Plăți Instant (MIA Instant Payments) — plata online pe site, prin sistemul național de plăți instant al Băncii Naționale a Moldovei, disponibil din aplicația oricărei bănci participante; (b) plata cu cardul la livrare, la curier; (c) plata în numerar la livrare. Plățile se efectuează în lei moldovenești (MDL). După confirmarea plății online, clientul primește pe email bonul electronic al cumpărăturii, cu produsele achitate, suma, metoda de plată și referința tranzacției.",
  },
  {
    title: "7. MIA Plăți Instant (MIA Instant Payments)",
    body: "MIA este sistemul național de plăți instant al Republicii Moldova, dezvoltat de Banca Națională a Moldovei. Plata se face direct din contul bancar, prin scanarea unui cod QR generat la finalizarea comenzii, cu aplicația băncii tale (ex. VB24, maib ID sau alta bancă participantă) — fără introducerea datelor cardului pe site-ul nostru. Plata se confirmă în câteva secunde, iar comanda este marcată automat ca achitată. Codul QR are o valabilitate limitată, stabilită de sistemul MIA; dacă expiră fără a fi folosit, comanda rămâne înregistrată și te putem contacta pentru a o finaliza.",
  },
  {
    title: "8. Condițiile de returnare",
    body: "Poți solicita returnarea produselor în următoarele situații: produse neconforme, deteriorate la livrare sau livrate greșit; anularea comenzii înainte de expediere; refuz la livrare; retur voluntar, în termen de 14 zile calendaristice de la primire. Returul e acceptat doar dacă produsul este în starea inițială — nefolosit, fără însemnări sau deteriorări.",
  },
  {
    title: "9. Procedura de returnare",
    body: "Ne notifici la dostore.moldova@gmail.com sau telefonic, indicând numele, numărul comenzii și motivul returului. Analizăm solicitarea în 1-2 zile lucrătoare și îți confirmăm pașii următori. În cazul produselor neconforme, costurile de returnare sunt suportate de noi; în cazul returului voluntar, de către client.",
  },
  {
    title: "10. Rambursarea sumelor",
    body: "Suma este rambursată în același mod în care a fost făcută plata. Pentru comenzile achitate online prin MIA, rambursarea se face pe același cont din care a fost efectuată plata; conform regulilor sistemului, o plată poate fi rambursată o singură dată, integral sau parțial, într-o singură operațiune. Pentru comenzile achitate cash sau cu cardul la livrare, restituirea se face prin transfer bancar sau numerar, după înțelegere cu clientul. Inițiem rambursarea în maximum 3 zile lucrătoare de la acceptarea returului, iar finalizarea ei poate dura până la 14 zile calendaristice, în funcție de banca implicată.",
  },
  {
    title: "11. Anularea comenzii",
    body: "Comanda poate fi anulată gratuit înainte de expediere. După expediere, se poate reține costul livrării deja efectuate.",
  },
  {
    title: "12. Evidența operațiunilor",
    body: "Înregistrăm toate retururile și rambursările și păstrăm evidența acestora conform legislației fiscale din Republica Moldova.",
  },
  {
    title: "13. Limitarea răspunderii",
    body: "Dostore Cărți depune eforturi rezonabile pentru a asigura acuratețea informațiilor despre produse, dar nu poate garanta absența oricăror erori minore de descriere sau imagine.",
  },
  {
    title: "14. Modificarea termenilor",
    body: "Acești termeni pot fi actualizați periodic. Versiunea în vigoare este cea publicată pe această pagină la momentul plasării comenzii.",
  },
];

const companyDetails = [
  { label: "Denumire", value: "Free Life SRL" },
  { label: "Cod fiscal", value: "1025600059594" },
  { label: "Nr. înregistrare", value: "189842 din 17.10.2025" },
  { label: "Bancă", value: "VictoriaBank, SWIFT — VICBMD2X" },
  { label: "IBAN", value: "MD46VI022511400000572MDL" },
  { label: "Adresă juridică", value: "Str. Petru Zadnipru 19/2, Chișinău, Republica Moldova" },
  { label: "Email", value: "dostore.moldova@gmail.com" },
  { label: "Telefon", value: "+373 68 812 853" },
  { label: "Site", value: "dostore.md" },
  { label: "Director", value: "Nadejda Marandici" },
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

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">Date companie</h2>
          <dl className="mt-3 divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70">
            {companyDetails.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 bg-card px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <dt className="text-sm font-semibold text-ink sm:w-40 sm:shrink-0">{row.label}</dt>
                <dd className="text-sm text-ink-soft">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
