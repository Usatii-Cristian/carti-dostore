import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: "Cum colectează, folosește și protejează BookStore datele tale personale.",
};

const sections = [
  {
    title: "1. Ce date colectăm",
    body: "Colectăm datele pe care ni le oferi la crearea unei comenzi: nume, telefon, email și adresă de livrare. Nu stocăm datele cardului bancar — acestea sunt procesate direct de maib.",
  },
  {
    title: "2. Cum folosim datele",
    body: "Folosim datele tale exclusiv pentru procesarea și livrarea comenzilor, comunicarea legată de status-ul acestora și, dacă ai fost de acord, pentru a-ți trimite oferte și noutăți.",
  },
  {
    title: "3. Partajarea datelor",
    body: "Datele de livrare sunt partajate cu firma de curierat care îți livrează comanda. Nu vindem și nu închiriem datele tale personale către terți în scopuri de marketing.",
  },
  {
    title: "4. Securitatea datelor",
    body: "Toate transmisiile de date sensibile se fac prin conexiuni criptate (HTTPS). Accesul intern la date este limitat la persoanele implicate direct în procesarea comenzilor.",
  },
  {
    title: "5. Drepturile tale",
    body: "Poți solicita oricând acces, corectarea sau ștergerea datelor tale personale, scriind la contact@bookstore.md.",
  },
  {
    title: "6. Cookie-uri",
    body: "Folosim cookie-uri strict necesare pentru funcționarea coșului de cumpărături și a sesiunii de autentificare din panoul de administrare.",
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
