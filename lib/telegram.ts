import "server-only";

// Notificări către grupul de Telegram prin Bot API. Provider-agnostic, no-op
// dacă nu e configurat, și nu aruncă niciodată (o notificare eșuată nu strică
// comanda/plata) — exact ca la email.

import { formatShippingAddress } from "@/lib/orders/address";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function send(text: string): Promise<void> {
  if (!token || !chatId) {
    console.info("[telegram] SKIP (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID neconfigurate)");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[telegram] eroare:", res.status, body.slice(0, 200));
    }
  } catch (error) {
    console.error("[telegram] trimiterea a eșuat:", error);
  }
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

  await send(
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
  await send(`💳 <b>Plată confirmată</b> — comanda ${esc(order.orderNumber)} (${order.total} lei)`);
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
  await send(`🔄 Comanda <b>${esc(order.orderNumber)}</b> → ${esc(order.statusLabel)}`);
}
