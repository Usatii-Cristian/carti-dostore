import "server-only";
import type { ReactElement } from "react";
import { Resend } from "resend";

// Strat abstract de trimitere email. Restul aplicației cheamă doar `sendEmail(...)`
// și nu știe ce provider e dedesubt — dacă vrei să treci de pe Resend pe SMTP
// (nodemailer) sau alt serviciu, schimbi DOAR acest fișier.
//
// Fără un RESEND_API_KEY real (care începe cu „re_"), intrăm în mod no-op:
// logăm și returnăm `skipped`, ca fluxul de checkout / callback / newsletter
// să NU se blocheze când emailul nu e încă configurat (exact ca la maib/DB).

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Dostore Carti <onboarding@resend.dev>";

const isConfigured = typeof apiKey === "string" && apiKey.startsWith("re_");
const resend = isConfigured ? new Resend(apiKey) : null;

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export type SendEmailResult = {
  ok: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
};

function describeRecipients(to: string | string[]): string {
  return Array.isArray(to) ? to.join(", ") : to;
}

export async function sendEmail({
  to,
  subject,
  react,
  replyTo,
}: SendEmailInput): Promise<SendEmailResult> {
  if (!resend) {
    console.info(
      `[email] SKIP (RESEND_API_KEY neconfigurat) → to=${describeRecipients(to)} · subiect="${subject}"`
    );
    return { ok: true, skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      replyTo,
    });

    if (error) {
      console.error("[email] Resend a returnat eroare:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (error) {
    // Nu propagăm niciodată eroarea în sus — un email eșuat nu trebuie să
    // strice comanda sau plata. Doar o logăm.
    console.error("[email] trimiterea a eșuat:", error);
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
