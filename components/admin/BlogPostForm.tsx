"use client";

import { useActionState, useState } from "react";
import type { BlogPost } from "@prisma/client";
import { slugify } from "@/lib/slugify";
import type { BlogFormState } from "@/lib/actions/admin-blog";
import { ImageUploader } from "./ImageUploader";

type Action = (prevState: BlogFormState, formData: FormData) => Promise<BlogFormState>;

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none";

function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

export function BlogPostForm({
  action,
  initialPost,
}: {
  action: Action;
  initialPost?: BlogPost;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as BlogFormState);
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage ?? "");

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <Field label="Titlu" error={state.fieldErrors?.title}>
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
          required
        />
      </Field>

      <Field
        label="Slug (adresa articolului)"
        error={state.fieldErrors?.slug}
        hint={`Se va publica la /blog/${slugify(title) || "..."}`}
      >
        <input
          name="slug"
          defaultValue={initialPost?.slug ?? ""}
          placeholder="lasă gol pentru generare automată din titlu"
          className={inputClass}
        />
      </Field>

      <Field
        label="Rezumat"
        error={state.fieldErrors?.excerpt}
        hint="Apare în lista de articole și în rezultatele Google."
      >
        <textarea
          name="excerpt"
          defaultValue={initialPost?.excerpt ?? ""}
          rows={2}
          className={inputClass}
          required
        />
      </Field>

      <Field label="Imagine de copertă" error={state.fieldErrors?.coverImage}>
        <input type="hidden" name="coverImage" value={coverImage} />
        <ImageUploader
          label="Copertă articol"
          value={coverImage ? [coverImage] : []}
          onChange={(urls) => setCoverImage(urls[0] ?? "")}
        />
      </Field>

      <Field
        label="Conținut"
        error={state.fieldErrors?.content}
        hint="Markdown simplu: ## titlu, ### subtitlu, **îngroșat**, *italic*, - listă, 1. listă numerotată, > citat, [text](adresă)."
      >
        <textarea
          name="content"
          defaultValue={initialPost?.content ?? ""}
          rows={18}
          className={`${inputClass} font-mono text-[13px] leading-relaxed`}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Autor">
          <input
            name="author"
            defaultValue={initialPost?.author ?? "Dostore Carti"}
            className={inputClass}
          />
        </Field>
        <Field label="Etichete (separate prin virgulă)">
          <input
            name="tags"
            defaultValue={initialPost?.tags.join(", ") ?? ""}
            placeholder="ex: uleiuri esențiale, ghid"
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initialPost?.published ?? true}
          className="h-4 w-4 rounded border-slate-300"
        />
        Publicat (debifat = ciornă, vizibilă doar aici)
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark disabled:opacity-60"
      >
        {pending ? "Se salvează…" : initialPost ? "Salvează modificările" : "Publică articolul"}
      </button>
    </form>
  );
}
