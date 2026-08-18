import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmOrderPayment } from "@/lib/payments/confirm";

// Webhook de semnal de la VictoriaBank (POST /api/signals în docs — noi
// înregistrăm ACEASTĂ adresă la bancă). Corpul e un string JSON care conține
// un JWT semnat de bancă.
//
// Securitate: NU ne bazăm pe conținutul semnalului ca să marcăm plata. Îl
// folosim doar ca să aflăm CARE comandă să reverificăm, apoi întrebăm banca
// prin API-ul autentificat (`confirmOrderPayment` → getQrStatus). Astfel un
// semnal forjat nu poate marca nimic plătit — banca rămâne sursa de adevăr.
export const runtime = "nodejs";

function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const raw = await request.text();

  // Corpul e un JSON string a cărui valoare e JWT-ul.
  let jwt: unknown;
  try {
    jwt = JSON.parse(raw);
  } catch {
    jwt = raw;
  }
  if (typeof jwt !== "string") return NextResponse.json({ ok: true });

  const payload = decodeJwtPayload(jwt);
  const extensionUuid = payload?.qrExtensionUUID as string | undefined;
  if (!extensionUuid) return NextResponse.json({ ok: true });

  // Găsim comanda după qrExtensionUUID, apoi confirmăm prin banca (autentificat).
  const order = await prisma.order.findFirst({
    where: { qrExtensionUUID: extensionUuid },
    select: { orderNumber: true },
  });
  if (order) await confirmOrderPayment(order.orderNumber);

  // 204 recomandat de docs, dar 200 e acceptat — răspundem OK ca banca să nu reîncerce.
  return NextResponse.json({ ok: true });
}

// Deschis în browser, adresa asta primea 405 (browserul face GET, iar webhook-ul
// acceptă doar POST) — arăta ca o eroare de site atât pentru noi, cât și pentru
// cine verifică URL-ul înainte de înregistrare. Răspundem cu o confirmare
// scurtă, fără nicio informație sensibilă.
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "victoriabank-mia-signal",
    method: "POST",
    message: "Endpoint activ. Semnalele de plată se trimit prin POST.",
  });
}
