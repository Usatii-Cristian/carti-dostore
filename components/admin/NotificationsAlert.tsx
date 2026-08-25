import { BellOff } from "lucide-react";
import { getUndeliveredNotifications } from "@/lib/notifications/outbox";

/**
 * Avertisment în panoul de admin când o notificare de comandă n-a plecat.
 *
 * Rostul lui: problema care a dus la construirea cozii n-a fost că notificarea
 * a eșuat, ci că a eșuat ÎN TĂCERE — Telegram răspundea cu eroare de zile
 * întregi și nimeni n-avea de unde ști. Acum, dacă ceva nu ajunge, se vede aici,
 * cu tot cu motivul întors de Telegram sau de serverul de email.
 */
export async function NotificationsAlert() {
  const { pending, failed, lastError } = await getUndeliveredNotifications();
  if (pending === 0 && failed === 0) return null;

  const parts = [
    pending > 0 ? `${pending} în curs de reîncercare` : null,
    failed > 0 ? `${failed} abandonate după toate încercările` : null,
  ].filter(Boolean);

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
        <BellOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        Notificări de comandă netrimise: {parts.join(" · ")}
      </p>
      {lastError ? (
        <p className="mt-2 break-words font-mono text-xs text-amber-800">Ultima eroare: {lastError}</p>
      ) : null}
      <p className="mt-2 text-xs leading-relaxed text-amber-800">
        Comenzile sunt salvate și se văd în listă — doar anunțul pe Telegram/email n-a plecat.
        Reîncercarea se face automat (la fiecare comandă nouă, la deschiderea panoului și din
        verificarea zilnică). Dacă eroarea persistă, verifică dacă botul mai e în grup și dacă
        TELEGRAM_CHAT_ID din Vercel e id-ul actual al grupului.
      </p>
    </div>
  );
}
