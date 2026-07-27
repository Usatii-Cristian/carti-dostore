"use server";

import {
  listCities,
  getShippingPrice,
  createShipment,
  getTracking,
  cancelShipment,
  getLabelUrl,
} from "@/lib/shipping/fan";

export type TestStep = {
  name: string;
  ok: boolean;
  detail: string;
};

export type FanTestState = {
  status: "idle" | "done";
  steps: TestStep[];
  awb?: string;
  labelUrl?: string;
};

/**
 * Rulează un test complet al integrării FAN Courier, cap-coadă:
 * localități → preț → creare AWB → info → istoric → etichetă → anulare.
 *
 * Creează un AWB REAL, dar îl anulează la final — ca să nu rămână o cerere de
 * ridicare activă în contul FAN.
 */
export async function runFanTest(): Promise<FanTestState> {
  const steps: TestStep[] = [];
  let awb: string | undefined;
  let labelUrl: string | undefined;

  // 1. Lista de localități
  try {
    const cities = await listCities();
    steps.push({
      name: "Lista de localități",
      ok: cities.length > 0,
      detail: `${cities.length} localități disponibile (ex: ${cities.slice(0, 3).map((c) => c.name).join(", ")})`,
    });
  } catch (error) {
    steps.push({ name: "Lista de localități", ok: false, detail: String(error).slice(0, 160) });
  }

  // 2. Calculul prețului de livrare
  try {
    const price = await getShippingPrice({
      toCity: "Balti",
      toCounty: "Balti",
      weightKg: 1.5,
      codAmount: 250,
    });
    steps.push({
      name: "Calcul preț livrare",
      ok: Boolean(price?.price),
      detail: price?.price
        ? `Chișinău → Bălți, 1.5 kg, ramburs 250 lei = ${price.price} MDL${price.deliveryEstimate ? ` · livrare estimată ${price.deliveryEstimate}` : ""}`
        : "FAN n-a întors un preț",
    });
  } catch (error) {
    steps.push({ name: "Calcul preț livrare", ok: false, detail: String(error).slice(0, 160) });
  }

  // 3. Creare AWB real (se anulează la final)
  try {
    const created = await createShipment({
      toName: "TEST — se anulează automat",
      toPhone: "069000000",
      toCity: "Balti",
      toCounty: "Balti",
      toStreet: "Independentei 1",
      weightKg: 1,
      content: "Test integrare",
      codAmount: 0,
      reference: "TEST-ADMIN",
      comments: "Test automat din panoul de administrare",
    });
    awb = created.awb;
    steps.push({ name: "Creare AWB", ok: true, detail: `AWB generat: ${created.awb}` });
  } catch (error) {
    steps.push({ name: "Creare AWB", ok: false, detail: String(error).slice(0, 200) });
  }

  if (awb) {
    // 4. Urmărire (status + istoric)
    try {
      const tracking = await getTracking(awb);
      steps.push({
        name: "Urmărire colet",
        ok: Boolean(tracking),
        detail: tracking
          ? `Status: ${tracking.status} · ${tracking.events.length} eveniment(e) în istoric`
          : "N-am putut citi statusul",
      });
    } catch (error) {
      steps.push({ name: "Urmărire colet", ok: false, detail: String(error).slice(0, 160) });
    }

    // 5. Eticheta PDF
    try {
      const url = await getLabelUrl(awb);
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      const isPdf = buffer.subarray(0, 4).toString() === "%PDF";
      if (isPdf) labelUrl = url;
      steps.push({
        name: "Etichetă PDF",
        ok: isPdf,
        detail: isPdf
          ? `PDF valid, ${(buffer.length / 1024).toFixed(1)} KB — se deschide cu butonul de mai jos`
          : buffer.toString().slice(0, 140),
      });
    } catch (error) {
      steps.push({ name: "Etichetă PDF", ok: false, detail: String(error).slice(0, 160) });
    }

    // 6. Anulare (curățenie — ca să nu rămână o ridicare programată)
    const cancelled = await cancelShipment(awb);
    steps.push({
      name: "Anulare AWB (curățenie)",
      ok: cancelled,
      detail: cancelled
        ? "AWB-ul de test a fost anulat — nu rămâne nicio ridicare programată"
        : "Anularea a eșuat — anulează manual acest AWB din contul FAN",
    });
  }

  return { status: "done", steps, awb, labelUrl };
}
