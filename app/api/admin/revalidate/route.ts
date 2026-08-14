import { NextResponse } from "next/server";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

/**
 * Golește cache-ul catalogului, la cerere.
 *
 * Mutațiile din admin invalidează singure tag-urile, dar modificările scrise
 * direct în baza de date (scripturi de întreținere, importuri) nu au cum. Ruta
 * asta le acoperă, fără să aștepți expirarea. E sub /api/admin/*, deci cere
 * sesiune de admin (vezi proxy.ts).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  updateTag(CACHE_TAGS.books);
  updateTag(CACHE_TAGS.categories);
  updateTag(CACHE_TAGS.blog);
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
