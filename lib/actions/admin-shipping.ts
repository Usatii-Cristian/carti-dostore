"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createShipment, getTracking } from "@/lib/shipping/fan";
import { calculateParcelWeightKg } from "@/lib/shipping/weight";

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
export async function generateAwb(orderId: string, _prev: AwbState): Promise<AwbState> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return { status: "error", message: "Comanda nu există." };
  if (order.trackingNumber) {
    return { status: "error", message: `Comanda are deja AWB-ul ${order.trackingNumber}.` };
  }
  if (!order.county) {
    return {
      status: "error",
      message:
        "Comanda n-are raionul completat (a fost plasată înainte de integrarea FAN sau orașul a fost scris manual). Completează-l în baza de date înainte de a genera AWB.",
    };
  }

  // Greutățile vin din produse; cele fără greutate setată intră cu estimarea implicită.
  const books = await prisma.book.findMany({
    where: { id: { in: order.items.map((item) => item.bookId) } },
    select: { id: true, weightGrams: true },
  });
  const weightById = new Map(books.map((book) => [book.id, book.weightGrams]));

  const weightKg = calculateParcelWeightKg(
    order.items.map((item) => ({
      quantity: item.quantity,
      weightGrams: weightById.get(item.bookId) ?? null,
    }))
  );

  try {
    const { awb } = await createShipment({
      toName: order.customerName,
      toPhone: order.customerPhone,
      toEmail: order.customerEmail,
      toCity: order.city,
      toCounty: order.county,
      toStreet: order.shippingAddress,
      weightKg,
      content: order.items.map((item) => item.title).join(", ").slice(0, 200),
      // Ramburs doar dacă nu s-a încasat deja online.
      codAmount: order.paymentStatus === "PAID" ? 0 : order.total,
      reference: order.orderNumber,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber: awb },
    });

    revalidatePath(`/admin/comenzi/${orderId}`);
    revalidatePath(`/comanda/${order.orderNumber}`);

    return { status: "success", message: `AWB generat: ${awb}`, awb };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Generarea AWB a eșuat.",
    };
  }
}

/** Istoricul coletului, pentru afișare în admin și pe pagina publică a comenzii. */
export async function fetchTracking(awb: string) {
  return getTracking(awb);
}
