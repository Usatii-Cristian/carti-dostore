import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { getAllPublishers } from "@/lib/publishers";

export const metadata: Metadata = {
  title: "Edituri",
  description: "Editurile cu care colaborăm pentru a-ți aduce cele mai bune cărți.",
};

export default async function EdituriPage() {
  const publishers = await getAllPublishers();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Edituri</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Colaborăm cu edituri de încredere, din Moldova și din România. Apasă pe o editură ca
        să vezi doar cărțile ei.
      </p>

      {publishers.length === 0 ? (
        <p className="mt-10 text-ink-soft">Momentan nu avem edituri de afișat.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {publishers.map((publisher) => (
            <Link
              key={publisher.id}
              href={`/edituri/${publisher.slug}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-4 py-8 text-center shadow-sm ring-1 ring-border/70 transition-shadow hover:shadow-md"
            >
              <Building2 className="h-6 w-6 text-terracotta" aria-hidden="true" />
              <span className="font-serif text-lg font-semibold text-ink group-hover:text-terracotta">
                {publisher.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
