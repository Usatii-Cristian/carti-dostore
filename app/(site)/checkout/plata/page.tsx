import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { PaymentQr } from "@/components/checkout/PaymentQr";

export const metadata: Metadata = { title: "Plată cu MIA Plăți Instant" };

type PageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function PaymentPage({ searchParams }: PageProps) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) notFound();

  // Deja plătită, sau comandă pe ramburs (fără QR) → mergem la succes.
  if (order.paymentStatus === "PAID" || !order.qrPayUrl) {
    redirect(`/comanda/${orderNumber}?nou=1`);
  }

  // Generăm imaginea QR din payload-ul băncii (docs: qrAsText poate fi encodat
  // în propria imagine). Un data URL SVG e clar și ușor.
  const qrDataUrl = await QRCode.toDataURL(order.qrPayUrl, {
    width: 320,
    margin: 1,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
      {/* Numele și logo-ul oficial al serviciului, cum cere BNM: clientul
          trebuie să vadă că plătește prin MIA Plăți Instant. */}
      <Image
        src="/plati/mia-logo.svg"
        alt="MIA Plăți Instant"
        width={291}
        height={54}
        className="mx-auto h-9 w-auto"
        priority
      />
      <h1 className="mt-4 text-center font-serif text-3xl font-semibold text-ink">
        Plătește cu MIA Plăți Instant
      </h1>
      <p className="mt-2 text-center text-ink-soft">
        Comanda <span className="font-semibold text-ink">{orderNumber}</span> ·{" "}
        <span className="font-semibold text-ink">{order.total.toFixed(2)} lei</span>
      </p>
      <p className="mt-1 text-center text-sm text-ink-soft">
        Scanează codul QR cu aplicația băncii tale (MIA Instant Payments). Plata se face prin
        transfer instant din cont, fără card.
      </p>

      <PaymentQr orderNumber={orderNumber} qrDataUrl={qrDataUrl} payUrl={order.qrPayUrl} />

    </div>
  );
}
