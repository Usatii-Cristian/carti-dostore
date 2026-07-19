"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify, normalizeForSearch } from "@/lib/slugify";
import { sendNewBookAnnouncement } from "@/lib/email/notifications";

export type BookFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

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
  const stock = parseNumber(formData.get("stock")) ?? 0;
  const rating = parseNumber(formData.get("rating")) ?? 0;
  const reviewCount = parseNumber(formData.get("reviewCount")) ?? 0;
  const pageCount = parseNumber(formData.get("pageCount"));

  const publisher = String(formData.get("publisher") ?? "").trim() || undefined;
  const isbn = String(formData.get("isbn") ?? "").trim() || undefined;
  const language = String(formData.get("language") ?? "").trim() || "Română";

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const isBestseller = formData.get("isBestseller") === "on";
  const isNew = formData.get("isNew") === "on";

  const errors: Record<string, string> = {};
  if (title.length < 2) errors.title = "Introdu titlul cărții.";
  if (author.length < 2) errors.author = "Introdu autorul.";
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
      stock,
      rating,
      reviewCount,
      pageCount,
      publisher,
      isbn,
      language,
      tags,
      isBestseller,
      isNew,
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

  revalidatePath("/admin/carti");
  revalidatePath("/", "layout");
  redirect("/admin/carti");
}

export async function deleteBook(id: string) {
  await prisma.book.delete({ where: { id } });
  revalidatePath("/admin/carti");
  revalidatePath("/", "layout");
}
