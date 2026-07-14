"use client";

import { useActionState, useState } from "react";
import type { Category } from "@prisma/client";
import { slugify } from "@/lib/slugify";
import type { CategoryFormState } from "@/lib/actions/admin-categories";

type CategoryFormAction = (
  prevState: CategoryFormState,
  formData: FormData
) => Promise<CategoryFormState>;

const initialState: CategoryFormState = { status: "idle" };

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20";

export function CategoryForm({
  action,
  initialCategory,
}: {
  action: CategoryFormAction;
  initialCategory?: Category | null;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(initialCategory?.name ?? "");
  const [slug, setSlug] = useState(initialCategory?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nume</label>
        <input
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={inputClass}
        />
        {state.fieldErrors?.name && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={inputClass}
        />
      </div>

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Iconița categoriei e aleasă automat, în funcție de nume — nu trebuie să o
        setezi manual.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark disabled:opacity-60"
      >
        {pending ? "Se salvează..." : "Salvează categoria"}
      </button>
    </form>
  );
}
