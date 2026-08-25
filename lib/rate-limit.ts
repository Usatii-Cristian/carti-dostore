import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Limitare de rată cu fereastră fixă, ținută în MongoDB (modelul `RateLimit`).
 *
 * De ce în DB și nu într-un `Map` în memorie: în producție rulăm pe funcții
 * serverless — fiecare instanță are propria memorie și se reciclează des, deci
 * un contor local ar fi ocolit banal (și s-ar reseta singur). Un document per
 * cheie e suficient aici: volumul e mic (formularul public de recenzii).
 */

/** Ce răspunde limitatorul. `retryAfterSeconds` = cât mai are de așteptat. */
export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

/**
 * Amprenta clientului: IP-ul, hash-uit cu SHA-256 și un salt din env, ca să nu
 * stocăm IP-uri brute. Pe Vercel IP-ul real vine în `x-forwarded-for` (prima
 * valoare din listă); restul sunt proxy-uri.
 */
export async function getClientFingerprint(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip")?.trim() || "unknown";

  return createHash("sha256")
    .update(`${ip}|${process.env.NEXTAUTH_SECRET ?? "bookstore"}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Consumă o unitate din bugetul cheii date. Returnează `ok: false` dacă bugetul
 * ferestrei curente s-a epuizat.
 *
 * Ordinea operațiilor e gândită să fie sigură la cereri concurente: întâi
 * încercăm un `updateMany` condiționat (incrementează atomic doar dacă fereastra
 * e activă ȘI limita nu e atinsă); abia dacă acela nu a modificat nimic decidem
 * dacă e vorba de limită atinsă sau de fereastră nouă/expirată.
 */
export async function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  const now = new Date();

  const bumped = await prisma.rateLimit.updateMany({
    where: { key, expiresAt: { gt: now }, count: { lt: limit } },
    data: { count: { increment: 1 } },
  });
  if (bumped.count > 0) return { ok: true, retryAfterSeconds: 0 };

  const existing = await prisma.rateLimit.findUnique({ where: { key } });
  if (existing && existing.expiresAt > now) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000)
      ),
    };
  }

  // Fereastră nouă (sau expirată): o pornim de la 1.
  const expiresAt = new Date(now.getTime() + windowMs);
  await prisma.rateLimit.upsert({
    where: { key },
    create: { key, count: 1, expiresAt },
    update: { count: 1, expiresAt },
  });

  return { ok: true, retryAfterSeconds: 0 };
}

/**
 * Amprentă dintr-un `Request` brut, pentru locurile care nu au context de
 * Server Component (ex. `authorize()` din NextAuth). Aceeași formulă ca
 * `getClientFingerprint`, ca cheile să fie interschimbabile.
 */
export function fingerprintFromRequest(request: Request | undefined): string {
  const forwarded = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request?.headers.get("x-real-ip")?.trim() || "unknown";
  return hashKey(ip);
}

/** Hash cu salt din env — nu ținem IP-uri sau adrese de email brute în contor. */
export function hashKey(value: string): string {
  return createHash("sha256")
    .update(`${value}|${process.env.NEXTAUTH_SECRET ?? "bookstore"}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Șterge contorul unei chei. Folosit după o autentificare reușită: încercările
 * eșuate ale unui admin care doar a greșit parola nu trebuie să-l blocheze după
 * ce a intrat cu succes.
 */
export async function resetRateLimit(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } });
}

/** „acum 3 ore" / „acum 20 de minute" — pentru mesajele de eroare. */
export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return "câteva secunde";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60)
    return minutes === 1 ? "un minut" : `${minutes} ${minutes < 20 ? "minute" : "de minute"}`;
  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? "o oră" : `${hours} ${hours < 20 ? "ore" : "de ore"}`;
}
