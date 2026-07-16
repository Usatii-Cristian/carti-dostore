"use client";

import { useActionState } from "react";
import type { PublisherFormState } from "@/lib/actions/admin-publishers";

type PublisherFormAction = (
  prevState: PublisherFormState,
  formData: FormData
) => Promise<PublisherFormState>;

const initialState: PublisherFormState = { status: "idle" };

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20";

export function PublisherForm({ action }: { action: PublisherFormAction }) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nume editură</label>
        <input name="name" placeholder="ex. Humanitas" className={inputClass} />
        {state.fieldErrors?.name && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark disabled:opacity-60"
      >
        {pending ? "Se salvează..." : "Salvează editura"}
      </button>
    </form>
  );
}
