import "server-only";
import type { ReactElement } from "react";
import { render } from "@react-email/render";
import nodemailer, { type Transporter } from "nodemailer";

// Strat abstract de trimitere email. Restul aplicației cheamă doar `sendEmail(...)`
// și nu știe ce provider e dedesubt — dacă vrei să treci pe alt serviciu,
// schimbi DOAR acest fișier.
//
// Provider curent: SMTP prin nodemailer. Merge cu orice furnizor (Gmail, Zoho,
// Mailgun, Brevo, SMTP-ul găzduirii tale etc.) — nu depinde de un API proprietar.
//
// Fără credențiale SMTP complete, intrăm în mod no-op: logăm și returnăm
// `skipped`, ca fluxul de checkout / callback / newsletter să NU se blocheze
// când emailul nu e încă configurat (exact ca la maib/DB).

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const port = Number(process.env.SMTP_PORT ?? 587);

// Portul 465 înseamnă TLS implicit („secure"); 587/25 pornesc în clar și
// urcă la TLS prin STARTTLS. `SMTP_SECURE` permite forțarea manuală.
const secure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : port === 465;

const from = process.env.EMAIL_FROM ?? (user ? `Dostore Carti <${user}>` : undefined);

const isConfigured = Boolean(host && user && pass && from);

// Transporter-ul se creează o singură dată (pool de conexiuni SMTP refolosite),
// leneș — ca importul modulului să nu deschidă socket-uri la build.
let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      pool: true,
      maxConnections: 3,
      // Newsletter-ul trimite individual către fiecare abonat; limităm ritmul
      // ca furnizorul SMTP să nu ne trateze drept spam / să nu ne rate-limiteze.
      maxMessages: 50,
      rateDelta: 1000,
      rateLimit: 5,
    });
  }
  return cachedTransporter;
}

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
  if (!isConfigured) {
    console.info(
      `[email] SKIP (SMTP neconfigurat) → to=${describeRecipients(to)} · subiect="${subject}"`
    );
    return { ok: true, skipped: true };
  }

  try {
    // Template-urile rămân React Email; le randăm noi în HTML + variantă text
    // (nodemailer primește string-uri, nu JSX). Varianta text ajută livrabilitatea.
    const [html, text] = await Promise.all([
      render(react),
      render(react, { plainText: true }),
    ]);

    const info = await getTransporter().sendMail({
      from,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text,
      replyTo,
    });

    return { ok: true, id: info.messageId };
  } catch (error) {
    // Nu propagăm niciodată eroarea în sus — un email eșuat nu trebuie să
    // strice comanda sau plata. Doar o logăm.
    console.error("[email] trimiterea a eșuat:", error);
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
