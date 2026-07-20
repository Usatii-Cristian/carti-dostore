import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getPublishedPosts,
  countPublishedPosts,
  formatPostDate,
  readingTimeMinutes,
  BLOG_PAGE_SIZE,
} from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articole despre cărți, uleiuri esențiale și dezvoltare personală, scrise pentru cititorii din Moldova.",
};

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const { page } = await searchParams;
  // „page" = câte pagini sunt afișate CUMULAT (butonul „Afișează mai multe" o
  // incrementează), nu a câta pagină izolată — articolele se adună pe ecran,
  // dar totul rămâne randat pe server și partajabil prin URL.
  const pagesShown = Math.max(1, Number(page) || 1);

  const [posts, total] = await Promise.all([
    getPublishedPosts(pagesShown * BLOG_PAGE_SIZE),
    countPublishedPosts(),
  ]);

  const hasMore = posts.length < total;
  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="font-medium uppercase tracking-widest text-terracotta">Blog</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">
          Povești despre cărți și lucruri care fac bine
        </h1>
        <p className="mt-3 text-lg text-ink-soft">
          Recomandări, ghiduri practice și gânduri despre cititul care schimbă ceva.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-ink-soft">
          Încă n-am publicat niciun articol. Revino în curând.
        </p>
      ) : (
        <>
          {/* Primul articol, pe toată lățimea */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-10 grid grid-cols-1 gap-0 overflow-hidden rounded-2xl bg-card ring-1 ring-border/70 transition-shadow hover:shadow-lg md:grid-cols-2"
          >
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[22rem]">
              <Image
                src={featured.coverImage}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8">
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <time dateTime={featured.publishedAt.toISOString()}>
                  {formatPostDate(featured.publishedAt)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{readingTimeMinutes(featured.content)} min de citit</span>
              </div>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-ink group-hover:text-terracotta sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-ink-soft">{featured.excerpt}</p>
              <span className="mt-5 text-sm font-semibold text-terracotta">
                Citește articolul →
              </span>
            </div>
          </Link>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-border/70 transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-ink-soft">
                    <time dateTime={post.publishedAt.toISOString()}>
                      {formatPostDate(post.publishedAt)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{readingTimeMinutes(post.content)} min</span>
                  </div>
                  <h2 className="mt-2 font-serif text-lg font-semibold text-ink group-hover:text-terracotta">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <Link
                href={`/blog?page=${pagesShown + 1}`}
                scroll={false}
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta"
              >
                Afișează mai multe articole
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
