import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts, formatPostDate, readingTimeMinutes } from "@/lib/blog";
import { prisma } from "@/lib/prisma";
import { Markdown } from "@/components/blog/Markdown";

// Prerandare statică + ISR 1h (ca la produse). 404-ul corect e asigurat după
// eliminarea loading.tsx de la nivel de /blog.
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      images: [{ url: post.coverImage }],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // Ciornele nu sunt vizibile public.
  if (!post || !post.published) notFound();

  const related = await getRelatedPosts(post.id, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/" className="hover:text-terracotta">
          Acasă
        </Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-terracotta">
          Blog
        </Link>
      </nav>

      <header>
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <time dateTime={post.publishedAt.toISOString()}>{formatPostDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTimeMinutes(post.content)} min de citit</span>
          <span aria-hidden="true">·</span>
          <span>{post.author}</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{post.excerpt}</p>
      </header>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
        <Image
          src={post.coverImage}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <div className="mt-10">
        <Markdown content={post.content} />
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cream-soft px-3 py-1 text-xs font-medium text-ink-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="mb-5 font-serif text-2xl font-semibold text-ink">Citește mai departe</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} href={`/blog/${item.slug}`} className="group">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                  <Image
                    src={item.coverImage}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-2.5 text-sm font-semibold text-ink group-hover:text-terracotta">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
