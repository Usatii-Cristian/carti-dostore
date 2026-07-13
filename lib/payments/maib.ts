import crypto from "crypto";

const MAIB_BASE_URL = "https://api.maibmerchants.md/v1";
const TOKEN_SAFETY_MARGIN_MS = 30_000;

type TokenResponse = {
  ok: boolean;
  result?: {
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    refreshExpiresIn: number;
    tokenType: string;
  };
  errors?: { errorCode: string; errorMessage: string; errorArgs?: unknown }[];
};

type TokenCache = {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
};

let tokenCache: TokenCache | null = null;

async function requestToken(body: Record<string, string>): Promise<TokenCache> {
  const res = await fetch(`${MAIB_BASE_URL}/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data: TokenResponse = await res.json();

  if (!res.ok || !data.ok || !data.result) {
    const message = data.errors?.[0]?.errorMessage ?? res.statusText;
    throw new Error(`Nu am putut obține token-ul maib: ${message}`);
  }

  const now = Date.now();
  return {
    accessToken: data.result.accessToken,
    accessTokenExpiresAt: now + data.result.expiresIn * 1000,
    refreshToken: data.result.refreshToken,
    refreshTokenExpiresAt: now + data.result.refreshExpiresIn * 1000,
  };
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (tokenCache && tokenCache.accessTokenExpiresAt - TOKEN_SAFETY_MARGIN_MS > now) {
    return tokenCache.accessToken;
  }

  if (tokenCache && tokenCache.refreshTokenExpiresAt - TOKEN_SAFETY_MARGIN_MS > now) {
    try {
      tokenCache = await requestToken({ refreshToken: tokenCache.refreshToken });
      return tokenCache.accessToken;
    } catch {
      // refresh token invalid sau expirat — cerem un token nou de la zero mai jos
      tokenCache = null;
    }
  }

  const projectId = process.env.MAIB_PROJECT_ID;
  const projectSecret = process.env.MAIB_PROJECT_SECRET;

  if (!projectId || !projectSecret) {
    throw new Error(
      "MAIB_PROJECT_ID / MAIB_PROJECT_SECRET lipsesc din variabilele de mediu."
    );
  }

  tokenCache = await requestToken({ projectId, projectSecret });
  return tokenCache.accessToken;
}

export type MaibPaymentItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type CreatePaymentInput = {
  amount: number;
  currency: "MDL";
  clientIp: string;
  description: string;
  orderId: string;
  clientName: string;
  email: string;
  phone: string;
  delivery: number;
  items: MaibPaymentItem[];
  callbackUrl: string;
  okUrl: string;
  failUrl: string;
};

export type MaibPaymentResult = {
  payId: string;
  orderId: string;
  payUrl: string;
};

type PaymentResponse = {
  ok: boolean;
  result?: MaibPaymentResult;
  errors?: { errorCode: string; errorMessage: string; errorArgs?: unknown }[];
};

export async function createDirectPayment(
  input: CreatePaymentInput
): Promise<MaibPaymentResult> {
  const accessToken = await getAccessToken();

  const res = await fetch(`${MAIB_BASE_URL}/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      clientIp: input.clientIp,
      description: input.description,
      language: "ro",
      orderId: input.orderId,
      clientName: input.clientName,
      email: input.email,
      phone: input.phone,
      delivery: input.delivery,
      items: input.items,
      callbackUrl: input.callbackUrl,
      okUrl: input.okUrl,
      failUrl: input.failUrl,
    }),
  });

  const data: PaymentResponse = await res.json();

  if (!res.ok || !data.ok || !data.result) {
    const message = data.errors?.[0]?.errorMessage ?? "Plata nu a putut fi inițiată.";
    throw new Error(message);
  }

  return data.result;
}

// Algoritm de semnătură maib, tradus fidel din SDK-ul oficial PHP
// (github.com/maib-ecomm/maib-sdk-php) — nu modifica fără să verifici din nou sursa oficială.
function sortRecursive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortRecursive);
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) sorted[key] = sortRecursive(record[key]);
    return sorted;
  }
  return value;
}

function flattenValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(flattenValues);
  if (value !== null && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(flattenValues);
  }
  return [String(value)];
}

export function verifyMaibSignature(
  result: Record<string, unknown>,
  receivedSignature: string,
  signatureKey: string
): boolean {
  const values = flattenValues(sortRecursive(result));
  values.push(signatureKey);
  const computed = crypto.createHash("sha256").update(values.join(":")).digest("base64");
  return computed === receivedSignature;
}
