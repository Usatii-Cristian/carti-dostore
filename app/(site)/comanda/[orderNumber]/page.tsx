import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, Package, MapPin, CalendarClock, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { STATUS_META } from "@/lib/orders/status";
import { formatShippingAddress } from "@/lib/orders/address";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

export const metadata: Metadata = {
  title: "Status comandă",
  description: "Urmărește statusul comenzii tale Dostore Carti.",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ orderNumber: string }> };

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Chisinau",
  });
}

function daysUntil(date: Date): number {
  const ms = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber: decodeURIComponent(orderNumber) },
    include: { items: true },
  });

  if (!order) notFound();

  const estimated =
    order.estimatedDelivery ??
    new Date(order.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
  const isDelivered = order.status === "DELIVERED";
  const isCancelled = order.status === "CANCELLED";
  const remainingDays = daysUntil(estimated);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Status comandă</h1>
        <p className="mt-2 text-ink-soft">
          Comanda <span className="font-semibold text-ink">{order.orderNumber}</span>
        </p>
        <span
          className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
            isCancelled
              ? "bg-terracotta/10 text-terracotta"
              : isDelivered
                ? "bg-green-100 text-green-700"
                : "bg-cream-soft text-navy"
          }`}
        >
          <Truck className="h-4 w-4" aria-hidden="true" />
          {STATUS_META[order.status].customerLabel}
        </span>
        <p className="mt-2 text-xs text-ink-soft">
          Actualizat la {formatDate(order.updatedAt)}
        </p>
      </div>

      {/* Estimare livrare */}
      {!isCancelled && (
        <div className="mt-8 rounded-xl bg-navy p-5 text-center text-cream shadow-sm">
          {isDelivered ? (
            <p className="font-semibold">Comanda a fost livrată. Îți mulțumim!</p>
          ) : (
            <>
              <p className="text-sm text-cream/70">Livrare estimată</p>
              <p className="mt-1 font-serif text-2xl font-semibold">
                {remainingDays === 0
                  ? "Astăzi"
                  : `Aproximativ ${remainingDays} ${remainingDays === 1 ? "zi" : "zile"}`}
              </p>
              <p className="mt-1 text-sm text-cream/70">până la {formatDate(estimated)}</p>
            </>
          )}
        </div>
      )}

      {/* Timeline progres */}
      <section className="mt-8 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-ink-soft">
          Progres
        </h2>
        <OrderTimeline
          status={order.status}
          statusHistory={order.statusHistory}
          createdAt={order.createdAt}
        />
      </section>

      {/* Detalii */}
      <section className="mt-6 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-soft">
          Detalii
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2 text-ink-soft">
              <CalendarClock className="h-4 w-4" aria-hidden="true" /> Termen estimat
            </dt>
            <dd className="font-semibold text-ink">{formatDate(estimated)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2 text-ink-soft">
              <Truck className="h-4 w-4" aria-hidden="true" /> Modalitate
            </dt>
            <dd className="font-semibold text-ink">Livrare prin curier</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-ink-soft">
              <MapPin className="h-4 w-4" aria-hidden="true" /> Adresă
            </dt>
            <dd className="text-right font-semibold text-ink">
              {formatShippingAddress(order)}, {order.city}
            </dd>
          </div>
          {order.trackingNumber && (
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-ink-soft">
                <Package className="h-4 w-4" aria-hidden="true" /> Nr. urmărire (AWB)
              </dt>
              <dd className="font-semibold text-ink">{order.trackingNumber}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
            <dt className="text-ink-soft">Sumă comandă</dt>
            <dd className="text-base font-semibold text-terracotta">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      {/* Produse */}
      <section className="mt-6 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-soft">
          Produse ({order.items.length})
        </h2>
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <span className="text-ink">
                {item.title}
                <span className="text-ink-soft"> × {item.quantity}</span>
              </span>
              <span className="shrink-0 font-semibold text-ink">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Ajutor */}
      <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-cream-soft p-5 text-center">
        <p className="text-sm text-ink-soft">Ai întrebări despre comanda ta?</p>
        <a
          href="tel:+37322000000"
          className="inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          +373 68 812 853
        </a>
        <Link href="/" className="text-sm font-medium text-navy hover:text-terracotta">
          Înapoi la Dostore Carti
        </Link>
      </div>
    </div>
  );
}
