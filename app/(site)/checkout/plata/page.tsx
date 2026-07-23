import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { PaymentQr } from "@/components/checkout/PaymentQr";

export const metadata: Metadata = { title: "Plată prin QR" };

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
    redirect(`/checkout/succes?order=${orderNumber}`);
  }

  // Generăm imaginea QR din payload-ul băncii (docs: qrAsText poate fi encodat
  // în propria imagine). Un data URL SVG e clar și ușor.
  // Mediul de test al băncii vs producție — controlează afișarea ajutorului de testare.
  const isTestEnv = (process.env.VB_MIA_BASE_URL ?? "").includes("test-");

  const qrDataUrl = await QRCode.toDataURL(order.qrPayUrl, {
    width: 320,
    margin: 1,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-center font-serif text-3xl font-semibold text-ink">
        Scanează pentru a plăti
      </h1>
      <p className="mt-2 text-center text-ink-soft">
        Comanda <span className="font-semibold text-ink">{orderNumber}</span> ·{" "}
        <span className="font-semibold text-ink">{order.total.toFixed(2)} lei</span>
      </p>

      <PaymentQr orderNumber={orderNumber} qrDataUrl={qrDataUrl} payUrl={order.qrPayUrl} />

      {/* Ajutor de testare — apare DOAR pe mediul de test al băncii. Pe
          producție (ips-api-pj.vb.md) dispare automat, clienții nu-l văd. */}
      {isTestEnv && order.qrHeaderUUID && (
        <div className="mt-6 rounded-xl border border-dashed border-amber-400 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-900">Mod TEST — plătește fără aplicație bancară</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-900">
            <li>
              Deschide{" "}
              <a
                href="https://test-ipspj-demopay.victoriabank.md/swagger/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                simulatorul băncii
              </a>{" "}
              → <code>POST /api/pay/</code> → „Try it out”.
            </li>
            <li>Lipește codul de mai jos ca <code>qrHeaderUUID</code> și apasă „Execute”.</li>
            <li>Revino aici — pagina confirmă plata singură în câteva secunde.</li>
          </ol>
          <p className="mt-3 select-all break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-ink ring-1 ring-amber-300">
            {order.qrHeaderUUID}
          </p>
        </div>
      )}
    </div>
  );
}
