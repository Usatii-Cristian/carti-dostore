import { NextResponse } from "next/server";
import { reconcilePendingPayments } from "@/lib/payments/reconcile";

/**
 * Aceeași reconciliere, rulată de cron-ul Vercel (vezi `vercel.json`), ca să
 * meargă și când nimeni nu deschide adminul.
 *
 * Vercel semnează cererile de cron cu `Authorization: Bearer $CRON_SECRET` când
 * variabila e setată. Dacă nu e setată, acceptăm doar cererile marcate de
 * platformă (`x-vercel-cron`), ca ruta să nu fie un buton public.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorized = secret
    ? request.headers.get("authorization") === `Bearer ${secret}`
    : request.headers.has("x-vercel-cron");

  if (!authorized) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const summary = await reconcilePendingPayments();
  return NextResponse.json(summary);
}
