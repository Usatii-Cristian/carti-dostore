"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify, normalizeForSearch } from "@/lib/slugify";
import { sendNewBookAnnouncement } from "@/lib/email/notifications";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type BookFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

// FAQ-urile vin dintr-un singur câmp JSON (vezi components/admin/FaqEditor).
// Ignorăm rândurile goale și acceptăm cel mult unul „deschis implicit".
function parseFaqs(
  value: FormDataEntryValue | null
): { question: string; answer: string; defaultOpen: boolean }[] {
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    let defaultUsed = false;
    return parsed.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const { question, answer, defaultOpen } = entry as Record<string, unknown>;
      const q = typeof question === "string" ? question.trim() : "";
      const a = typeof answer === "string" ? answer.trim() : "";
      if (!q || !a) return [];

      const open = defaultOpen === true && !defaultUsed;
      if (open) defaultUsed = true;
      return [{ question: q, answer: a, defaultOpen: open }];
    });
  } catch {
    return [];
  }
}

// Specificațiile vin dintr-un singur câmp JSON (vezi components/admin/SpecEditor).
function parseSpecs(value: FormDataEntryValue | null): { label: string; value: string }[] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const { label, value } = entry as Record<string, unknown>;
      const l = typeof label === "string" ? label.trim() : "";
      const v = typeof value === "string" ? value.trim() : "";
      return l && v ? [{ label: l, value: v }] : [];
    });
  } catch {
    return [];
  }
}

// Tipurile/variantele produsului, dintr-un singur câmp JSON (vezi
// components/admin/VariantEditor). Prețul gol = costă cât produsul de bază.
function parseVariants(
  value: FormDataEntryValue | null
): { label: string; price?: number; stock: number }[] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const { label, price, stock } = entry as Record<string, unknown>;
      const l = typeof label === "string" ? label.trim() : "";
      if (!l) return [];
      const p = typeof price === "string" ? Number(price.replace(",", ".")) : Number(price);
      const s = typeof stock === "string" ? Number(stock) : Number(stock);
      const stockVal = Number.isFinite(s) && s > 0 ? Math.round(s) : 0;
      return [Number.isFinite(p) && p > 0 ? { label: l, price: p, stock: stockVal } : { label: l, stock: stockVal }];
    });
  } catch {
    return [];
  }
}

// Recenziile vin dintr-un singur câmp JSON (vezi components/admin/ReviewEditor).
function parseReviews(
  value: FormDataEntryValue | null
): { author: string; rating: number; text: string; date: Date }[] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const { author, rating, text, date } = entry as Record<string, unknown>;
      const a = typeof author === "string" ? author.trim() : "";
      const t = typeof text === "string" ? text.trim() : "";
      const r = typeof rating === "number" ? Math.min(5, Math.max(1, Math.round(rating))) : 5;
      if (!a || !t) return [];
      // Păstrează data existentă la editare; pune acum pentru recenzii noi.
      const d = typeof date === "string" && !Number.isNaN(Date.parse(date)) ? new Date(date) : new Date();
      return [{ author: a, rating: r, text: t, date: d }];
    });
  } catch {
    return [];
  }
}

