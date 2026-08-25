import { NextResponse } from "next/server";
import { reconcilePendingPayments } from "@/lib/payments/reconcile";
import { flushNotifications } from "@/lib/notifications/outbox";

// Reconcilierea plăților online, declanșată din panoul de admin (lista de
// comenzi o cheamă la deschidere). Ruta e sub /api/admin/*, deci proxy.ts cere
// sesiune — un vizitator anonim primește 401 JSON, nu pagina de login.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Odată cu plățile, golim și coada de notificări: dacă Telegram sau SMTP-ul
  // au fost picate când a intrat comanda, mesajul pleacă acum, în clipa în care
  // magazinul deschide panoul.
  const [summary, notifications] = await Promise.all([
    reconcilePendingPayments(),
    flushNotifications(50),
  ]);
  return NextResponse.json({ ...summary, notifications });
}
