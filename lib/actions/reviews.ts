"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { checkRateLimit, formatRetryAfter, getClientFingerprint } from "@/lib/rate-limit";

export type ReviewFormState = {
  status: "idle" | "success" | "error";
  message: string;
  /**
   * Identificator unic al trimiterii reușite. Formularul îl folosește ca `key`
   * ca să se re-monteze (deci să se golească) după fiecare recenzie trimisă —
   * fără `useEffect` cu `setState`, care e interzis de regulile de lint React.
   */
  submissionId?: string;
};

const MIN_NAME = 2;
const MAX_NAME = 60;
const MIN_TEXT = 10;
const MAX_TEXT = 1000;

/** O recenzie pe produs, de la același vizitator, la 24h. */
const PER_BOOK = { limit: 1, windowMs: 24 * 60 * 60 * 1000 };
/** Cel mult 3 recenzii pe oră, indiferent de produs (anti-spam pe tot site-ul). */
const PER_VISITOR = { limit: 3, windowMs: 60 * 60 * 1000 };

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim().replace(/\s+/g, " ");
  const text = String(formData.get("text") ?? "").trim();
  const rating = Number(formData.get("rating"));
  // Câmp-capcană, ascuns vizual: oamenii nu-l văd, boții îl completează.
  const honeypot = String(formData.get("website") ?? "").trim();

  if (honeypot) {
    // Nu-i spunem botului că l-am prins — răspundem ca la o trimitere reușită.
    return {
      status: "success",
      message: "Îți mulțumim! Recenzia ta a fost publicată.",
      submissionId: randomUUID(),
    };
  }

  if (!slug) {
    return { status: "error", message: "Produs necunoscut. Reîncarcă pagina și încearcă din nou." };
  }
  if (author.length < MIN_NAME || author.length > MAX_NAME) {
    return { status: "error", message: "Scrie-ți numele (între 2 și 60 de caractere)." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { status: "error", message: "Alege un punctaj de la 1 la 5 stele." };
  }
  if (text.length < MIN_TEXT) {
    return { status: "error", message: "Scrie câteva cuvinte despre produs (minim 10 caractere)." };
  }
  if (text.length > MAX_TEXT) {
    return { status: "error", message: "Recenzia e prea lungă (maxim 1000 de caractere)." };
  }

  try {
    const fingerprint = await getClientFingerprint();

    const perVisitor = await checkRateLimit(`review:v:${fingerprint}`, PER_VISITOR);
    if (!perVisitor.ok) {
      return {
        status: "error",
        message: `Ai trimis prea multe recenzii într-un timp scurt. Mai încearcă peste ${formatRetryAfter(perVisitor.retryAfterSeconds)}.`,
      };
    }

    const perBook = await checkRateLimit(`review:b:${fingerprint}:${slug}`, PER_BOOK);
    if (!perBook.ok) {
      return {
        status: "error",
        message: `Ai lăsat deja o recenzie la acest produs. Poți lăsa alta peste ${formatRetryAfter(perBook.retryAfterSeconds)}.`,
      };
    }

    const book = await prisma.book.findUnique({
      where: { slug },
      select: { id: true, reviews: true },
    });

    if (!book) {
      return { status: "error", message: "Produsul nu mai există." };
    }

    // Cea mai nouă recenzie stă prima — lista de pe pagină e în ordinea din DB.
    const reviews = [{ author, rating, text, date: new Date() }, ...book.reviews];

    await prisma.book.update({
      where: { id: book.id },
      data: {
        reviews,
        // Stelele de sub titlu se recalculează din recenziile reale, la fel ca
        // la salvarea din admin — altfel media afișată ar rămâne în urmă.
        rating: Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10,
        reviewCount: reviews.length,
      },
    });

    // Pagina produsului e prerandată static (ISR 1h) — fără asta, recenzia nouă
    // nu s-ar vedea până la expirare.
    revalidatePath(`/carti/${slug}`);
    updateTag(CACHE_TAGS.books);

    return {
      status: "success",
      message: "Îți mulțumim! Recenzia ta a fost publicată.",
      submissionId: randomUUID(),
    };
  } catch {
    return {
      status: "error",
      message: "A apărut o eroare. Te rugăm încearcă din nou.",
    };
  }
}
