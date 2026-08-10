import "server-only";
import { waitUntil } from "@vercel/functions";

/**
 * Trimite o sarcină „după răspuns": clientul primește pagina imediat, iar munca
 * (emailuri, Telegram, estimări de cost) continuă în fundal.
 *
 * Pe Vercel, `waitUntil` ține funcția vie până se termină promisiunea — fără el,
 * orice cod pornit și neașteptat ar fi tăiat odată cu răspunsul. În afara
 * platformei (dev local, `next start`) e un no-op: promisiunea rulează oricum,
 * doar că nu o mai așteptăm.
 *
 * Aici intră DOAR ce nu contează pentru corectitudinea comenzii — dacă un email
 * nu pleacă, comanda rămâne validă. Ce trebuie garantat (salvarea comenzii,
 * inițierea plății) se așteaptă normal, înainte de răspuns.
 */
export function runAfterResponse(work: Promise<unknown>): void {
  // Fără `catch`, o eroare în fundal ar deveni unhandled rejection și ar putea
  // dărâma procesul în dezvoltare.
  waitUntil(work.catch((error) => console.error("[after-response] eșec:", error)));
}
