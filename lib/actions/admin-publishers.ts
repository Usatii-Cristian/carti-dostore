"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export type PublisherFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function createPublisher(
  _prevState: PublisherFormState,
  formData: FormData
): Promise<PublisherFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(name);

  if (name.length < 2) {
    return { status: "error", message: "Introdu numele editurii.", fieldErrors: { name: "Introdu numele editurii." } };
  }
  if (!slug) {
    return { status: "error", message: "Nume invalid." };
  }

  try {
    await prisma.publisher.create({ data: { name, slug } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", message: "Există deja o editură cu acest nume." };
    }
    throw error;
  }

  revalidatePath("/admin/edituri");
  revalidatePath("/", "layout");
  redirect("/admin/edituri");
}

export async function deletePublisher(id: string) {
  await prisma.publisher.delete({ where: { id } });
  revalidatePath("/admin/edituri");
  revalidatePath("/", "layout");
  redirect("/admin/edituri");
}
