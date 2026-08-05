"use client";

import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";

export type Review = {
  author: string;
  rating: number;
  text: string;
  date: Date;
};

/** Câte recenzii se văd la prima deschidere a paginii. */
const INITIAL_COUNT = 3;
/** Câte se mai adaugă la fiecare apăsare pe „Afișează mai multe". */
const STEP = 6;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} din 5 stele`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-gold text-gold" : "text-border"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

const DATE_FORMAT = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Chisinau",
});

export function Reviews({ reviews }: { reviews: Review[] }) {
  const [shown, setShown] = useState(INITIAL_COUNT);

  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const visible = reviews.slice(0, shown);
  // Ultimul pas afișează exact cât a mai rămas, chiar dacă sunt mai puține
  // decât un pas întreg (ex. mai sunt 4 → apar toate 4, nu 6).
  const remaining = reviews.length - visible.length;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl font-semibold text-ink">Recenzii</h2>
        <span className="flex items-center gap-1.5 text-sm text-ink-soft">
          <Stars rating={Math.round(average)} />
          {average.toFixed(1)} · {reviews.length}{" "}
          {reviews.length === 1 ? "recenzie" : "recenzii"}
        </span>
      </div>

      <ul className="space-y-4">
        {visible.map((review, index) => (
          <li key={index} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-semibold text-ink">{review.author}</span>
              <time
                dateTime={new Date(review.date).toISOString()}
                className="text-xs text-ink-soft"
              >
                {DATE_FORMAT.format(new Date(review.date))}
              </time>
            </div>
            <Stars rating={review.rating} />
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{review.text}</p>
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setShown((current) => current + STEP)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
          Afișează mai multe ({remaining} {remaining === 1 ? "recenzie" : "recenzii"})
        </button>
      )}
    </section>
  );
}
