"use client";

import { useActionState, useState } from "react";
import type { Category } from "@prisma/client";
import { slugify } from "@/lib/slugify";
import type { CategoryFormState } from "@/lib/actions/admin-categories";
import { ImageUploader } from "./ImageUploader";

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
  const [image, setImage] = useState(initialCategory?.image ?? "");

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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Imagine categorie
        </label>
        <input type="hidden" name="image" value={image} />
        <ImageUploader
          label="Imagine categorie"
          value={image ? [image] : []}
          onChange={(urls) => setImage(urls[0] ?? "")}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Opțional. Dacă lipsește, se folosește iconița aleasă automat după nume.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initialCategory?.featured ?? false}
            className="h-4 w-4 rounded border-slate-300"
          />
          Afișează pe pagina principală
        </label>
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Ordine (numărul mai mic apare primul)
          </label>
          <input
            type="number"
            name="featuredOrder"
            defaultValue={initialCategory?.featuredOrder ?? 0}
            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy focus:outline-none"
          />
        </div>
      </div>

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
