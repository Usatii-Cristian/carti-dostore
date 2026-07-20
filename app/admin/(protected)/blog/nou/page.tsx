import type { Metadata } from "next";
import { createPost } from "@/lib/actions/admin-blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const metadata: Metadata = { title: "Articol nou — Admin Dostore Carti" };

export default function NewBlogPostPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Articol nou</h1>
      <BlogPostForm action={createPost} />
    </div>
  );
}
