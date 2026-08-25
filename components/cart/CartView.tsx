"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  useCartStore,
  cartItemPrice,
  cartItemKey,
  SHIPPING_LOCAL,
  SHIPPING_NATIONAL,
} from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";
import { useOutOfStockIds } from "@/lib/store/use-out-of-stock";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  // Coșul e salvat în localStorage: un produs adăugat mai demult poate fi între
  // timp epuizat. Verificăm starea reală înainte ca clientul să ajungă la plată.
  const outOfStockIds = useOutOfStockIds();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-terracotta">
          <ShoppingBag className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Coșul tău e gol
        </h1>
        <p className="mt-3 text-ink-soft">
          Nu ai adăugat încă nicio carte în coș. Descoperă recomandările noastre.
        </p>
        <Link
          href="/carti/bestsellers"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
        >
          Vezi bestsellers
        </Link>
      </div>
    );
  }

  const hasUnavailable = items.some((item) => outOfStockIds.has(item.id));
  const subtotal = items.reduce((sum, item) => sum + cartItemPrice(item) * item.quantity, 0);
  // În coș nu știm încă localitatea, deci nu putem afișa un cost exact — arătăm
  // intervalul și lăsăm calculul final pe checkout, unde se alege orașul.
  const total = subtotal;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Coșul tău</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={cartItemKey(item)}
              className="flex gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/70"
            >
              <Link href={`/carti/${item.slug}`} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-soft">
                <Image
                  src={item.coverImage}
                  alt={`Coperta cărții ${item.title}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/carti/${item.slug}`}
                      className="font-semibold text-ink hover:text-terracotta"
                    >
                      {item.title}
                    </Link>
                    {item.variantLabel ? (
                      <p className="text-sm font-medium text-terracotta">{item.variantLabel}</p>
                    ) : (
                      <p className="text-sm text-ink-soft">{item.author}</p>
                    )}
                    {outOfStockIds.has(item.id) && (
                      <p className="mt-1 inline-block rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink-soft">
                        Nu mai este în stoc
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(cartItemKey(item))}
                    aria-label={`Scoate „${item.title}” din coș`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-cream-soft hover:text-terracotta sm:h-8 sm:w-8"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-2 rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => setQuantity(cartItemKey(item), item.quantity - 1)}
                      aria-label="Scade cantitatea"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors sm:h-8 sm:w-8 hover:bg-cream-soft"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-ink">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(cartItemKey(item), item.quantity + 1)}
                      aria-label="Crește cantitatea"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors sm:h-8 sm:w-8 hover:bg-cream-soft"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <p className="font-semibold text-ink">
                    {formatPrice(cartItemPrice(item) * item.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <h2 className="font-serif text-lg font-semibold text-ink">Sumar comandă</h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">
                Transport
                <span className="block text-xs text-ink-soft/70">
                  Se calculează la checkout
                </span>
              </dt>
              <dd className="text-right font-medium text-ink">
                {SHIPPING_LOCAL}–{SHIPPING_NATIONAL} lei
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-semibold text-ink">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatPrice(total)}</dd>
            </div>
          </dl>

          {hasUnavailable ? (
            <p className="mt-5 rounded-xl bg-ink/5 px-4 py-3 text-center text-sm font-medium text-ink-soft">
              Scoate din coș produsele epuizate ca să poți finaliza comanda.
            </p>
          ) : (
            <Link
              href="/checkout"
              className="mt-5 flex w-full items-center justify-center rounded-full bg-terracotta px-7 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
            >
              Finalizează comanda
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
