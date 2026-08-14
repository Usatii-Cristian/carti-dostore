import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
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
  // `updateTag` merge DOAR în Server Actions (vezi docs Next 16); într-un route
  // handler se folosește `revalidateTag`.
  revalidateTag(CACHE_TAGS.books);
  revalidateTag(CACHE_TAGS.categories);
  revalidateTag(CACHE_TAGS.blog);
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
