import "server-only";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import { getTracking } from "@/lib/shipping/fan";
import { sendOrderStatusEmail } from "@/lib/email/notifications";
import { tgStatusChange } from "@/lib/telegram";
import { STATUS_META } from "@/lib/orders/status";
import { adjustOrderStock } from "@/lib/orders/stock";

/**
 * Aduce starea reală a coletului de la FAN și o pune pe comandă.
 *
 * De ce există: comenzile rămâneau la „în așteptare" pentru totdeauna. Starea
 * se schimba doar dacă cineva o modifica manual din admin, iar nimeni nu o
 * face — 27 de comenzi reale, dintre care unele livrate demult, stăteau tot
 * pe PENDING. Consecința pentru client: nu primea niciodată „coletul e pe drum"
 * sau „comanda a fost livrată", deși textele acelor emailuri erau deja scrise
 * și așteptau degeaba.
 *
 * FAN știe adevărul (l-am întrebat oricum pentru pagina de urmărire), deci nu
 * mai punem magazinul să copieze manual ce spune curierul.
 */

/** Starea de la FAN → starea comenzii la noi. */
const MAPARE: Record<string, OrderStatus> = {
  // „neridicat" NU e aici intenționat. Expedițiile se creează cu
  // `pickup_requested: false`, deci „neridicat" e pur și simplu starea de după
  // creare — nu spune nimic despre colet. Mapat pe PROCESSING, trimitea
  // clientului „îți ambalăm comanda" în secunda în care comanda intra, înainte
  // ca depozitul să vadă ceva. Momentul real în care coletul e gata e cererea
  // de ridicare, făcută din admin (vezi `requestPickup`).
  in_curs: "SHIPPED",
  avizat: "SHIPPED",
  livrat: "DELIVERED",
  anulat: "CANCELLED",
};

/** Stările finale: nu mai are rost să întrebăm curierul despre ele. */
const FINALE: OrderStatus[] = ["DELIVERED", "CANCELLED"];

/**
 * Peste vârsta asta corectăm starea comenzii, dar NU mai anunțăm clientul.
 *
 * Protejează împotriva „recuperării de istoric": prima rulare a găsit 15
 * comenzi rămase în urmă, unele de acum 17 zile, și ar fi trimis 14 emailuri —
 * inclusiv „comanda a fost livrată" unor oameni care primiseră coletul cu două
 * săptămâni înainte. O livrare care se mișcă după 14 zile e destul de rară cât
 * magazinul să anunțe clientul el însuși.
 */
const NOTIFY_MAX_AGE_DAYS = 14;

export type SyncSummary = { checked: number; updated: number; notified: number };

export async function syncShipmentStatuses(limit = 40): Promise<SyncSummary> {
  const summary: SyncSummary = { checked: 0, updated: 0, notified: 0 };

  let orders;
  try {
    orders = await prisma.order.findMany({
      where: { trackingNumber: { not: null }, status: { notIn: FINALE } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("[fan-sync] nu am putut citi comenzile:", error);
    return summary;
  }

  for (const order of orders) {
    summary.checked++;

    const tracking = await getTracking(order.trackingNumber!);
    if (!tracking) continue;

    const nou = MAPARE[tracking.status.toLowerCase()];
    if (!nou || nou === order.status) continue;

    // Nu dăm comanda înapoi: dacă e deja expediată, un „neridicat" întârziat de
    // la FAN n-o readuce la „se ambalează".
    const ordine: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
    if (nou !== "CANCELLED" && ordine.indexOf(nou) <= ordine.indexOf(order.status)) continue;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nou,
        statusHistory: { push: { status: nou, at: new Date() } },
        // La plata la livrare, banii intră când curierul predă coletul.
        ...(nou === "DELIVERED" && order.paymentMethod !== "ONLINE" && order.paymentStatus !== "PAID"
          ? { paymentStatus: "PAID" as const, paidAt: order.paidAt ?? new Date() }
          : {}),
      },
    });

    // Coletul anulat la curier readuce marfa în stoc (idempotent, vezi
    // lib/orders/stock.ts — dacă stocul n-a fost luat, nu face nimic).
    if (nou === "CANCELLED") await adjustOrderStock(order.id, "increment");

    summary.updated++;

    const zile = (Date.now() - order.createdAt.getTime()) / 86_400_000;
    if (zile > NOTIFY_MAX_AGE_DAYS) continue; // corectăm tăcut, vezi mai sus

    await Promise.allSettled([
      sendOrderStatusEmail({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        status: nou,
        trackingNumber: order.trackingNumber,
      }),
      tgStatusChange({
        orderNumber: order.orderNumber,
        statusLabel: STATUS_META[nou].customerLabel,
      }),
    ]);

    summary.notified++;
  }

  return summary;
}
