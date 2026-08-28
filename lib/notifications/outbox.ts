import "server-only";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, isTelegramConfigured } from "@/lib/telegram-transport";
import { sendAdminOrderEmail } from "@/lib/email/admin-order";
import type { OrderEmailData } from "@/lib/email/types";

/**
 * Coada de notificări care TREBUIE să ajungă (Telegram + emailul de comandă
 * nouă către magazin).
 *
 * Regula: mai întâi scriem notificarea în baza de date (sincron, în cererea
 * care creează comanda), abia apoi încercăm s-o trimitem. Dacă trimiterea
 * eșuează — sau funcția e tăiată înainte s-o termine — rândul rămâne PENDING și
 * se reîncearcă singur, din patru locuri diferite (vezi `flushNotifications`).
 *
 * Înainte, notificările plecau „și gata": eșecul se loga în consolă și
 * dispărea. Așa au trecut neobservate zile întregi în care Telegram răspundea
 * cu eroare, iar magazinul n-a aflat de comenzi.
 */

export type NotificationChannel = "telegram" | "admin-email";

/** Câte încercări facem înainte să declarăm notificarea pierdută. */
const MAX_ATTEMPTS = 10;

/** Pauza dinaintea fiecărei reîncercări, în minute (ultima se repetă). */
const BACKOFF_MINUTES = [1, 3, 10, 30, 60, 180, 360, 720];

function nextTry(attempts: number): Date {
  const minutes = BACKOFF_MINUTES[Math.min(attempts, BACKOFF_MINUTES.length - 1)];
  return new Date(Date.now() + minutes * 60_000);
}

type Enqueued = { id: string; channel: string; payload: string } | null;

/**
 * Pune notificarea la coadă. Idempotent prin `dedupeKey`: dacă rândul există
 * deja (retrimitere, dublu submit), nu creăm altul și nu returnăm nimic de
 * trimis.
 */
export async function enqueueNotification(input: {
  channel: NotificationChannel;
  dedupeKey: string;
  payload: string;
}): Promise<Enqueued> {
  try {
    return await prisma.notification.create({
      data: { channel: input.channel, dedupeKey: input.dedupeKey, payload: input.payload },
      select: { id: true, channel: true, payload: true },
    });
  } catch {
    // Cheie duplicată = notificarea e deja la coadă sau trimisă. Nu e o eroare.
    return null;
  }
}

async function deliver(channel: string, payload: string): Promise<{ ok: boolean; error?: string }> {
  if (channel === "telegram") {
    if (!isTelegramConfigured()) return { ok: true }; // no-op configurat, ca la email
    const result = await sendTelegramMessage(payload);
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (channel === "admin-email") {
    const { order, orderId } = JSON.parse(payload) as { order: OrderEmailData; orderId: string };
    return sendAdminOrderEmail(order, orderId);
  }

  return { ok: false, error: `canal necunoscut: ${channel}` };
}

async function markSent(id: string): Promise<void> {
  await prisma.notification.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date(), lastError: null },
  });
}

async function markFailed(id: string, attempts: number, error: string): Promise<void> {
  const exhausted = attempts >= MAX_ATTEMPTS;
  await prisma.notification.update({
    where: { id },
    data: {
      status: exhausted ? "FAILED" : "PENDING",
      // Scriem explicit numărul de încercări: pe drumul „trimite acum" nu trece
      // prin claim-ul din flush, care e cel care îl incrementează.
      attempts,
      lastError: error.slice(0, 500),
      nextTryAt: nextTry(attempts),
    },
  });
  if (exhausted) {
    console.error(`[outbox] notificare abandonată după ${attempts} încercări: ${error}`);
  }
}

/**
 * Trimite un rând deja pus la coadă. Folosită pe drumul comenzii: clientul nu
 * așteaptă (apelul stă în `runAfterResponse`), dar rândul din baza de date a
 * fost deja scris sincron, înainte, de `enqueueNotification`.
 */
export async function deliverNotification(record: Enqueued): Promise<void> {
  if (!record) return;
  try {
    // Claim atomic: dacă flushNotifications îl ia simultan, `count` e 0.
    // `nextTryAt` împins în viitor ține loc de LEASE: cât timp e valabil,
    // nimeni altcineva nu atinge rândul. Fără el, un rând rămas „SENDING"
    // (funcție tăiată la jumătatea trimiterii) n-ar mai fi reluat NICIODATĂ —
    // exact tăcerea pe care coada trebuia s-o elimine.
    const claimed = await prisma.notification.updateMany({
      where: { id: record.id, status: "PENDING" },
      data: { status: "SENDING", attempts: 1, nextTryAt: nextTry(1) },
    });
    if (claimed.count === 0) return; // a fost deja preluat de flush

    const result = await deliver(record.channel, record.payload);
    if (result.ok) {
      await markSent(record.id);
    } else {
      await markFailed(record.id, 1, result.error ?? "eroare necunoscută");
    }
  } catch (error) {
    await markFailed(record.id, 1, error instanceof Error ? error.message : String(error)).catch(
      () => undefined
    );
  }
}

