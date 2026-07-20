import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { getAllPostsForAdmin, formatPostDate } from "@/lib/blog";
import { deletePost } from "@/lib/actions/admin-blog";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Blog — Admin Dostore Carti" };

export default async function AdminBlogPage() {
  const posts = await getAllPostsForAdmin();
  const published = posts.filter((post) => post.published).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-500">
            {posts.length} {posts.length === 1 ? "articol" : "articole"} · {published} publicate
          </p>
        </div>
        <Link
          href="/admin/blog/nou"
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Articol nou
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500">
          Niciun articol încă. Apasă „Articol nou" ca să scrii primul.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Articol</th>
                <th className="px-4 py-3 font-medium">Stare</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Publicat</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-slate-100">
                        <Image
                          src={post.coverImage}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{post.title}</p>
                        <p className="truncate text-xs text-slate-500">/blog/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {post.published ? "Publicat" : "Ciornă"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                    {formatPostDate(post.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {post.published && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-slate-400 transition-colors hover:text-slate-900"
                          aria-label={`Vezi „${post.title}" pe site`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-medium text-navy hover:underline"
                      >
                        Editează
                      </Link>
                      <DeleteButton
                        action={deletePost.bind(null, post.id)}
                        confirmMessage={`Ștergi articolul „${post.title}"?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
