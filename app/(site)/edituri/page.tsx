import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edituri",
  description: "Editurile cu care colaborăm pentru a-ți aduce cele mai bune cărți.",
};

const PUBLISHERS = [
  "Humanitas",
  "Polirom",
  "Litera",
  "Curtea Veche",
  "Publica",
  "Cartex",
  "Alfa",
  "Act și Politon",
  "Cartea Daath",
];

export default function EdituriPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Edituri</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Colaborăm cu edituri de încredere, din Moldova și din România, pentru a-ți aduce
        titluri autentice, la prețuri corecte.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {PUBLISHERS.map((publisher) => (
          <div
            key={publisher}
            className="flex items-center justify-center rounded-xl bg-card px-4 py-8 text-center font-serif text-lg font-semibold text-ink shadow-sm ring-1 ring-border/70"
          >
            {publisher}
          </div>
        ))}
      </div>
    </div>
  );
}
