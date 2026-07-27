"use client";

import { useActionState } from "react";
import { Truck, CheckCircle2, XCircle, Loader2, Printer } from "lucide-react";
import { runFanTest, type FanTestState } from "@/lib/actions/admin-fan-test";

const initialState: FanTestState = { status: "idle", steps: [] };

export function FanTestPanel() {
  const [state, action, pending] = useActionState(
    async () => runFanTest(),
    initialState
  );

  const allOk = state.steps.length > 0 && state.steps.every((s) => s.ok);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
          <Truck className="h-5 w-5 text-slate-400" aria-hidden="true" />
          Test integrare FAN Courier
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Verifică tot ce ține de livrare, cap-coadă: lista de localități, calculul
          prețului, generarea unui AWB real, urmărirea coletului, eticheta PDF și
          anularea.
        </p>
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Testul creează o expediție <strong>reală</strong> în contul FAN, dar o
          anulează automat la final — nu rămâne nicio ridicare programată.
        </p>

        <form action={action}>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {pending ? "Se testează…" : "Pornește testul"}
          </button>
        </form>
      </section>

      {state.status === "done" && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900">Rezultate</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                allOk ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
              }`}
            >
              {state.steps.filter((s) => s.ok).length}/{state.steps.length} au trecut
            </span>
          </div>

          <ol className="space-y-3">
            {state.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                {step.ok ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{step.name}</p>
                  <p className="break-words text-sm text-slate-600">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          {state.labelUrl && (
            <a
              href={state.labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Vezi eticheta generată în test
            </a>
          )}
        </section>
      )}
    </div>
  );
}
