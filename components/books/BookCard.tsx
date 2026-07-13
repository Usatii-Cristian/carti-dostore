import Image from "next/image";
import Link from "next/link";
import type { BookCardData } from "@/lib/types";
import { StarRating } from "./StarRating";
import { PriceTag } from "./PriceTag";
import { FavoriteButton } from "./FavoriteButton";
import { AddToCartButton } from "./AddToCartButton";

export function BookCard({ book }: { book: BookCardData }) {
  const outOfStock = book.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/70 transition-shadow hover:shadow-md">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cream-soft">
        <Link href={`/carti/${book.slug}`} className="relative block h-full w-full">
          <Image
            src={book.coverImage}
            alt={`Coperta cărții ${book.title}`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="absolute right-2 top-2">
          <FavoriteButton book={book} />
        </div>

        {book.discountPrice != null && book.discountPrice < book.price && (
          <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-semibold text-cream">
            Reducere
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-ink">
              Stoc epuizat
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link
          href={`/carti/${book.slug}`}
          className="line-clamp-2 text-sm font-semibold text-ink hover:text-terracotta"
        >
          {book.title}
        </Link>
        <p className="text-xs text-ink-soft">{book.author}</p>

        <StarRating rating={book.rating} reviewCount={book.reviewCount} size={14} />

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <PriceTag price={book.price} discountPrice={book.discountPrice} />
          <AddToCartButton book={book} outOfStock={outOfStock} />
        </div>
      </div>
    </div>
  );
}