function parseNumber(value: FormDataEntryValue | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function buildBookData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const images = formData.getAll("images").map(String).filter(Boolean);

  const price = parseNumber(formData.get("price"));
  const discountPrice = parseNumber(formData.get("discountPrice"));
  const rating = parseNumber(formData.get("rating")) ?? 0;
  const reviewCount = parseNumber(formData.get("reviewCount")) ?? 0;
  const pageCount = parseNumber(formData.get("pageCount"));
  const weightGrams = parseNumber(formData.get("weightGrams"));
  const faqs = parseFaqs(formData.get("faqs"));
  const reviews = parseReviews(formData.get("reviews"));
  const specs = parseSpecs(formData.get("specs"));
  const variants = parseVariants(formData.get("variants"));

  const publisher = String(formData.get("publisher") ?? "").trim() || undefined;
  const isbn = String(formData.get("isbn") ?? "").trim() || undefined;
  const language = String(formData.get("language") ?? "").trim() || "Română";

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const isBestseller = formData.get("isBestseller") === "on";
  const bestsellerOrder = parseNumber(formData.get("bestsellerOrder")) ?? 0;
  const displayOrder = parseNumber(formData.get("displayOrder")) ?? 0;
  const isNew = formData.get("isNew") === "on";
  // Dacă formularul NU trimite deloc câmpul (a fost scos din greșeală la o
  // modificare de interfață — s-a întâmplat), NU punem 0: asta ar goli stocul
  // tuturor produselor la prima salvare, tăcut. Absența câmpului lasă valoarea
  // din baza de date neatinsă; doar un câmp trimis gol înseamnă 0.
  const stockRaw = formData.get("stock");
  const stock = stockRaw === null ? undefined : (parseNumber(stockRaw) ?? 0);

  const errors: Record<string, string> = {};
  if (title.length < 2) errors.title = "Introdu titlul cărții.";
  // Autorul e OPȚIONAL. Catalogul nu e format doar din cărți: etichete,
  // cartonașe, pliante, manuale — pentru ele „autor" n-are sens. Cât timp a
  // fost obligatoriu, 18 din 19 produse nu puteau fi salvate deloc din admin:
  // deschideai produsul, schimbai stocul, apăsai Salvează și primeai
  // „Introdu autorul", fără ca modificarea să intre.
  if (description.length < 10) errors.description = "Descrierea e prea scurtă.";
  if (!coverImage) errors.coverImage = "Încarcă o copertă.";
  if (!categoryId) errors.categoryId = "Alege o categorie.";
  if (price === undefined || price <= 0) errors.price = "Introdu un preț valid.";

  const slug = slugify(slugInput || title);
  if (!slug) errors.slug = "Slug invalid.";

  let category: { name: string } | null = null;
  if (categoryId) {
    category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });
    if (!category) errors.categoryId = "Categorie inexistentă.";
  }

  // Fără diacritice, la fel ca seed.ts și ca interogarea din lib/search.ts —
  // altfel „carti" nu ar găsi „cărți" (bug real, reparat în auditul din iulie 2026).
  const searchText = normalizeForSearch(
    [title, author, category?.name ?? "", ...tags].join(" ")
  );

  // Rating-ul și numărul de recenzii se derivă din recenziile reale, ca stelele
  // afișate să corespundă mereu cu ce e scris dedesubt.
  const computedRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : (rating ?? 0);
  const computedReviewCount = reviews.length > 0 ? reviews.length : (reviewCount ?? 0);

  return {
    errors,
    data: {
      title,
      slug,
      author,
      description,
      coverImage,
      images,
      categoryId,
      price: price ?? 0,
      discountPrice,
      rating: computedRating,
      reviewCount: computedReviewCount,
      pageCount,
      weightGrams,
      faqs,
      reviews,
      specs,
      variants,
      publisher,
      isbn,
      language,
      tags,
      isBestseller,
      bestsellerOrder,
      displayOrder,
      isNew,
      stock,
      searchText,
    },
  };
}

export async function createBook(
  _prevState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  const { errors, data } = await buildBookData(formData);

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Verifică datele introduse.", fieldErrors: errors };
  }

  let created;
  try {
    created = await prisma.book.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "Acest slug este deja folosit de altă carte.",
        fieldErrors: { slug: "Slug duplicat." },
      };
    }
    throw error;
  }

  // Anunțăm abonații la newsletter despre lansare (dacă e bifat, implicit da).
  if (formData.get("notifySubscribers") === "on") {
    await sendNewBookAnnouncement({
      title: created.title,
      author: created.author,
      slug: created.slug,
      coverImage: created.coverImage,
      price: created.price,
      discountPrice: created.discountPrice,
    });
  }

  updateTag(CACHE_TAGS.books);
  revalidatePath("/admin/carti");
  revalidatePath("/", "layout");
  redirect("/admin/carti");
}

export async function updateBook(
  id: string,
  _prevState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  const { errors, data } = await buildBookData(formData);

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Verifică datele introduse.", fieldErrors: errors };
  }

  try {
    await prisma.book.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "Acest slug este deja folosit de altă carte.",
        fieldErrors: { slug: "Slug duplicat." },
      };
    }
    throw error;
  }

  updateTag(CACHE_TAGS.books);
  revalidatePath("/admin/carti");
  revalidatePath("/", "layout");
  redirect("/admin/carti");
}

export async function deleteBook(id: string) {
  await prisma.book.delete({ where: { id } });
  updateTag(CACHE_TAGS.books);
  revalidatePath("/admin/carti");
  revalidatePath("/", "layout");
}
