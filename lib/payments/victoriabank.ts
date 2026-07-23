import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
// VictoriaBank — MIA (Moldova Instant Payments), IPS Business WebApi v2.1.0.
// Docs oficiale primite de la utilizator. Flux: la checkout generăm un QR
// dinamic cu suma fixă a comenzii; clientul scanează / deschide linkul și
// plătește în aplicația lui de banking; noi confirmăm plata întrebând API-ul
// băncii (status autentificat) — nu ne bazăm pe input neautentificat.
//
// Autentificare: POST /identity/token (grant_type=password) → accessToken (JWT).
// Creare QR:     POST /api/v1/qr        → qrHeaderUUID, qrExtensionUUID, qrAsImage
// Status:        GET  /api/v1/qr/{qrHeaderUUID}/status
//
// Mod no-op fără credențiale (ca la FAN/email): comanda merge pe ramburs.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.VB_MIA_BASE_URL ?? "https://test-ipspj.victoriabank.md";
const USERNAME = process.env.VB_MIA_USERNAME;
const PASSWORD = process.env.VB_MIA_PASSWORD;
const IBAN = process.env.VB_MIA_IBAN; // contul unde se încasează
const DBA = (process.env.VB_MIA_DBA ?? "Dostore Carti").slice(0, 25); // nume afișat în app

export const isVictoriaBankConfigured = Boolean(USERNAME && PASSWORD && IBAN);

