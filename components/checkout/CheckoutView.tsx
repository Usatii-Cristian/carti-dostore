"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore, cartItemPrice, getShippingCost } from "@/lib/store/cart";
import { createOrderAndPay, type CheckoutState } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/format";
import { CityAutocomplete } from "./CityAutocomplete";

const initialState: CheckoutState = { status: "idle" };

const PAYMENT_METHODS = [
  {
    value: "ONLINE",
    label: "Plătește acum, pe site (card / QR)",
    hint: "Scanezi un cod QR și plătești instant din aplicația băncii.",
  },
  {
    value: "CARD_ON_DELIVERY",
    label: "Card la livrare",
    hint: "Plătești curierului cu cardul, la primirea coletului.",
  },
  {
    value: "CASH_ON_DELIVERY",
    label: "Numerar la livrare",
    hint: "Plătești cash curierului, la primirea coletului.",
  },
] as const;

// „city" nu e aici: are câmp propriu cu autocomplete din localitățile FAN
// (vezi CityAutocomplete), fiindcă trebuie să deducă și raionul.
const FIELDS: {
  name: "customerName" | "email" | "phone" | "shippingAddress";
  label: string;
  type: string;
  autoComplete: string;
  colSpan?: boolean;
}[] = [
  { name: "customerName", label: "Nume complet", type: "text", autoComplete: "name", colSpan: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Telefon", type: "tel", autoComplete: "tel" },
  { name: "shippingAddress", label: "Adresă de livrare", type: "text", autoComplete: "street-address", colSpan: true },
];

export function CheckoutView() {
  const items = useCartStore((state) => state.items);
  const boundAction = createOrderAndPay.bind(null, items);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

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
          Adaugă câteva cărți în coș înainte de a finaliza o comandă.
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

  const subtotal = items.reduce((sum, item) => sum + cartItemPrice(item) * item.quantity, 0);
  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
        Finalizează comanda
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <form
          action={formAction}
          noValidate
          className="space-y-5 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70"
        >
          <h2 className="font-serif text-lg font-semibold text-ink">Datele tale</h2>

          {state.status === "error" && state.message && (
            <p role="alert" className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm font-medium text-terracotta">
              {state.message}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.name} className={field.colSpan ? "sm:col-span-2" : undefined}>
                <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-ink">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  defaultValue={state.values?.[field.name] ?? ""}
                  aria-invalid={Boolean(state.fieldErrors?.[field.name])}
                  aria-describedby={state.fieldErrors?.[field.name] ? `${field.name}-error` : undefined}
                  className={`w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 ${
                    state.fieldErrors?.[field.name]
                      ? "border-terracotta"
                      : "border-border focus:border-terracotta"
                  }`}
                />
                {state.fieldErrors?.[field.name] && (
                  <p id={`${field.name}-error`} className="mt-1.5 text-xs font-medium text-terracotta">
                    {state.fieldErrors[field.name]}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-ink">
                Oraș / localitate
              </label>
              <CityAutocomplete
                defaultCity={state.values?.city ?? ""}
                defaultCounty={state.values?.county ?? ""}
                inputClassName={`w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 ${
                  state.fieldErrors?.city
                    ? "border-terracotta"
                    : "border-border focus:border-terracotta"
                }`}
              />
              {state.fieldErrors?.city && (
                <p className="mt-1.5 text-xs font-medium text-terracotta">
                  {state.fieldErrors.city}
                </p>
              )}
            </div>
          </div>

          <fieldset className="border-t border-border pt-5">
            <legend className="mb-3 font-serif text-lg font-semibold text-ink">
              Metoda de plată
            </legend>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((method, index) => (
                <label
                  key={method.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3.5 transition-colors has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    defaultChecked={index === 0}
                    className="mt-0.5 h-4 w-4 accent-terracotta"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{method.label}</span>
                    <span className="block text-xs text-ink-soft">{method.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="border-t border-border pt-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="terms"
                defaultChecked={state.values?.terms === "on"}
                aria-invalid={Boolean(state.fieldErrors?.terms)}
                className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded border-border accent-terracotta"
              />
              <span className="text-sm leading-relaxed text-ink-soft">
                Am citit și accept{" "}
                <Link href="/termeni-si-conditii" target="_blank" className="font-medium text-terracotta underline">
                  Termenii și condițiile
                </Link>
                ,{" "}
                <Link href="/confidentialitate" target="_blank" className="font-medium text-terracotta underline">
                  Politica de confidențialitate
                </Link>
                ,{" "}
                <Link href="/retur-si-rambursare" target="_blank" className="font-medium text-terracotta underline">
                  Politica de retur
                </Link>{" "}
                și{" "}
                <Link href="/livrare-si-plata" target="_blank" className="font-medium text-terracotta underline">
                  condițiile de livrare
                </Link>
                .
              </span>
            </label>
            {state.fieldErrors?.terms ? (
              <p role="alert" className="mt-2 text-xs font-medium text-terracotta">
                {state.fieldErrors.terms}
              </p>
            ) : (
              <p className="mt-2 text-xs text-ink-soft">
                Acceptul e necesar ca să poți plasa comanda și să primești produsele.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center rounded-full bg-terracotta px-7 py-3.5 font-semibold text-cream transition-colors hover:bg-terracotta-dark disabled:opacity-60"
          >
            {pending ? "Se procesează..." : `Trimite comanda · ${formatPrice(total)}`}
          </button>
        </form>

        <div className="h-fit space-y-4 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border/70">
          <h2 className="font-serif text-lg font-semibold text-ink">Comanda ta</h2>

          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-cream-soft">
                  <Image
                    src={item.coverImage}
                    alt={`Coperta cărții ${item.title}`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
                  <span className="block text-xs text-ink-soft">Cantitate: {item.quantity}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-ink">
                  {formatPrice(cartItemPrice(item) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Transport</dt>
              <dd className="font-medium text-ink">
                {shipping === 0 ? "Gratuit" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="font-semibold text-ink">{formatPrice(total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
