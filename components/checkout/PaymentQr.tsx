"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Smartphone, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

/**
 * Ecranul de plată prin QR MIA. Afișează codul QR (scanat cu app-ul de banking)
 * și, pe mobil, un buton care deschide direct linkul de plată. Între timp
 * interoghează serverul (care întreabă banca) până când plata e confirmată,
 * apoi duce clientul la pagina de succes.
 */
export function PaymentQr({
  orderNumber,
  qrDataUrl,
  payUrl,
}: {
  orderNumber: string;
  qrDataUrl: string;
  payUrl: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"pending" | "paid" | "failed">("pending");
  const [reissuing, setReissuing] = useState(false);
  const [reissueError, setReissueError] = useState<string | null>(null);

  /** Cod QR nou pentru aceeași comandă, după ce cel vechi a expirat. */
  async function handleReissue() {
    setReissuing(true);
    setReissueError(null);
    try {
      const res = await fetch(
        `/api/payments/victoriabank/reissue?order=${encodeURIComponent(orderNumber)}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setReissueError(data?.error ?? "Nu am putut genera un cod nou. Încearcă din nou.");
        return;
      }
      // Pagina se re-randează cu noul cod.
      setState("pending");
      router.refresh();
    } catch {
      setReissueError("Conexiune întreruptă. Încearcă din nou.");
    } finally {
      setReissuing(false);
    }
  }

  useEffect(() => {
    if (state !== "pending") return;
    let active = true;

    const check = async () => {
      try {
        const res = await fetch(
          `/api/payments/victoriabank/status?order=${encodeURIComponent(orderNumber)}`,
          { cache: "no-store" }
        );
        const data = (await res.json()) as { status: "paid" | "pending" | "failed" };
        if (!active) return;
        if (data.status === "paid") {
          setState("paid");
          router.push(`/comanda/${orderNumber}?nou=1`);
        } else if (data.status === "failed") {
          setState("failed");
        }
      } catch {
        // rețea picată — reîncercăm la următorul tick
      }
    };

    const interval = setInterval(check, 4000);
    void check();
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [state, orderNumber, router]);

  if (state === "failed") {
    return (
      <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
        <XCircle className="mx-auto h-10 w-10 text-terracotta" aria-hidden="true" />
        <p className="mt-3 font-semibold text-ink">Codul QR a expirat</p>
        <p className="mt-1 text-sm text-ink-soft">
          Codurile MIA sunt valabile 30 de minute. Comanda ta e păstrată — cere un cod nou și
          poți plăti în continuare.
        </p>

        {reissueError && (
          <p role="alert" className="mt-3 text-sm font-medium text-terracotta">
            {reissueError}
          </p>
        )}

        <button
          type="button"
          onClick={handleReissue}
          disabled={reissuing}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 font-semibold text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${reissuing ? "animate-spin" : ""}`} aria-hidden="true" />
          {reissuing ? "Se generează..." : "Generează un cod nou"}
        </button>

        <a href="/contact" className="mt-3 block text-sm font-medium text-terracotta hover:underline">
          Sau scrie-ne, dacă preferi altă modalitate
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-6">
      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-border/60">
        <Image src={qrDataUrl} alt="Cod QR de plată" width={280} height={280} unoptimized />
      </div>

      <p className="text-center text-sm text-ink-soft">
        Deschide aplicația băncii tale, alege plata prin QR și scanează codul de mai sus.
      </p>

      <a
        href={payUrl}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 font-semibold text-cream transition-colors hover:bg-navy-dark sm:hidden"
      >
        <Smartphone className="h-4 w-4" aria-hidden="true" />
        Plătește din telefon
      </a>

      <div className="flex items-center gap-2 text-sm text-ink-soft">
        {state === "paid" ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
            Plată confirmată, te redirecționăm…
          </>
        ) : (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Așteptăm confirmarea plății…
          </>
        )}
      </div>
    </div>
  );
}
