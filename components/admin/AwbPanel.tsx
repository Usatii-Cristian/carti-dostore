"use client";

import { useActionState, useState } from "react";
import { Truck, ExternalLink, AlertTriangle, Printer, XCircle } from "lucide-react";
import {
  generateAwb,
  cancelAwb,
  fetchLabelUrl,
  type AwbState,
} from "@/lib/actions/admin-shipping";

export function AwbPanel({
  orderId,
  existingAwb,
  county,
  fanCost,
}: {
  orderId: string;
  existingAwb: string | null;
  county: string | null;
  fanCost: number | null;
}) {
  const [state, action, pending] = useActionState(generateAwb.bind(null, orderId), {
    status: "idle",
  } as AwbState);
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelAwb.bind(null, orderId),
    { status: "idle" } as AwbState
  );
  const [labelLoading, setLabelLoading] = useState(false);

  // AWB-ul curent: cel proaspăt generat, sau cel salvat — dar dispare după anulare.
  const awb = cancelState.status === "success" ? null : (state.awb ?? existingAwb);

  async function openLabel() {
    if (!awb) return;
    setLabelLoading(true);
    try {
      const url = await fetchLabelUrl(awb);
      window.open(url, "_blank", "noopener");
    } finally {
      setLabelLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
        <Truck className="h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
        Livrare FAN Courier
      </h2>

      <dl className="mb-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Raion</dt>
          <dd className="font-medium text-slate-900">{county ?? "— lipsește —"}</dd>
        </div>
        {fanCost != null && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Cost estimat către FAN</dt>
            <dd className="font-medium text-slate-900">{fanCost.toFixed(2)} MDL</dd>
          </div>
        )}
        {awb && (
          <div className="flex justify-between">
            <dt className="text-slate-500">AWB</dt>
            <dd className="font-mono font-medium text-slate-900">{awb}</dd>
          </div>
        )}
      </dl>

      {(state.status === "error" || cancelState.status === "error") && (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.status === "error" ? state.message : cancelState.message}
        </p>
      )}
      {(state.status === "success" || cancelState.status === "success") && (
        <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {cancelState.status === "success" ? cancelState.message : state.message}
        </p>
      )}

      {awb ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openLabel}
            disabled={labelLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-dark disabled:opacity-60"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            {labelLoading ? "Se deschide…" : "Printează eticheta"}
          </button>

          <a
            href={`https://www.fancourier.md/awb-tracking/?awb=${awb}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
          >
            Urmărește coletul
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <form
            action={cancelAction}
            onSubmit={(event) => {
              if (!confirm("Anulezi AWB-ul la FAN? Poți genera altul după.")) {
                event.preventDefault();
              }
            }}
          >
            <button
              type="submit"
              disabled={cancelPending}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              {cancelPending ? "Se anulează…" : "Anulează AWB"}
            </button>
          </form>

          <p className="w-full text-xs text-slate-500">
            Anularea merge doar cât timp coletul n-a fost ridicat de curier.
          </p>
        </div>
      ) : (
        <form action={action}>
          {/* Fără raion butonul NU mai e blocat: acțiunea încearcă întâi să-l
              deducă din lista FAN după numele localității. Câmpul de mai jos e
              plasa de siguranță, pentru localități scrise greșit de client. */}
          {!county && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                Comanda n-are raionul salvat. Îl căutăm automat după localitate; dacă nu iese,
                scrie-l aici (ex: <span className="font-medium">Orhei</span>).
              </p>
              <input
                name="county"
                placeholder="Raion (opțional)"
                className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Se generează…" : "Generează AWB"}
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Creează expediția reală în contul FAN și programează ridicarea. Apasă doar când
            coletul e gata de predat.
          </p>
        </form>
      )}
    </section>
  );
}
