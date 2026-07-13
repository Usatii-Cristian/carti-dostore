import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Plată nereușită — BookStore",
};

type PageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutEsuatPage({ searchParams }: PageProps) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber } })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
        <XCircle className="h-8 w-8" aria-hidden="true" />
      </span>

      <h1 className="mt-5 font-serif text-3xl font-semibold text-ink">
        Plata nu a putut fi finalizată
      </h1>

      <p className="mt-3 text-ink-soft">
        {order
          ? `Comanda #${order.orderNumber} nu a fost plătită. Poate ai anulat plata sau a intervenit o eroare.`
          : "Plata nu a fost finalizată. Poate ai anulat-o sau a intervenit o eroare."}{" "}
        Coșul tău este intact — poți încerca din nou.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
        >
          Încearcă din nou
        </Link>
        <Link
          href="/cos"
          className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
        >
          Vezi coșul
        </Link>
      </div>
    </div>
  );
}