// ── Token OAuth (JWT), cachat și refolosit până aproape de expirare ──────────
let tokenCache: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt - 30_000 > now) return tokenCache.accessToken;

  const res = await fetch(`${BASE_URL}/identity/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      username: USERNAME!,
      password: PASSWORD!,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`VictoriaBank: autentificarea a eșuat (${res.status})`);
  }

  const data = (await res.json()) as { accessToken?: string; expiresIn?: number };
  if (!data.accessToken) throw new Error("VictoriaBank: răspuns fără accessToken.");

  tokenCache = {
    accessToken: data.accessToken,
    expiresAt: now + (data.expiresIn ?? 3600) * 1000,
  };
  return tokenCache.accessToken;
}

// ── Creare QR de plată ────────────────────────────────────────────────────────

export type CreateQrInput = {
  orderNumber: string;
  amount: number; // MDL
};

export type QrSession = {
  qrHeaderUUID: string;
  qrExtensionUUID: string;
  /** Linkul de plată (deschis în app-ul de banking). */
  payUrl: string;
  /** Codul QR ca PNG base64 (fără prefix data:). */
  qrImageBase64: string;
  skipped?: boolean;
};

/** Referință externă acceptată de bancă: alfanumeric, fără spații, ≤35 car. */
function sanitizeRef(orderNumber: string): string {
  return orderNumber.replace(/[^a-zA-Z0-9]/g, "").slice(0, 35);
}

export async function createQrPayment(input: CreateQrInput): Promise<QrSession> {
  if (!isVictoriaBankConfigured) {
    console.info(
      `[victoriabank] SKIP (necredentiat) → comanda ${input.orderNumber} merge pe ramburs`
    );
    return { qrHeaderUUID: "", qrExtensionUUID: "", payUrl: "", qrImageBase64: "", skipped: true };
  }

  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/api/v1/qr?width=320&height=320`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      // QR dinamic cu sumă fixă = cel mai potrivit pentru checkout e-commerce.
      header: { qrType: "DYNM", amountType: "Fixed", pmtContext: "e" },
      extension: {
        creditorAccount: { iban: IBAN },
        amount: { sum: input.amount.toFixed(2), currency: "MDL" },
        dba: DBA,
        remittanceInfo4Payer: `Comanda ${input.orderNumber}`.slice(0, 35),
        creditorRef: sanitizeRef(input.orderNumber),
        // Timp de viață al QR-ului: 30 de minute ca să apuce clientul să plătească.
        ttl: { length: 30, units: "mm" },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`VictoriaBank: crearea QR a eșuat (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    qrHeaderUUID?: string;
    qrExtensionUUID?: string;
    qrAsText?: string;
    qrAsImage?: string;
  };

  if (!data.qrHeaderUUID || !data.qrAsText) {
    throw new Error("VictoriaBank: răspuns QR incomplet.");
  }

  return {
    qrHeaderUUID: data.qrHeaderUUID,
    qrExtensionUUID: data.qrExtensionUUID ?? "",
    payUrl: data.qrAsText,
    qrImageBase64: data.qrAsImage ?? "",
  };
}

// ── Status QR (sursa autoritară de confirmare a plății) ──────────────────────

export type QrStatus = "Active" | "Paid" | "Expired" | "Cancelled" | "Replaced" | "Inactive";

/** Statusuri finale — se poate opri polling-ul. */
export const FINAL_QR_STATUSES: QrStatus[] = ["Paid", "Expired", "Cancelled", "Inactive"];

export type QrStatusResult = {
  status: QrStatus;
  /** Referința plății (segmentul 4 = id tranzacție, pentru eventuale returnări). */
  paymentReference?: string;
};

// ── Returnarea banilor ───────────────────────────────────────────────────────
//
// ⚠️ Regulă critică a băncii: o tranzacție poate fi returnată O SINGURĂ DATĂ.
// După o returnare parțială, restul NU mai poate fi returnat prin API (dă 404).
// Deci suma se decide dintr-un singur apel.
//
// `id` = al 4-lea segment al referinței de plată (o salvăm în order.paymentId).

/** Extrage id-ul de tranzacție din referința de plată (segmentul 4). */
export function transactionIdFromReference(reference: string): string | null {
  const parts = reference.split("|");
  return parts.length >= 4 ? parts[3] : null;
}

export type RefundResult = { ok: boolean; message: string };

/**
 * Returnează banii: integral (fără sumă) sau parțial (cu sumă).
 * Nu aruncă — întoarce mereu un rezultat descriptiv pentru UI.
 */
export async function refundPayment(
  paymentReference: string,
  amount?: number
): Promise<RefundResult> {
  if (!isVictoriaBankConfigured) {
    return { ok: false, message: "VictoriaBank nu e configurat." };
  }

  const txId = transactionIdFromReference(paymentReference);
  if (!txId) {
    return { ok: false, message: "Referință de plată invalidă (lipsește id-ul tranzacției)." };
  }

  try {
    const token = await getAccessToken();
    const isPartial = typeof amount === "number" && amount > 0;
    const url = isPartial
      ? `${BASE_URL}/api/v1/transaction/${txId}/partial-refund`
      : `${BASE_URL}/api/v1/transaction/${txId}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isPartial ? { "Content-Type": "application/json" } : {}),
      },
      // Endpoint-ul de returnare integrală ignoră orice body și returnează TOT.
      body: isPartial ? JSON.stringify({ amount }) : undefined,
      cache: "no-store",
    });

    if (res.status === 204) {
      return {
        ok: true,
        message: isPartial
          ? `Returnare de ${amount!.toFixed(2)} MDL acceptată de bancă.`
          : "Returnare integrală acceptată de bancă.",
      };
    }
    if (res.status === 404) {
      // Două cauze posibile, indistingibile din răspuns:
      //  a) plata e prea recentă — banca are nevoie de ~15 secunde ca s-o
      //     înregistreze înainte de a putea fi returnată (verificat pe test);
      //  b) a fost deja returnată — se poate o singură dată.
      return {
        ok: false,
        message:
          "Banca nu găsește tranzacția. Fie plata e prea recentă (așteaptă un minut și reîncearcă), fie a fost deja returnată — o plată se poate returna o singură dată.",
      };
    }
    return { ok: false, message: `Banca a respins returnarea (HTTP ${res.status}).` };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Returnarea a eșuat.",
    };
  }
}

/** Întreabă banca statusul QR-ului. Nu aruncă — întoarce null la eșec. */
export async function getQrStatus(qrHeaderUUID: string): Promise<QrStatusResult | null> {
  if (!isVictoriaBankConfigured || !qrHeaderUUID) return null;

  try {
    const token = await getAccessToken();
    const res = await fetch(`${BASE_URL}/api/v1/qr/${qrHeaderUUID}/status?nbOfTxs=1`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      status?: QrStatus;
      extensions?: { payments?: { reference?: string }[] }[];
    };

    return {
      status: (data.status ?? "Active") as QrStatus,
      paymentReference: data.extensions?.[0]?.payments?.[0]?.reference,
    };
  } catch (error) {
    console.error("[victoriabank] getQrStatus a eșuat:", error);
    return null;
  }
}