/** Pune la coadă și încearcă imediat — varianta scurtă, pentru notificări simple. */
export async function notify(input: {
  channel: NotificationChannel;
  dedupeKey: string;
  payload: string;
}): Promise<void> {
  await deliverNotification(await enqueueNotification(input));
}

export type FlushSummary = { picked: number; sent: number; failed: number };

/**
 * Reia notificările rămase netrimise. Se cheamă din patru locuri, ca să nu
 * depindem de unul singur:
 *
 * 1. la fiecare comandă nouă (deci o comandă „repară" notificarea celei
 *    anterioare),
 * 2. la deschiderea panoului de admin,
 * 3. din cron-ul zilnic (`/api/cron/reconcile-payments`),
 * 4. manual, din butonul de pe dashboard.
 *
 * Concurența e tratată printr-un `updateMany` condiționat, care ține loc de
 * lock: doar instanța care reușește să treacă rândul din PENDING în SENDING îl
 * trimite. Restul îl sar.
 */
export async function flushNotifications(limit = 20): Promise<FlushSummary> {
  const summary: FlushSummary = { picked: 0, sent: 0, failed: 0 };

  let due: { id: string; channel: string; payload: string; attempts: number }[];
  try {
    due = await prisma.notification.findMany({
      // Și rândurile rămase „SENDING" cu lease-ul expirat: acelea aparțin unei
      // funcții care a murit între claim și rezultat. Lease-ul (nextTryAt, pus
      // în viitor la claim) e ce le deosebește de o trimitere în curs.
      where: { status: { in: ["PENDING", "SENDING"] }, nextTryAt: { lte: new Date() } },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: { id: true, channel: true, payload: true, attempts: true },
    });
  } catch (error) {
    console.error("[outbox] nu am putut citi coada:", error);
    return summary;
  }

  for (const item of due) {
    // Claim atomic: dacă altcineva a luat rândul între timp, `count` e 0.
    // Condiția repetă `nextTryAt` ca să nu putem fura un rând al cărui lease e
    // încă valabil (o trimitere chiar în curs, în altă instanță).
    const claimed = await prisma.notification.updateMany({
      where: {
        id: item.id,
        status: { in: ["PENDING", "SENDING"] },
        nextTryAt: { lte: new Date() },
      },
      data: {
        status: "SENDING",
        attempts: { increment: 1 },
        nextTryAt: nextTry(item.attempts + 1),
      },
    });
    if (claimed.count === 0) continue;

    summary.picked++;
    try {
      const result = await deliver(item.channel, item.payload);
      if (result.ok) {
        await markSent(item.id);
        summary.sent++;
      } else {
        await markFailed(item.id, item.attempts + 1, result.error ?? "eroare necunoscută");
        summary.failed++;
      }
    } catch (error) {
      await markFailed(
        item.id,
        item.attempts + 1,
        error instanceof Error ? error.message : String(error)
      );
      summary.failed++;
    }
  }

  return summary;
}

/** Notificări nelivrate — pentru avertismentul din panoul de admin. */
export type UndeliveredSummary = {
  pending: number;
  failed: number;
  lastError: string | null;
};

export async function getUndeliveredNotifications(): Promise<UndeliveredSummary> {
  try {
    const [pending, failed, latest] = await Promise.all([
      // Doar cele care au eșuat măcar o dată: un rând proaspăt pus la coadă și
      // încă netrimis nu e o problemă, e cursul normal.
      prisma.notification.count({
        where: { status: { in: ["PENDING", "SENDING"] }, lastError: { not: null } },
      }),
      prisma.notification.count({ where: { status: "FAILED" } }),
      prisma.notification.findFirst({
        where: { status: { in: ["PENDING", "SENDING", "FAILED"] }, lastError: { not: null } },
        orderBy: { updatedAt: "desc" },
        select: { lastError: true },
      }),
    ]);
    return { pending, failed, lastError: latest?.lastError ?? null };
  } catch {
    return { pending: 0, failed: 0, lastError: null };
  }
}
