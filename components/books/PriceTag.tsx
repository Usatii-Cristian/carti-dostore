import { formatPrice } from "@/lib/format";

export function PriceTag({
  price,
  discountPrice,
  size = "md",
}: {
  price: number;
  discountPrice?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const hasDiscount = discountPrice != null && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;

  // Prețul final e cel mai mare element (mai mare decât titlul).
  const finalSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-2xl";
  const oldSize = size === "sm" ? "text-[11px]" : "text-sm";
  const badgeSize = size === "sm" ? "text-[10px]" : "text-xs";

  // Varianta compactă (ex. sugestii de căutare): pe un singur rând, fără badge-uri.
  if (size === "sm") {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-bold text-ink">{formatPrice(finalPrice)}</span>
        {hasDiscount && (
          <span className={`text-ink-soft line-through ${oldSize}`}>{formatPrice(price)}</span>
        )}
      </div>
    );
  }

  const saved = hasDiscount ? price - discountPrice : 0;
  const percent = hasDiscount ? Math.round((1 - discountPrice / price) * 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      {hasDiscount && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-ink-soft line-through ${oldSize}`}>{formatPrice(price)}</span>
          <span
            className={`inline-flex items-center rounded-full bg-terracotta px-2 py-0.5 font-semibold text-cream ${badgeSize}`}
          >
            −{formatPrice(saved)}
          </span>
          <span
            className={`inline-flex items-center rounded-full bg-terracotta/10 px-2 py-0.5 font-semibold text-terracotta ${badgeSize}`}
          >
            −{percent}%
          </span>
        </div>
      )}
      <span className={`font-bold leading-none text-ink ${finalSize}`}>
        {formatPrice(finalPrice)}
      </span>
    </div>
  );
}
