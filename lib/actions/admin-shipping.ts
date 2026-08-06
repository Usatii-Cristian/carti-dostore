"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTracking, cancelShipment, getLabelUrl } from "@/lib/shipping/fan";
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
