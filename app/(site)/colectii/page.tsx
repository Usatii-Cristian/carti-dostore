import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Colecții — BookStore",
  description: "Colecții tematice de cărți, alese special pentru tine.",
};

const COLLECTIONS = [
  {
    title: "Bestsellers ai momentului",
    description: "Cărțile pe care toată lumea le citește acum",
    href: "/carti/bestsellers",
  },
  {
    title: "Top recomandări",
    description: "Cele mai bine evaluate cărți din librăria noastră",
    href: "/carti/recomandate",
  },
  {
    title: "Apariții noi",
    description: "Proaspăt sosite pe rafturile noastre",
    href: "/carti/noutati",
  },
  {
    title: "Idei de cadou",
    description: "Cărți potrivite pentru cei dragi, la orice ocazie",
    href: "/carti/bestsellers",
  },
];

export default function ColectiiPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Colecții</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Selecții tematice, pregătite de echipa noastră, ca să găsești mai ușor cartea
        potrivită.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {COLLECTIONS.map((collection) => (
          <Link
            key={collection.title}
            href={collection.href}
            className="group rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70 transition-shadow hover:shadow-md"
          >
            <h2 className="font-serif text-xl font-semibold text-ink group-hover:text-terracotta">
              {collection.title}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{collection.description}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-terracotta">
              Explorează →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
