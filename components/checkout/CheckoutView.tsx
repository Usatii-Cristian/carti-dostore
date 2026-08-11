"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import {
  useCartStore,
  cartItemPrice,
  getShippingCost,
  getCodFee,
  isLocalDelivery,
  COD_FEE,
  SHIPPING_LOCAL,
  SHIPPING_NATIONAL,
} from "@/lib/store/cart";
import { createOrderAndPay, type CheckoutState } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/format";
import { CityAutocomplete } from "./CityAutocomplete";

const initialState: CheckoutState = { status: "idle" };

// Oglindesc regulile din lib/actions/checkout.ts — folosite DOAR ca să
// activăm/dezactivăm butonul (validarea reală, care contează, rămâne pe
// server; asta e strict UX, nu o barieră de securitate).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s()-]{6,20}$/;

const PAYMENT_METHODS = [
  {
    value: "ONLINE",
    // Numele oficial al serviciului, cerut expres de BNM: nu „card/QR", ci
    // MIA Plăți Instant. Logo-ul oficial apare lângă opțiune.
    label: "MIA Plăți Instant (MIA Instant Payments)",
    hint: "Plătești instant din aplicația băncii tale, scanând codul QR MIA. Banii se transferă direct din cont, fără card.",
    logo: "/plati/mia-logo.svg",
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
  name: "customerName" | "email" | "phone" | "shippingAddress" | "building" | "apartment";
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  colSpan?: boolean;
  /** Câmpurile opționale nu intră în validarea „formular complet". */
  optional?: boolean;
  hint?: string;
}[] = [
  {
    name: "customerName",
    label: "Nume complet",
    type: "text",
    autoComplete: "name",
    placeholder: "Ion Popescu",
    colSpan: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "ion.popescu@gmail.com",
  },
  {
    name: "phone",
    label: "Telefon",
    type: "tel",
    autoComplete: "tel",
    placeholder: "069 123 456",
  },
  {
    name: "shippingAddress",
    label: "Stradă și număr",
    type: "text",
    autoComplete: "street-address",
    placeholder: "Str. Ștefan cel Mare 12",
    colSpan: true,
  },
  // Blocul și apartamentul se cer separat: scrise într-un singur rând, se pierd
  // pe AWB și curierul ajunge să sune clientul ca să afle unde vine.
  {
    name: "building",
    label: "Bloc / casă",
    type: "text",
    autoComplete: "address-line2",
    placeholder: "bl. 3 sau casă",
    optional: true,
    hint: "Lasă gol dacă stai la casă.",
  },
  {
    name: "apartment",
    label: "Apartament / oficiu",
    type: "text",
    autoComplete: "address-line3",
    placeholder: "ap. 41",
    optional: true,
    hint: "Lasă gol dacă nu e cazul.",
  },
];

export function CheckoutView() {
  const items = useCartStore((state) => state.items);
  const boundAction = createOrderAndPay.bind(null, items);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  // Urmărite DOAR ca să știm când formularul e complet — inputurile rămân
  // necontrolate (defaultValue), ca să nu riscăm sărituri de cursor la fiecare
  // tastă. Butonul de trimitere rămâne transparent/inactiv până toate sunt
  // valide, exact ca validarea de pe server (vezi lib/actions/checkout.ts).
  const [values, setValues] = useState({
    customerName: state.values?.customerName ?? "",
    email: state.values?.email ?? "",
    phone: state.values?.phone ?? "",
    shippingAddress: state.values?.shippingAddress ?? "",
    city: state.values?.city ?? "",
    // Se completează DOAR când clientul apasă pe o localitate din listă.
    county: state.values?.county ?? "",
  });
  const [termsChecked, setTermsChecked] = useState(state.values?.terms === "on");
  // Bifa de livrare pornește NEBIFATĂ, intenționat: BNM a cerut ca livrarea să
  // fie ceva ce clientul acceptă el, nu un serviciu adăugat tacit. O căsuță deja
  // bifată n-ar fi o alegere reală.
  const [deliveryAccepted, setDeliveryAccepted] = useState(false);
  // Metoda de plată e urmărită ca să putem afișa taxa de ramburs (15 lei) doar
  // după ce clientul alege efectiv plata la livrare.
  const [paymentMethod, setPaymentMethod] = useState<string>(
    state.values?.paymentMethod ?? "ONLINE"
  );

  function updateField(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  const isFormComplete =
    values.customerName.trim().length >= 3 &&
    EMAIL_REGEX.test(values.email.trim()) &&
    PHONE_REGEX.test(values.phone.trim()) &&
    values.shippingAddress.trim().length >= 5 &&
    values.city.trim().length >= 2 &&
    // Localitatea trebuie ALEASĂ din listă, nu doar scrisă: raionul vine odată
    // cu ea, iar fără raion FAN nu acceptă expediția, deci comanda ar rămâne
    // nelivrabilă. Aceeași regulă e verificată și pe server.
    values.county.trim().length > 0 &&
    deliveryAccepted &&
    termsChecked;

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
  // Transportul depinde de localitate (Chișinău vs. restul țării), iar taxa de
  // ramburs apare doar dacă s-a ales plata la livrare. Aceleași reguli sunt
  // recalculate pe server (lib/actions/checkout.ts) — aici e doar afișarea.
  const cityChosen = values.city.trim().length >= 2;
  const shipping = getShippingCost(cityChosen ? values.city : undefined);
  const codFee = getCodFee(paymentMethod);
  const total = subtotal + shipping + codFee;

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
                  {field.optional && (
                    <span className="ml-1 font-normal text-ink-soft">(opțional)</span>
                  )}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  defaultValue={state.values?.[field.name] ?? ""}
                  onChange={(event) => {
                    if (!field.optional) {
                      updateField(field.name as keyof typeof values, event.target.value);
                    }
                  }}
                  aria-invalid={Boolean(state.fieldErrors?.[field.name])}
                  aria-describedby={state.fieldErrors?.[field.name] ? `${field.name}-error` : undefined}
                  className={`w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 ${
                    state.fieldErrors?.[field.name]
                      ? "border-terracotta"
                      : "border-border focus:border-terracotta"
                  }`}
                />
                {state.fieldErrors?.[field.name] ? (
                  <p id={`${field.name}-error`} className="mt-1.5 text-xs font-medium text-terracotta">
                    {state.fieldErrors[field.name]}
                  </p>
                ) : (
                  field.hint && <p className="mt-1.5 text-xs text-ink-soft">{field.hint}</p>
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
                onValueChange={(city, county) =>
                  setValues((current) => ({ ...current, city, county }))
                }
                inputClassName={`w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 ${
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

            <div className="sm:col-span-2">
              <label htmlFor="customerNote" className="mb-1.5 block text-sm font-medium text-ink">
                Mesaj pentru curier
                <span className="ml-1 font-normal text-ink-soft">(opțional)</span>
              </label>
              <textarea
                id="customerNote"
                name="customerNote"
                rows={2}
                maxLength={300}
                defaultValue={state.values?.customerNote ?? ""}
                placeholder="Ex: sunați cu 15 minute înainte, codul de la interfon e 41."
                className="w-full resize-y rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
            </div>
          </div>

          {/* Livrarea, declarată explicit: preț la vedere și o bifă a clientului.
              Cerut de BNM la verificarea site-ului — clientul trebuie să vadă
              cât costă livrarea și să confirme că o acceptă, iar dacă magazinul
              livrează exclusiv prin curier, asta trebuie spus pe față. */}
          <fieldset className="border-t border-border pt-5">
            <legend className="mb-3 font-serif text-lg font-semibold text-ink">Livrare</legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3.5 transition-colors has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5">
              <input
                type="checkbox"
                name="deliveryAccepted"
                checked={deliveryAccepted}
                onChange={(event) => setDeliveryAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-terracotta"
              />
              <span className="flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">
                    Livrare prin curier, la adresa indicată
                  </span>
                  <span className="text-sm font-semibold text-terracotta">
                    {cityChosen
                      ? formatPrice(shipping)
                      : `${SHIPPING_LOCAL}–${SHIPPING_NATIONAL} lei`}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-ink-soft">
                  {formatPrice(SHIPPING_LOCAL)} în Chișinău și {formatPrice(SHIPPING_NATIONAL)} în
                  restul Republicii Moldova, prin FAN Courier, în 1–3 zile lucrătoare.
                </span>
                <span className="mt-1 block text-xs text-ink-soft">
                  Produsele se expediază doar prin curier — nu avem ridicare personală, deci
                  livrarea face parte din orice comandă. Detalii în{" "}
                  <Link href="/termeni-si-conditii" target="_blank" className="font-medium text-terracotta underline">
                    Termeni și condiții
                  </Link>
                  .
                </span>
              </span>
            </label>
          </fieldset>

          <fieldset className="border-t border-border pt-5">
            <legend className="mb-3 font-serif text-lg font-semibold text-ink">
              Metoda de plată
            </legend>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3.5 transition-colors has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className="mt-0.5 h-4 w-4 accent-terracotta"
                  />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-ink">{method.label}</span>
                      {"logo" in method && method.logo && (
                        <Image
                          src={method.logo}
                          alt="MIA Plăți Instant"
                          width={291}
                          height={54}
                          className="h-5 w-auto"
                        />
                      )}
                    </span>
                    <span className="block text-xs text-ink-soft">{method.hint}</span>
                    {method.value !== "ONLINE" && (
                      <span className="mt-1 block text-xs font-medium text-terracotta">
                        + {COD_FEE} lei taxă de ramburs
                      </span>
                    )}
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
                checked={termsChecked}
                onChange={(event) => setTermsChecked(event.target.checked)}
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
            disabled={pending || !isFormComplete}
            title={
              !isFormComplete
                ? "Completează toate datele, acceptă livrarea și bifează acordul de mai sus"
                : undefined
            }
            className="flex w-full items-center justify-center rounded-full bg-terracotta px-7 py-3.5 font-semibold text-cream transition-opacity hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-terracotta"
          >
            {pending ? "Se procesează..." : `Trimite comanda · ${formatPrice(total)}`}
          </button>

          {!deliveryAccepted && (
            <p role="alert" className="text-center text-xs font-medium text-terracotta">
              Bifează livrarea prin curier ca să poți trimite comanda — produsele ajung la tine
              doar prin curier. Dacă ai nevoie de altă înțelegere, scrie-ne la{" "}
              <a href="mailto:dostore.moldova@gmail.com" className="underline">
                dostore.moldova@gmail.com
              </a>
              .
            </p>
          )}
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
              <dt className="text-ink-soft">
                Livrare prin curier
                <span className="block text-xs text-ink-soft/70">
                  {cityChosen
                    ? isLocalDelivery(values.city)
                      ? "Chișinău"
                      : "În toată țara"
                    : `${SHIPPING_LOCAL} lei Chișinău · ${SHIPPING_NATIONAL} lei restul țării`}
                </span>
              </dt>
              <dd className="font-medium text-ink">{formatPrice(shipping)}</dd>
            </div>
            {codFee > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">
                  Taxă de ramburs
                  <span className="block text-xs text-ink-soft/70">Plată la livrare</span>
                </dt>
                <dd className="font-medium text-ink">{formatPrice(codFee)}</dd>
              </div>
            )}
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
