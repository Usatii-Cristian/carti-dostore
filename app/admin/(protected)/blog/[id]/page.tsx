import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePost } from "@/lib/actions/admin-blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const metadata: Metadata = { title: "Editează articol — Admin Dostore Carti" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Editează articolul</h1>
      <BlogPostForm action={updatePost.bind(null, post.id)} initialPost={post} />
    </div>
  );
}
