import type { Metadata } from "next";
import { MapPin, Phone, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Librării — BookStore",
  description: "Vizitează una dintre librăriile noastre partenere din Moldova.",
};

const STORES = [
  {
    city: "Chișinău",
    address: "Bd. Ștefan cel Mare 65",
    phone: "+373 22 000 001",
    hours: "Luni–Duminică, 09:00–20:00",
  },
  {
    city: "Bălți",
    address: "Str. Independenței 12",
    phone: "+373 22 000 002",
    hours: "Luni–Sâmbătă, 09:00–18:00",
  },
  {
    city: "Cahul",
    address: "Str. Republicii 8",
    phone: "+373 22 000 003",
    hours: "Luni–Sâmbătă, 09:00–18:00",
  },
];

export default function LibrariiPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Librării</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Pe lângă magazinul online, ne găsești și în librăriile partenere de mai jos.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {STORES.map((store) => (
          <div key={store.city} className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
            <h2 className="font-serif text-xl font-semibold text-ink">{store.city}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                {store.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                {store.phone}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                {store.hours}
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
