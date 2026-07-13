"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore, cartItemPrice } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { formatPrice } from "@/lib/format";

export function HeaderActions() {
  const favoriteCount = useFavoritesStore((state) => state.items.length);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + cartItemPrice(item) * item.quantity,
    0
  );

  return (
    <div className="ml-auto flex items-center gap-2 sm:ml-0">
      <Link
        href="/favorite"
        aria-label="Favorite"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-cream-soft"
      >
        <Heart className="h-5.5 w-5.5" aria-hidden="true" />
        {favoriteCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-cream">
            {favoriteCount}
          </span>
        )}
      </Link>

      <Link
        href="/cos"
        aria-label="Coșul de cumpărături"
        className="flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 text-navy hover:bg-cream-soft"
      >
        <span className="relative flex h-8 w-8 items-center justify-center">
          <ShoppingCart className="h-5.5 w-5.5" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-cream">
              {cartCount}
            </span>
          )}
        </span>
        <span className="hidden text-sm font-semibold sm:inline">{formatPrice(cartTotal)}</span>
      </Link>
    </div>
  );
}
