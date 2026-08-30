"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTracking, cancelShipment, getLabelUrl, orderPickup } from "@/lib/shipping/fan";
import { calculateParcelWeightKg } from "@/lib/shipping/weight";
import { sendOrderStatusEmail } from "@/lib/email/notifications";
import { tgStatusChange } from "@/lib/telegram";
import { createAwbForOrder } from "@/lib/shipping/create-awb";

export type AwbState = {
  status: "idle" | "error" | "success";
  message?: string;
  awb?: string;
};

/**
 * Generează AWB-ul FAN pentru o comandă. Declanșat EXPLICIT din admin, nu
 * automat la plasarea comenzii: la FAN expediția se creează direct în status
 * „uncollected" (nu ciornă), deci e o cerere reală de ridicare — n-o vrem
 * pentru comenzi abandonate sau de test.
 */
export async function generateAwb(
  orderId: string,
  _prev: AwbState,
  formData?: FormData
): Promise<AwbState> {
  const result = await createAwbForOrder(orderId, {
    manualCounty: String(formData?.get("county") ?? ""),
  });

  if (!result.ok) return { status: "error", message: result.message };

  return { status: "success", message: `AWB generat: ${result.awb}`, awb: result.awb };
}

/** Istoricul coletului, pentru afișare în admin și pe pagina publică a comenzii. */
export async function fetchTracking(awb: string) {
  return getTracking(awb);
}

/** Linkul către eticheta PDF de lipit pe colet (conține cheia API — doar admin). */
export async function fetchLabelUrl(awb: string) {
  return getLabelUrl(awb);
}

/**
 * Anulează AWB-ul la FAN și îl șterge de pe comandă, ca să poți genera altul.
 *
 * ⚠️ Merge doar cât timp coletul n-a fost ridicat de curier. După ridicare,
 * FAN răspunde „forbidden" — atunci anularea se face telefonic cu ei.
 */
export async function cancelAwb(orderId: string, _prev: AwbState): Promise<AwbState> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.trackingNumber) {
    return { status: "error", message: "Comanda n-are AWB de anulat." };
  }

  const ok = await cancelShipment(order.trackingNumber);
  if (!ok) {
    return {
      status: "error",
      message:
        "FAN a refuzat anularea. De obicei înseamnă că expediția a fost deja preluată de curier — anuleaz-o telefonic cu ei.",
    };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { trackingNumber: null },
  });

  revalidatePath(`/admin/comenzi/${orderId}`);
  revalidatePath(`/comanda/${order.orderNumber}`);

  return { status: "success", message: "AWB anulat. Poți genera unul nou." };
}

/**
 * Cheamă curierul pentru un colet împachetat.
 *
 * Expedițiile se creează cu `pickup_requested: false`: apar complete în contul
 * FAN, dar curierul NU e trimis. Asta a fost problema reală — curierul ajungea
 * la poartă înainte ca depozitul să apuce să vadă comanda. Ridicarea e o cerere
 * separată, apăsată de magazin când coletul chiar există.
 *
 * Tot aici comanda trece pe „în procesare" și clientul e anunțat: ăsta e
 * primul moment în care chiar se întâmplă ceva cu coletul lui.
 */
export async function requestPickup(orderId: string, _prev: AwbState): Promise<AwbState> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order?.trackingNumber) {
    return { status: "error", message: "Comanda n-are AWB — generează-l întâi." };
  }
  if (order.pickupRequestedAt) {
    return { status: "error", message: "Curierul a fost deja chemat pentru această comandă." };
  }

  const books = await prisma.book.findMany({
    where: { id: { in: order.items.map((i) => i.bookId) } },
    select: { id: true, weightGrams: true },
  });
  const greutati = new Map(books.map((b) => [b.id, b.weightGrams]));
  const weightKg = calculateParcelWeightKg(
    order.items.map((i) => ({ quantity: i.quantity, weightGrams: greutati.get(i.bookId) ?? null }))
  );

  const result = await orderPickup(order.trackingNumber, { weightKg, parcels: 1 });
  if (!result.ok) return { status: "error", message: result.message };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      pickupRequestedAt: new Date(),
      ...(order.status === "PENDING" || order.status === "CONFIRMED"
        ? { status: "PROCESSING" as const, statusHistory: { push: { status: "PROCESSING" as const, at: new Date() } } }
        : {}),
    },
  });

  await Promise.allSettled([
    sendOrderStatusEmail({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderNumber: order.orderNumber,
      status: "PROCESSING",
      trackingNumber: order.trackingNumber,
    }),
    tgStatusChange({ orderNumber: order.orderNumber, statusLabel: "În procesare" }),
  ]);

  revalidatePath(`/admin/comenzi/${orderId}`);
  revalidatePath("/admin/comenzi");
  revalidatePath(`/comanda/${order.orderNumber}`);

  return { status: "success", message: "Curierul a fost chemat. Coletul va fi ridicat în curând." };
}
