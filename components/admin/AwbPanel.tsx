"use client";

import { useActionState } from "react";
import { Truck, ExternalLink, AlertTriangle } from "lucide-react";
import { generateAwb, type AwbState } from "@/lib/actions/admin-shipping";

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

  const awb = state.awb ?? existingAwb;

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

      {state.status === "error" && (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.message}
        </p>
      )}

      {awb ? (
        <a
          href={`https://www.fancourier.md/awb-tracking/?awb=${awb}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
        >
          Urmărește coletul
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ) : (
        <form action={action}>
          <button
            type="submit"
            disabled={pending || !county}
            title={!county ? "Comanda n-are raionul completat" : undefined}
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
