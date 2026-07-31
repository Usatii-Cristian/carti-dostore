import Image from "next/image";
import Link from "next/link";
import type { BookCardData } from "@/lib/types";
import { StarRating } from "./StarRating";
import { PriceTag } from "./PriceTag";
import { FavoriteButton } from "./FavoriteButton";
import { AddToCartButton } from "./AddToCartButton";

export function BookCard({ book }: { book: BookCardData }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-cream ring-1 ring-transparent transition-all duration-200 hover:shadow-lg hover:ring-border">
      {/* `object-contain`, nu `cover`: imaginile din catalog sunt pătrate, deci
          arată identic, dar cele încărcate din admin păstrează proporția sursei
          (upload-ul folosește `fit: inside`) — cu `cover` li se tăiau marginile. */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream">
        <Link href={`/carti/${book.slug}`} className="relative block h-full w-full">
          <Image
            src={book.coverImage}
            alt={`Coperta cărții ${book.title}`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
            className="object-contain"
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

      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link
          href={`/carti/${book.slug}`}
          className="line-clamp-2 text-sm font-semibold text-ink hover:text-terracotta"
        >
          {book.title}
        </Link>
        {book.author && <p className="text-xs text-ink-soft">{book.author}</p>}

        <StarRating rating={book.rating} reviewCount={book.reviewCount} size={14} />

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <PriceTag price={book.price} discountPrice={book.discountPrice} />
          <AddToCartButton book={book} />
        </div>
      </div>
    </div>
  );
}
