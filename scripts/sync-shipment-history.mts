/**
 * Aduce o singură dată comenzile vechi la starea reală de la FAN, FĂRĂ să
 * anunțe clienții.
 *
 * De ce separat de `syncShipmentStatuses`: sincronizarea automată a găsit la
 * prima rulare 15 comenzi rămase în urmă (unele livrate de două săptămâni) și
 * ar fi trimis 14 emailuri de tipul „comanda a fost livrată" unor oameni care
 * aveau de mult coletul acasă. Istoricul se corectează tăcut, o singură dată;
 * de aici încolo schimbările sunt proaspete și clientul e anunțat normal.
 *
 *   npx tsx scripts/sync-shipment-history.mts          # arată ce ar face
 *   npx tsx scripts/sync-shipment-history.mts --scrie  # aplică
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import type { OrderStatus } from "@prisma/client";

const { prisma } = await import("@/lib/prisma");
const { getTracking } = await import("@/lib/shipping/fan");

const scrie = process.argv.includes("--scrie");

const MAPARE: Record<string, OrderStatus> = {
  neridicat: "PROCESSING",
  in_curs: "SHIPPED",
  avizat: "SHIPPED",
  livrat: "DELIVERED",
  anulat: "CANCELLED",
};
const ORDINE: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const orders = await prisma.order.findMany({
  where: { trackingNumber: { not: null }, status: { notIn: ["DELIVERED", "CANCELLED"] } },
  orderBy: { createdAt: "desc" },
});

let schimbate = 0;
for (const order of orders) {
  const tracking = await getTracking(order.trackingNumber!);
  const nou = tracking ? MAPARE[tracking.status.toLowerCase()] : undefined;
  if (!nou || nou === order.status) continue;
  if (nou !== "CANCELLED" && ORDINE.indexOf(nou) <= ORDINE.indexOf(order.status)) continue;

  console.log(`${order.orderNumber}: ${order.status} → ${nou} (FAN: ${tracking!.status})`);
  schimbate++;

  if (!scrie) continue;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nou,
      statusHistory: { push: { status: nou, at: new Date() } },
      ...(nou === "DELIVERED" && order.paymentMethod !== "ONLINE" && order.paymentStatus !== "PAID"
        ? { paymentStatus: "PAID" as const, paidAt: order.paidAt ?? new Date() }
        : {}),
    },
  });
}

console.log(
  `\n${schimbate} comenzi ${scrie ? "aduse la starea reală (fără emailuri)" : "ar fi actualizate — rulează cu --scrie"}`
);
await prisma.$disconnect();
process.exit(0);
