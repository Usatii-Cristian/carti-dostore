import "server-only";

/**
 * Notificările către grupul de Telegram.
 *
 * Fișierul ăsta doar COMPUNE mesajele. Trimiterea propriu-zisă trece prin
 * outbox (`lib/notifications/outbox.ts`): mesajul se scrie întâi în baza de
 * date, apoi se încearcă trimiterea, iar dacă eșuează se reîncearcă singur.
 *
 * De ce s-a schimbat: înainte se trimitea direct și eșecul se loga în consolă.
 * Când grupul a devenit supergrup, Telegram a început să răspundă cu 400
 * (id-ul grupului se schimbă la conversie) — mesajele nu mai ajungeau, dar
 * nimic nu semnala asta. Comenzi reale au intrat fără ca magazinul să afle.
 * Acum o notificare netrimisă rămâne vizibilă în panoul de admin și se reia
 * automat până pleacă.
 */

import { formatShippingAddress } from "@/lib/orders/address";
import { notify } from "@/lib/notifications/outbox";

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function send(dedupeKey: string, text: string): Promise<void> {
  return notify({ channel: "telegram", dedupeKey: `telegram:${dedupeKey}`, payload: text });
}

export async function tgNewOrder(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  building?: string | null;
  apartment?: string | null;
  customerNote?: string | null;
  city: string;
  total: number;
  paymentMethod?: "ONLINE" | "CARD_ON_DELIVERY" | "CASH_ON_DELIVERY";
  items: { title: string; quantity: number }[];
}): Promise<void> {
  await send(`new-order:${order.orderNumber}`, buildNewOrderMessage(order));
}

/** Textul comenzii noi, separat ca să-l putem pune la coadă și din checkout. */
export function buildNewOrderMessage(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  building?: string | null;
  apartment?: string | null;
  customerNote?: string | null;
  city: string;
  total: number;
  paymentMethod?: "ONLINE" | "CARD_ON_DELIVERY" | "CASH_ON_DELIVERY";
  items: { title: string; quantity: number }[];
}): string {
  const lines = order.items.map((i) => `• ${esc(i.title)} × ${i.quantity}`).join("\n");
  // Metoda de plată contează la prima privire: comenzile online se expediază
  // abia după confirmarea banilor, cele la livrare pleacă imediat.
  const payment =
    order.paymentMethod === "ONLINE"
      ? "MIA Plăți Instant (se expediază după confirmarea plății)"
      : order.paymentMethod === "CARD_ON_DELIVERY"
        ? "Card la livrare"
        : order.paymentMethod === "CASH_ON_DELIVERY"
          ? "Numerar la livrare"
          : null;

  return (
    `🆕 <b>Comandă nouă</b> ${esc(order.orderNumber)}\n` +
    `👤 ${esc(order.customerName)}\n` +
    `📞 ${esc(order.customerPhone)}\n` +
    `📧 ${esc(order.customerEmail)}\n` +
    `📍 ${esc(formatShippingAddress(order))}, ${esc(order.city)}\n` +
    (order.customerNote ? `📝 ${esc(order.customerNote)}\n` : "") +
    (payment ? `💳 ${esc(payment)}\n` : "") +
    `💰 <b>${order.total} lei</b>\n\n${lines}`
  );
}

export async function tgPaymentConfirmed(order: {
  orderNumber: string;
  total: number;
}): Promise<void> {
  await send(
    `paid:${order.orderNumber}`,
    `💳 <b>Plată confirmată</b> — comanda ${esc(order.orderNumber)} (${order.total} lei)`
  );
}

/**
 * Comanda online la care clientul n-a dus plata la capăt (QR expirat sau
 * anulat). Magazinul trebuie să afle: până acum astfel de comenzi apăreau ca
 * orice comandă nouă, dar nu ajungeau niciodată la curier — și nimeni nu știa
 * de ce. Cu mesajul ăsta se poate suna clientul și oferi plata la livrare.
 */
export async function tgPaymentExpired(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
}): Promise<void> {
  await send(
    `expired:${order.orderNumber}`,
    `⚠️ <b>Plată neefectuată</b> — comanda ${esc(order.orderNumber)} (${order.total} lei)\n` +
      `👤 ${esc(order.customerName)} · 📞 ${esc(order.customerPhone)}\n` +
      `Clientul a ales plata online, dar n-a achitat, iar codul QR a expirat. ` +
      `Comanda a fost marcată anulată și NU a plecat la curier — sună clientul dacă vrei să o salvezi.`
  );
}

export async function tgStatusChange(order: {
  orderNumber: string;
  statusLabel: string;
}): Promise<void> {
  // Aceeași comandă poate trece de mai multe ori prin același status (revenire
  // pe „În procesare"), deci cheia include și momentul.
  await send(
    `status:${order.orderNumber}:${order.statusLabel}:${Date.now()}`,
    `🔄 Comanda <b>${esc(order.orderNumber)}</b> → ${esc(order.statusLabel)}`
  );
}
