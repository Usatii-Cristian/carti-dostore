import "server-only";

// Notificări către grupul de Telegram prin Bot API. Provider-agnostic, no-op
// dacă nu e configurat, și nu aruncă niciodată (o notificare eșuată nu strică
// comanda/plata) — exact ca la email.

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
  city: string;
  total: number;
  items: { title: string; quantity: number }[];
}): Promise<void> {
  const lines = order.items.map((i) => `• ${esc(i.title)} × ${i.quantity}`).join("\n");
  await send(
    `🆕 <b>Comandă nouă</b> ${esc(order.orderNumber)}\n` +
      `👤 ${esc(order.customerName)}\n` +
      `📞 ${esc(order.customerPhone)}\n` +
      `📧 ${esc(order.customerEmail)}\n` +
      `📍 ${esc(order.shippingAddress)}, ${esc(order.city)}\n` +
      `💰 <b>${order.total} lei</b>\n\n${lines}`
  );
}

export async function tgPaymentConfirmed(order: {
  orderNumber: string;
  total: number;
}): Promise<void> {
  await send(`💳 <b>Plată confirmată</b> — comanda ${esc(order.orderNumber)} (${order.total} lei)`);
}

export async function tgStatusChange(order: {
  orderNumber: string;
  statusLabel: string;
}): Promise<void> {
  await send(`🔄 Comanda <b>${esc(order.orderNumber)}</b> → ${esc(order.statusLabel)}`);
}
