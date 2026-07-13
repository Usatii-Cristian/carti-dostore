"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export type CategoryFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function buildCategoryData(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim() || undefined;
  const slug = slugify(slugInput || name);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Introdu numele categoriei.";
  if (!slug) errors.slug = "Slug invalid.";

  return { errors, data: { name, slug, icon } };
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const { errors, data } = buildCategoryData(formData);

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Verifică datele introduse.", fieldErrors: errors };
  }

  try {
    await prisma.category.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "Există deja o categorie cu acest nume sau slug.",
      };
    }
    throw error;
  }

  revalidatePath("/admin/categorii");
  redirect("/admin/categorii");
}

export async function updateCategory(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const { errors, data } = buildCategoryData(formData);

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Verifică datele introduse.", fieldErrors: errors };
  }

  try {
    await prisma.category.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "Există deja o categorie cu acest nume sau slug.",
      };
    }
    throw error;
  }

  revalidatePath("/admin/categorii");
  redirect("/admin/categorii");
}

export async function deleteCategory(id: string) {
  const booksInCategory = await prisma.book.count({ where: { categoryId: id } });

  if (booksInCategory > 0) {
    redirect(
      `/admin/categorii?error=${encodeURIComponent(
        `Nu poți șterge această categorie — are ${booksInCategory} cărți asociate. Mută-le mai întâi în altă categorie.`
      )}`
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorii");
  redirect("/admin/categorii");
}
