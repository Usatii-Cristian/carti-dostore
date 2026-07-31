import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: "Cum colectează, folosește și protejează Dostore Carti datele tale personale.",
};

const sections = [
  {
    title: "1. Dispoziții generale",
    body: "Această politică descrie cum colectează, folosește și protejează Dostore Cărți datele cu caracter personal ale clienților, în conformitate cu Legea nr. 133 din 08.07.2011 privind protecția datelor cu caracter personal (Republica Moldova). Prin plasarea unei comenzi sau navigarea pe site, ești de acord cu prelucrarea datelor tale în condițiile descrise mai jos.",
  },
  {
    title: "2. Operatorul de date",
    body: "Operatorul datelor cu caracter personal colectate prin acest site este Free Life SRL, cod fiscal 1025600059594, care operează magazinul online Dostore Cărți, cu sediul în Str. Petru Zadnipru 19/2, Chișinău, Republica Moldova. Pentru orice întrebare legată de datele tale personale, ne poți contacta la dostore.moldova@gmail.com sau +373 68 812 853.",
  },
  {
    title: "3. Ce date colectăm",
    body: "Colectăm doar datele necesare procesării comenzii: date de identificare (nume), date de contact (email, telefon), date de livrare (adresă, localitate) și date despre comandă (produsele alese, valoarea, metoda de plată selectată). Colectăm și date tehnice minime (adresa IP, cookie-uri) pentru funcționarea și securitatea site-ului. Nu stocăm datele cardului bancar — la plata online prin MIA, tranzacția se desfășoară integral în aplicația băncii tale, iar noi primim doar suma și un identificator al comenzii.",
  },
  {
    title: "4. Scopul prelucrării",
    body: "Prelucrăm datele tale pentru: (a) procesarea și livrarea comenzilor; (b) comunicarea cu tine legată de statusul comenzii; (c) îndeplinirea obligațiilor legale și fiscale (emitere de documente, evidență contabilă); (d) securitatea site-ului și prevenirea fraudei; (e) transmiterea de oferte și noutăți, doar dacă ți-ai dat acordul explicit pentru asta (de exemplu la abonarea la newsletter).",
  },
  {
    title: "5. Cui transmitem datele",
    body: "Transmitem datele strict cât e nevoie ca să primești comanda: (a) către FAN Courier — nume, telefon, adresă și localitate, pentru generarea AWB-ului și livrare; (b) către sistemul MIA (plăți instant) — doar suma și un identificator al comenzii, atunci când plătești online; (c) către autoritățile statului, doar dacă legea ne obligă expres. Datele contului sau ale cardului tău NU trec prin site-ul nostru. Nu vindem și nu închiriem datele tale personale către terți în scopuri de marketing.",
  },
  {
    title: "6. Cât timp păstrăm datele",
    body: "Datele legate de comenzi le păstrăm pe durata impusă de obligațiile fiscale și contabile (4 ani de la finalizarea comenzii). Datele folosite exclusiv pentru marketing (ex. abonarea la newsletter) le păstrăm până când te dezabonezi sau ne ceri ștergerea lor.",
  },
  {
    title: "7. Drepturile tale",
    body: "Ai dreptul de a solicita: acces la datele tale, rectificarea datelor incorecte, ștergerea datelor, restricționarea prelucrării, portabilitatea datelor (primirea lor într-un format structurat) și opoziția față de prelucrare. Pentru orice astfel de cerere, scrie-ne la dostore.moldova@gmail.com. Dacă consideri că drepturile tale nu au fost respectate, ai dreptul să depui o plângere la Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP), autoritatea de supraveghere din Republica Moldova.",
  },
  {
    title: "8. Securitatea datelor",
    body: "Toate transmisiile de date sensibile se fac prin conexiuni criptate (HTTPS). Parolele contului de administrare sunt stocate criptat (hash), niciodată în clar. Accesul intern la date este limitat la persoanele implicate direct în procesarea comenzilor, iar baza de date este copiată de rezervă în mod regulat.",
  },
  {
    title: "9. Cookie-uri",
    body: "Folosim două categorii: (a) cookie-uri strict necesare — pentru coșul de cumpărături, favorite și sesiunea de autentificare din panoul de administrare; acestea nu pot fi dezactivate, fără ele site-ul nu funcționează; (b) cookie-uri de analiză — ne arată ce pagini sunt vizitate, ca să îmbunătățim magazinul. Cele de analiză se încarcă DOAR după ce le accepți din bannerul afișat la prima vizită. Poți refuza fără ca site-ul să fie afectat, iar alegerea ta se păstrează în browserul tău.",
  },
  {
    title: "10. Modificări ale politicii",
    body: "Putem actualiza periodic această politică, pentru a reflecta schimbări legale sau ale modului în care funcționează site-ul. Versiunea în vigoare este cea publicată pe această pagină, la data indicată mai sus.",
  },
];

export default function ConfidentialitatePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
        Politica de confidențialitate
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
