import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createShipment, resolveCityAndCounty } from "@/lib/shipping/fan";
import { calculateParcelWeightKg } from "@/lib/shipping/weight";

/**
 * Creează expediția FAN pentru o comandă și salvează AWB-ul pe ea.
 *
 * Un singur loc pentru toate cele trei surse: comanda cu plata la livrare
 * (imediat ce e plasată), comanda online (imediat ce banca confirmă plata) și
 * butonul din admin (pentru retrimiteri sau localități pe care nu le-am putut
 * potrivi automat).
 *
 * NU aruncă niciodată: apelanții automați nu trebuie să strice comanda dacă FAN
 * e picat. Rezultatul spune exact ce s-a întâmplat, ca adminul să vadă motivul.
 */
export type CreateAwbResult =
  | { ok: true; awb: string }
  | { ok: false; reason: "already" | "no-county" | "failed"; message: string };

export async function createAwbForOrder(
  orderId: string,
  options: { manualCounty?: string } = {}
): Promise<CreateAwbResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return { ok: false, reason: "failed", message: "Comanda nu există." };
  }
  if (order.trackingNumber) {
    return {
      ok: false,
      reason: "already",
      message: `Comanda are deja AWB-ul ${order.trackingNumber}.`,
    };
  }

  // Raionul e obligatoriu la FAN. De regulă vine din checkout; dacă lipsește
  // (oraș scris de mână), îl deducem din lista FAN, iar în ultimă instanță îl
  // dă adminul din panou. Ce aflăm se salvează pe comandă.
  let city = order.city;
  let county = order.county ?? "";

  if (!county) {
    const resolved = await resolveCityAndCounty(order.city);
    if (resolved) {
      city = resolved.city;
      county = resolved.county;
    }
  }
  if (!county) county = (options.manualCounty ?? "").trim();

  if (!county) {
    return {
      ok: false,
      reason: "no-county",
      message: `Localitatea „${order.city}" nu se regăsește în lista FAN, deci raionul nu poate fi dedus. Scrie-l manual și încearcă din nou.`,
    };
  }

  if (city !== order.city || county !== order.county) {
    await prisma.order.update({ where: { id: orderId }, data: { city, county } });
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
      toCity: city,
      toCounty: county,
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

    return { ok: true, awb };
  } catch (error) {
    console.error(`[awb] generarea pentru ${order.orderNumber} a eșuat:`, error);
    return {
      ok: false,
      reason: "failed",
      message: error instanceof Error ? error.message : "Generarea AWB a eșuat.",
    };
  }
}
