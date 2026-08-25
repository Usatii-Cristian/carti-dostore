import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Trimiterea brută către Bot API. Stă separat de `lib/telegram.ts` ca outbox-ul
 * (`lib/notifications/outbox.ts`) să o poată folosi la reîncercări fără import
 * circular.
 *
 * Spre deosebire de varianta veche, funcția de aici NU înghite eșecurile: le
 * întoarce apelantului. Înghițitul a fost cauza pentru care notificările au
 * încetat să vină săptămâni la rând fără ca cineva să observe.
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
const envChatId = process.env.TELEGRAM_CHAT_ID;

/** Cheia sub care ținem id-ul de grup descoperit la runtime (vezi mai jos). */
const CHAT_ID_SETTING = "telegram_chat_id";

export type SendResult = { ok: true } | { ok: false; error: string; retryable: boolean };

export function isTelegramConfigured(): boolean {
  return Boolean(token && envChatId);
}

/**
 * Id-ul grupului: cel salvat în baza de date (dacă grupul a migrat) sau cel din
 * variabila de mediu. Cache-uit pe durata instanței, ca să nu lovim baza la
 * fiecare mesaj, dar citit din baza de date la primul mesaj al fiecărei
 * instanțe — de-asta migrarea se „ține minte" și după redeploy.
 */
let cachedChatId: string | null = null;

async function resolveChatId(): Promise<string> {
  if (cachedChatId) return cachedChatId;
  try {
    const saved = await prisma.setting.findUnique({ where: { key: CHAT_ID_SETTING } });
    if (saved?.value) {
      cachedChatId = saved.value;
      return cachedChatId;
    }
  } catch {
    // Baza de date indisponibilă nu trebuie să blocheze notificarea: mergem pe env.
  }
  cachedChatId = envChatId as string;
  return cachedChatId;
}

async function rememberChatId(next: string): Promise<void> {
  cachedChatId = next;
  try {
    await prisma.setting.upsert({
      where: { key: CHAT_ID_SETTING },
      update: { value: next },
      create: { key: CHAT_ID_SETTING, value: next },
    });
  } catch (error) {
    console.error("[telegram] nu am putut salva id-ul nou de grup:", error);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postMessage(chatId: string, text: string): Promise<Response> {
  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    // Fără timeout, o cerere blocată ar ține funcția până la tăiere.
    signal: AbortSignal.timeout(10_000),
  });
}

/**
 * Trimite mesajul, cu tratarea celor trei eșecuri reale ale Bot API:
 *
 * - **grup migrat în supergrup** (400 + `migrate_to_chat_id`): id-ul se schimbă.
 *   Îl salvăm în baza de date și retrimitem pe loc. Ăsta e exact bug-ul care a
 *   oprit notificările.
 * - **limitare de rată** (429 + `retry_after`): așteptăm cât cere și reîncercăm.
 * - **rețea căzută**: reîncercăm de câteva ori, cu pauze crescătoare.
 */
export async function sendTelegramMessage(text: string): Promise<SendResult> {
  if (!token || !envChatId) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID neconfigurate", retryable: false };
  }

  let lastError = "necunoscut";

  for (let attempt = 0; attempt < 3; attempt++) {
    let res: Response;
    try {
      res = await postMessage(await resolveChatId(), text);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await sleep(500 * (attempt + 1));
      continue;
    }

    if (res.ok) return { ok: true };

    const body = await res.text().catch(() => "");
    const parsed = (() => {
      try {
        return JSON.parse(body) as {
          description?: string;
          parameters?: { migrate_to_chat_id?: number; retry_after?: number };
        };
      } catch {
        return null;
      }
    })();

    lastError = `${res.status} ${parsed?.description ?? body.slice(0, 200)}`;

    const migrated = parsed?.parameters?.migrate_to_chat_id;
    if (migrated) {
      console.warn(
        `[telegram] grupul a devenit supergrup; id nou ${migrated}. ` +
          "Salvat in baza de date; actualizeaza si TELEGRAM_CHAT_ID in Vercel."
      );
      await rememberChatId(String(migrated));
      continue; // reîncercare imediată pe id-ul nou
    }

    const retryAfter = parsed?.parameters?.retry_after;
    if (retryAfter) {
      await sleep(Math.min(retryAfter, 20) * 1000);
      continue;
    }

    // 4xx fără indicii (bot scos din grup, permisiuni lipsă) nu se rezolvă
    // reîncercând imediat — dar rămâne `retryable`, ca outbox-ul să reia mai
    // târziu: între timp botul poate fi readăugat în grup. Mai bine o
    // notificare întârziată decât una pierdută.
    if (res.status >= 400 && res.status < 500) {
      return { ok: false, error: lastError, retryable: true };
    }

    await sleep(500 * (attempt + 1));
  }

  return { ok: false, error: lastError, retryable: true };
}
