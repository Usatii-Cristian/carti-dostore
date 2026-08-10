import { NextResponse } from "next/server";
import { reconcilePendingPayments } from "@/lib/payments/reconcile";

// Reconcilierea plăților online, declanșată din panoul de admin (lista de
// comenzi o cheamă la deschidere). Ruta e sub /api/admin/*, deci proxy.ts cere
// sesiune — un vizitator anonim primește 401 JSON, nu pagina de login.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await reconcilePendingPayments();
  return NextResponse.json(summary);
}
