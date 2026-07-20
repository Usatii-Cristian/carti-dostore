"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export type BlogFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function parseForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim() || "Dostore Carti";
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const published = formData.get("published") === "on";

  const errors: Record<string, string> = {};
  if (title.length < 3) errors.title = "Titlul e prea scurt.";
  if (excerpt.length < 10) errors.excerpt = "Scrie un rezumat de cel puțin 10 caractere.";
  if (content.length < 30) errors.content = "Articolul e prea scurt.";
  if (!coverImage) errors.coverImage = "Adaugă o imagine de copertă.";

  return {
    errors,
    data: {
      title,
      slug: slugify(slugInput || title),
      excerpt,
      content,
      coverImage,
      author,
      tags,
      published,
    },
  };
}

// Blogul apare în meniu, pe homepage (bannerul „De pe blog") și în sitemap —
// deci orice mutație trebuie să invalideze tot subarborele public, nu doar /blog.
function revalidateBlog() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/blog");
}

export async function createPost(
  _prevState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const { errors, data } = parseForm(formData);
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Verifică datele introduse.", fieldErrors: errors };
  }

  try {
    await prisma.blogPost.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "Există deja un articol cu acest slug.",
        fieldErrors: { slug: "Slug deja folosit." },
      };
    }
    throw error;
  }

  revalidateBlog();
  redirect("/admin/blog");
}

export async function updatePost(
  id: string,
  _prevState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const { errors, data } = parseForm(formData);
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Verifică datele introduse.", fieldErrors: errors };
  }

  try {
    await prisma.blogPost.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "Există deja un articol cu acest slug.",
        fieldErrors: { slug: "Slug deja folosit." },
      };
    }
    throw error;
  }

  revalidateBlog();
  redirect("/admin/blog");
}

export async function deletePost(id: string): Promise<void> {
  await prisma.blogPost.delete({ where: { id } });
  revalidateBlog();
}
