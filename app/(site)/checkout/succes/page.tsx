import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";

export const metadata: Metadata = {
  title: "Comandă înregistrată",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutSuccesPage({ searchParams }: PageProps) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber } })
    : null;

  const isPaid = order?.paymentStatus === "PAID";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <ClearCartOnMount />

      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
      </span>

      <h1 className="mt-5 font-serif text-3xl font-semibold text-ink">
        {isPaid ? "Plată confirmată!" : "Comandă înregistrată"}
      </h1>

      {order ? (
        <>
          <p className="mt-3 text-ink-soft">
            Comanda ta <span className="font-semibold text-ink">#{order.orderNumber}</span>{" "}
            {isPaid
              ? "a fost plătită cu succes."
              : "a fost înregistrată — plata este în curs de procesare."}
          </p>
          <p className="mt-1 text-ink-soft">Total: {formatPrice(order.total)}</p>
          {!isPaid && (
            <p className="mt-4 text-sm text-ink-soft">
              Îți vom trimite o confirmare pe email de îndată ce plata este procesată.
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-ink-soft">
          Nu am găsit detalii despre această comandă, dar dacă ai finalizat plata, ea a fost
          înregistrată.
        </p>
      )}

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
      >
        Înapoi la BookStore
      </Link>
    </div>
  );
}
