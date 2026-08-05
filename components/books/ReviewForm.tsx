"use client";

import { useActionState, useState } from "react";
import { Star, PenLine } from "lucide-react";
import { submitReview, type ReviewFormState } from "@/lib/actions/reviews";

// Starea inițială stă aici, nu în fișierul de acțiuni: un fișier „use server"
// poate exporta doar funcții async (vezi AGENTS.md).
const initialState: ReviewFormState = { status: "idle", message: "" };

const MAX_TEXT = 1000;

export function ReviewForm({ bookSlug }: { bookSlug: string }) {
  const [state, formAction, pending] = useActionState(submitReview, initialState);

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
        <PenLine className="h-4.5 w-4.5 text-terracotta" aria-hidden="true" />
        Lasă o recenzie
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Ai citit sau folosit acest produs? Spune-le și celorlalți cum ți s-a părut.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        {/* Câmpurile se re-montează după fiecare trimitere reușită (key nou de
            la server), deci formularul se golește singur, fără efecte. */}
        <ReviewFields key={state.submissionId ?? "new"} bookSlug={bookSlug} />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Se trimite..." : "Trimite recenzia"}
          </button>

          {state.message && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm font-medium ${
                state.status === "success" ? "text-terracotta" : "text-red-600"
              }`}
            >
              {state.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function ReviewFields({ bookSlug }: { bookSlug: string }) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const shown = hovered || rating;

  return (
    <>
      <input type="hidden" name="slug" value={bookSlug} />
      <input type="hidden" name="rating" value={rating} />

      {/* Capcană pentru boți: ascunsă vizual și pentru cititoarele de ecran. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="review-website">Nu completa acest câmp</label>
        <input id="review-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink">Punctajul tău</legend>
        <div
          className="flex w-fit gap-1 rounded-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/50"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer" onMouseEnter={() => setHovered(star)}>
              <input
                type="radio"
                name="ratingChoice"
                value={star}
                checked={rating === star}
                onChange={() => setRating(star)}
                className="sr-only"
              />
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= shown ? "fill-gold text-gold" : "text-border"
                }`}
                aria-hidden="true"
              />
              <span className="sr-only">{star === 1 ? "1 stea" : `${star} stele`}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-author" className="mb-1.5 block text-sm font-medium text-ink">
          Numele tău
        </label>
        <input
          id="review-author"
          name="author"
          required
          maxLength={60}
          autoComplete="name"
          placeholder="ex: Maria Ciobanu"
          className="w-full rounded-lg border border-border bg-cream-soft/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>

      <div>
        <label htmlFor="review-text" className="mb-1.5 block text-sm font-medium text-ink">
          Recenzia ta
        </label>
        <textarea
          id="review-text"
          name="text"
          required
          rows={4}
          minLength={10}
          maxLength={MAX_TEXT}
          placeholder="Ce ți-a plăcut? Cu ce te-a ajutat?"
          className="w-full resize-y rounded-lg border border-border bg-cream-soft/50 px-4 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-soft/60 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>
    </>
  );
}
