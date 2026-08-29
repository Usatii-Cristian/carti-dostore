import Image from "next/image";
import Link from "next/link";
import type { BookCardData } from "@/lib/types";
import { isAvailable } from "@/lib/orders/availability";
import { StarRating } from "./StarRating";
import { PriceTag } from "./PriceTag";
import { FavoriteButton } from "./FavoriteButton";
import { AddToCartButton } from "./AddToCartButton";

export function BookCard({ book, priority = false }: { book: BookCardData; priority?: boolean }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-cream ring-1 ring-transparent transition-all duration-200 hover:shadow-lg hover:ring-border">
      {/* Proporția reală a coperților (706x1000 ≈ 5/7), nu pătrat: încadrarea în
          pătrat le tăia lateral, de unde senzația de imagine „prea apropiată".
          `object-contain` păstrează întreg și ce se încarcă din admin, unde
          proporția sursei poate fi oricare (upload-ul folosește `fit: inside`). */}
      <div className="relative aspect-[5/7] w-full overflow-hidden bg-cream">
        {/* : o listă cu 19 carduri trimitea ~50 de cereri de
            preîncărcare la fiecare deschidere. Paginile de produs sunt oricum
            prerandate și servite din CDN, deci navigarea rămâne instantanee. */}
        <Link href={`/carti/${book.slug}`} prefetch={false} className="relative block h-full w-full">
          <Image
            src={book.coverImage}
            alt={`Coperta cărții ${book.title}`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
            // 65 în loc de 75: pe coperți diferența nu se vede, dar taie ~30%
            // din greutatea catalogului, unde se încarcă zeci de imagini.
            quality={65}
            // Primele carduri sunt elementul LCP al listei: le încărcăm devreme,
            // restul rămân leneșe.
            priority={priority}
            className="object-contain"
          />
        </Link>

        <div className="absolute right-2 top-2">
          <FavoriteButton book={book} />
        </div>

        {!isAvailable(book) ? (
          // Produsul epuizat rămâne în listă (poate reveni în stoc), dar se vede
          // din prima că nu se poate comanda — altfel clientul ar afla abia la
          // butonul inactiv.
          <span className="absolute left-2 top-2 rounded-full bg-ink/75 px-2 py-0.5 text-[11px] font-semibold text-cream">
            Stoc epuizat
          </span>
        ) : (
          book.discountPrice != null &&
          book.discountPrice < book.price && (
            <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-semibold text-cream">
              Reducere
            </span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link
          href={`/carti/${book.slug}`}
          prefetch={false}
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
