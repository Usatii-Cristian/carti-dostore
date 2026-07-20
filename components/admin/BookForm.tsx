"use client";

import { useActionState, useState } from "react";
import type { Book, Category } from "@prisma/client";
import { slugify } from "@/lib/slugify";
import type { BookFormState } from "@/lib/actions/admin-books";
import { ImageUploader } from "./ImageUploader";
import { FaqEditor } from "./FaqEditor";

type BookFormAction = (
  prevState: BookFormState,
  formData: FormData
) => Promise<BookFormState>;

const initialState: BookFormState = { status: "idle" };

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20";

export function BookForm({
  action,
  categories,
  publishers,
  initialBook,
}: {
  action: BookFormAction;
  categories: Category[];
  publishers: { id: string; name: string }[];
  initialBook?: Book | null;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const [title, setTitle] = useState(initialBook?.title ?? "");
  const [slug, setSlug] = useState(initialBook?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverImage, setCoverImage] = useState<string[]>(
    initialBook?.coverImage ? [initialBook.coverImage] : []
  );
  const [images, setImages] = useState<string[]>(initialBook?.images ?? []);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <Field label="Titlu" error={errors.title}>
          <input
            name="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Slug" error={errors.slug}>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Autor" error={errors.author}>
          <input name="author" defaultValue={initialBook?.author} className={inputClass} />
        </Field>

        <Field label="Categorie" error={errors.categoryId}>
          <select
            name="categoryId"
            defaultValue={initialBook?.categoryId ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Alege o categorie
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Descriere" error={errors.description}>
            <textarea
              name="description"
              rows={4}
              defaultValue={initialBook?.description}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
        <Field label="Preț (lei)" error={errors.price}>
          <input
            type="number"
            step="0.01"
            name="price"
            defaultValue={initialBook?.price}
            className={inputClass}
          />
        </Field>
        <Field label="Preț redus (opțional)">
          <input
            type="number"
            step="0.01"
            name="discountPrice"
            defaultValue={initialBook?.discountPrice ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Stoc">
          <input
            type="number"
            name="stock"
            defaultValue={initialBook?.stock ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label="Rating (0-5)">
          <input
            type="number"
            step="0.1"
            min={0}
            max={5}
            name="rating"
            defaultValue={initialBook?.rating ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label="Număr recenzii">
          <input
            type="number"
            name="reviewCount"
            defaultValue={initialBook?.reviewCount ?? 0}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <ImageUploader
          label="Copertă"
          value={coverImage}
          onChange={setCoverImage}
          multiple={false}
        />
        {errors.coverImage && (
          <p className="text-xs font-medium text-red-600">{errors.coverImage}</p>
        )}
        <input type="hidden" name="coverImage" value={coverImage[0] ?? ""} />

        <ImageUploader
          label="Galerie (imagini suplimentare)"
          value={images}
          onChange={setImages}
          multiple
        />
        {images.map((url) => (
          <input key={url} type="hidden" name="images" value={url} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <Field label="Editură">
          <select
            name="publisher"
            defaultValue={initialBook?.publisher ?? ""}
            className={inputClass}
          >
            <option value="">Fără editură</option>
            {publishers.map((publisher) => (
              <option key={publisher.id} value={publisher.name}>
                {publisher.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ISBN">
          <input name="isbn" defaultValue={initialBook?.isbn ?? ""} className={inputClass} />
        </Field>
        <Field label="Limbă">
          <input
            name="language"
            defaultValue={initialBook?.language ?? "Română"}
            className={inputClass}
          />
        </Field>
        <Field label="Număr pagini">
          <input
            type="number"
            name="pageCount"
            defaultValue={initialBook?.pageCount ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Greutate (grame)">
          <input
            type="number"
            name="weightGrams"
            min={0}
            defaultValue={initialBook?.weightGrams ?? ""}
            placeholder="ex: 400"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            Folosită la calculul livrării FAN Courier. Dacă o lași goală, se estimează 400 g.
          </p>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Etichete (separate prin virgulă)">
            <input
              name="tags"
              defaultValue={initialBook?.tags.join(", ") ?? ""}
              placeholder="ex: obiceiuri, productivitate"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Întrebări frecvente">
            <FaqEditor initialFaqs={initialBook?.faqs ?? []} />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="isBestseller"
            defaultChecked={initialBook?.isBestseller}
            className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy/20"
          />
          Bestseller
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="isNew"
            defaultChecked={initialBook?.isNew}
            className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy/20"
          />
          Noutate
        </label>

        {!initialBook && (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              name="notifySubscribers"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy/20"
            />
            Anunță abonații la newsletter despre această carte nouă
          </label>
        )}
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark disabled:opacity-60"
      >
        {pending ? "Se salvează..." : "Salvează cartea"}
      </button>
    </form>
  );
}
