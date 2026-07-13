import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookBySlug, getSimilarBooks } from "@/lib/books";
import { StarRating } from "@/components/books/StarRating";
import { PriceTag } from "@/components/books/PriceTag";
import { ImageGallery } from "@/components/books/ImageGallery";
import { BookGrid } from "@/components/books/BookGrid";
import { AddToCartButton } from "@/components/books/AddToCartButton";
import { FavoriteButton } from "@/components/books/FavoriteButton";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) return {};

  const description = book.description.slice(0, 155);

  return {
    title: `${book.title} — ${book.author} | BookStore`,
    description,
    openGraph: {
      title: book.title,
      description,
      images: [{ url: book.coverImage }],
    },
  };
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) notFound();

  const galleryImages = [book.coverImage, ...book.images.filter((img) => img !== book.coverImage)];
  const similarBooks = await getSimilarBooks(book.categoryId, book.id, 4);
  const outOfStock = book.stock <= 0;

  const details = [
    { label: "Editură", value: book.publisher },
    { label: "ISBN", value: book.isbn },
    { label: "Limbă", value: book.language },
    { label: "Număr pagini", value: book.pageCount ? String(book.pageCount) : undefined },
  ].filter((detail) => detail.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/" className="hover:text-terracotta">
          Acasă
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/carti/categorie/${book.category.slug}`} className="hover:text-terracotta">
          {book.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <ImageGallery images={galleryImages} title={book.title} />

        <div>
          <Link
            href={`/carti/categorie/${book.category.slug}`}
            className="text-sm font-semibold text-terracotta hover:text-terracotta-dark"
          >
            {book.category.name}
          </Link>

          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            {book.title}
          </h1>
          <p className="mt-1.5 text-ink-soft">{book.author}</p>

          <div className="mt-3">
            <StarRating rating={book.rating} reviewCount={book.reviewCount} size={18} />
          </div>

          <div className="mt-5">
            <PriceTag price={book.price} discountPrice={book.discountPrice} size="lg" />
          </div>

          <p className={`mt-2 text-sm font-medium ${outOfStock ? "text-terracotta" : "text-ink-soft"}`}>
            {outOfStock
              ? "Stoc epuizat"
              : book.stock === 1
                ? "Ultimul exemplar în stoc"
                : `În stoc — ${book.stock} exemplare disponibile`}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton book={book} outOfStock={outOfStock} variant="full" />
            <FavoriteButton book={book} variant="full" />
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-serif text-lg font-semibold text-ink">Descriere</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{book.description}</p>
          </div>

          {details.length > 0 && (
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="font-serif text-lg font-semibold text-ink">Detalii</h2>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {details.map((detail) => (
                  <div key={detail.label} className="flex justify-between border-b border-border/70 py-1.5 text-sm">
                    <dt className="text-ink-soft">{detail.label}</dt>
                    <dd className="font-medium text-ink">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {similarBooks.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-serif text-2xl font-semibold text-ink">Cărți similare</h2>
          <BookGrid books={similarBooks} variant="compact" />
        </section>
      )}
    </div>
  );
}
