"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/**
 * Verifică, la deschiderea listei de comenzi, ce s-a întâmplat cu plățile
 * online rămase neconfirmate: cele achitate se marchează plătite (și primesc
 * AWB), cele cu QR expirat se anulează.
 *
 * De ce aici: pagina de plată întreabă banca doar cât timp e deschisă, iar
 * cron-ul rulează o dată pe zi. Dacă un client plătește și închide fila,
 * comanda ar rămâne „în așteptare" până a doua zi — așa, se rezolvă în clipa în
 * care magazinul se uită la comenzi.
 */
export function PaymentsReconciler() {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/reconcile-payments")
      .then((res) => (res.ok ? res.json() : null))
      .then((summary: { confirmed: number; failed: number } | null) => {
        if (cancelled || !summary) return;
        if (summary.confirmed === 0 && summary.failed === 0) return;

        const parts = [
          summary.confirmed > 0 ? `${summary.confirmed} plată confirmată` : null,
          summary.failed > 0 ? `${summary.failed} comandă cu plata expirată, anulată` : null,
        ].filter(Boolean);

        setNote(`Verificare plăți online: ${parts.join(" · ")}.`);
        router.refresh();
      })
      .catch(() => {
        // verificarea e un bonus — dacă pică, lista de comenzi rămâne întreagă
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!note) return null;

  return (
    <p className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <RefreshCw className="h-4 w-4 shrink-0" aria-hidden="true" />
      {note}
    </p>
  );
}
