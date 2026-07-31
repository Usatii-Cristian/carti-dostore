import "server-only";

// Client pentru API-ul FAN Courier Moldova.
// Docs: https://app.fancourier.md/fan/Main?apiDocs=true
//
// Reguli de bază ale API-ului (nu le schimba fără să recitești docs):
// - `application/x-www-form-urlencoded`, NU JSON în body
// - autentificare prin parametrul `api_key`
// - răspuns: { status: "done"|"failed", data, error, message }
//
// Ca la MIA / email / Telegram: fără `FAN_API_KEY` intrăm în mod no-op —
// logăm și returnăm un rezultat neutru, ca fluxul de comandă să meargă local
// fără credențiale. Nimic din acest fișier nu aruncă în sus pe căile
// necritice (preț, tracking); doar crearea AWB semnalează eroarea, fiindcă
// acolo adminul trebuie să afle că n-a mers.

const FAN_BASE_URL = "https://app.fancourier.md/fan/API";

const apiKey = process.env.FAN_API_KEY;
export const isFanConfigured = typeof apiKey === "string" && apiKey.length > 10;

/**
 * Adresa expeditorului, exact cum e salvată în contul FAN (`list_addresses`).
 * Trimisă explicit la fiecare expediție — vezi comentariul din createShipment
 * despre `use_default_from_address`. Se poate suprascrie din variabile de mediu
 * dacă se schimbă sediul, fără modificare de cod.
 */
const SENDER = {
  name: process.env.FAN_SENDER_NAME ?? "Free Life SRL",
  contact: process.env.FAN_SENDER_CONTACT ?? "Free Life SRL",
  street: process.env.FAN_SENDER_STREET ?? "Petru Zadnipru",
  nr: process.env.FAN_SENDER_NR ?? "19",
  bl: process.env.FAN_SENDER_BL ?? "2",
  sc: process.env.FAN_SENDER_SC ?? "1",
  et: process.env.FAN_SENDER_ET ?? "8",
  ap: process.env.FAN_SENDER_AP ?? "30",
  sector: process.env.FAN_SENDER_SECTOR ?? "Ciocana",
  city: process.env.FAN_SENDER_CITY ?? "Chisinau",
  county: process.env.FAN_SENDER_COUNTY ?? "Chisinau",
  zipcode: process.env.FAN_SENDER_ZIPCODE ?? "MD 2044",
  phone: process.env.FAN_SENDER_PHONE ?? "068812853",
} as const;

type FanEnvelope<T> = {
  status?: "done" | "failed";
  data?: T;
  error?: string;
  message?: string;
};

async function fanRequest<T>(
  operation: string,
  params: Record<string, string | number | boolean | undefined>
): Promise<FanEnvelope<T>> {
  const body = new URLSearchParams();
  body.set("api_key", apiKey ?? "");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") body.set(key, String(value));
  }

  const res = await fetch(`${FAN_BASE_URL}/${operation}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`FAN ${operation}: răspuns necitibil (${res.status}): ${text.slice(0, 200)}`);
  }

  // Unele operații (list_cities, list_services) întorc direct un array,
  // fără învelișul { status, data }.
  if (Array.isArray(parsed)) return { status: "done", data: parsed as T };
  return parsed as FanEnvelope<T>;
}

// ---------------------------------------------------------------- localități

export type FanCity = {
  country: string;
  province: string; // raionul — se trimite înapoi ca `to_county`
  name: string; // localitatea — se trimite înapoi ca `to_city`
  extra_km: string;
};

let citiesCache: { at: number; cities: FanCity[] } | null = null;
const CITIES_TTL_MS = 24 * 60 * 60 * 1000; // lista se schimbă rar

export async function listCities(): Promise<FanCity[]> {
  if (!isFanConfigured) return [];
  if (citiesCache && Date.now() - citiesCache.at < CITIES_TTL_MS) return citiesCache.cities;

  try {
    const res = await fanRequest<FanCity[]>("list_cities", {});
    const cities = Array.isArray(res.data) ? res.data : [];
    if (cities.length > 0) citiesCache = { at: Date.now(), cities };
    return cities;
  } catch (error) {
    console.error("[fan] list_cities a eșuat:", error);
    return citiesCache?.cities ?? [];
  }
}

// ------------------------------------------------------------------ tarifare

export type FanPrice = {
  price: number;
  deliveryEstimate?: string;
};

/**
 * Cât ne costă PE NOI expedierea (tariful din contractul FAN).
 * Nu e prețul afișat clientului — acela vine din regula proprie de livrare
 * (vezi `getShippingCost`). Îl salvăm pe comandă ca să se vadă marja în admin.
 * Nu aruncă niciodată: dacă FAN nu răspunde, întoarce null.
 */
export async function getShippingPrice(input: {
  toCity: string;
  toCounty: string;
  weightKg: number;
  codAmount?: number;
  parcels?: number;
}): Promise<FanPrice | null> {
  if (!isFanConfigured) {
    console.info("[fan] SKIP get_price (FAN_API_KEY neconfigurat)");
    return null;
  }

  try {
    const res = await fanRequest<{
      price?: number;
      delivery_estimate_formatted?: string;
    }>("get_price", {
      to_city: input.toCity,
      to_county: input.toCounty,
      weight: input.weightKg,
      type: "package",
      cnt: input.parcels ?? 1,
      ramburs: input.codAmount,
      use_default_from_address: true,
    });

    if (res.status !== "done" || typeof res.data?.price !== "number") {
      console.error("[fan] get_price a răspuns neașteptat:", res.message ?? res.error);
      return null;
    }

    return {
      price: res.data.price,
      deliveryEstimate: res.data.delivery_estimate_formatted,
    };
  } catch (error) {
    console.error("[fan] get_price a eșuat:", error);
    return null;
  }
}

// ---------------------------------------------------------------------- AWB

export type CreateShipmentInput = {
  toName: string;
  toPhone: string;
  toEmail?: string;
  toCity: string;
  toCounty: string;
  toStreet: string;
  weightKg: number;
  parcels?: number;
  content: string;
  /** Suma de încasat la livrare (ramburs). 0 / omis pentru comenzi deja plătite. */
  codAmount?: number;
  /** Numărul comenzii noastre — apare în FAN ca referință proprie. */
  reference: string;
  comments?: string;
};

export type CreatedShipment = {
  awb: string;
};

/**
 * Creează expediția în FAN. ATENȚIE: expediția se creează direct în status
 * „uncollected" (nu draft) — e o acțiune REALĂ, care intră în fluxul de
 * ridicare al curierului. De-asta o declanșăm doar din admin, explicit, nu
 * automat la fiecare comandă plasată.
 *
 * Spre deosebire de restul funcțiilor, ASTA aruncă la eșec: adminul care apasă
 * „Generează AWB" trebuie să vadă de ce n-a mers.
 */
export async function createShipment(input: CreateShipmentInput): Promise<CreatedShipment> {
  if (!isFanConfigured) {
    throw new Error("FAN_API_KEY nu e configurat — nu pot genera AWB.");
  }

  const res = await fanRequest<{ no?: string } | { no?: string }[]>("create_shipment", {
    // ⚠️ NU folosi `use_default_from_address` — creează AWB-uri „nefinalizate":
    // eticheta întoarce „Shipment is not finalized yet", iar anularea „forbidden".
    // Verificat direct pe API-ul FAN: cu adresa expeditorului trimisă explicit,
    // ambele funcționează. Datele sunt cele din contul FAN (list_addresses).
    from_name: SENDER.name,
    from_contact: SENDER.contact,
    from_str: SENDER.street,
    from_nr: SENDER.nr,
    from_bl: SENDER.bl,
    from_sc: SENDER.sc,
    from_et: SENDER.et,
    from_ap: SENDER.ap,
    from_sector: SENDER.sector,
    from_city: SENDER.city,
    from_county: SENDER.county,
    from_country: "MD",
    from_zipcode: SENDER.zipcode,
    from_phone: SENDER.phone,
    type: "package",
    // ⚠️ OBLIGATORIU. Fără `service_type`, FAN creează AWB-ul dar îl lasă
    // NEFINALIZAT: eticheta răspunde „Shipment is not finalized yet" și
    // anularea „forbidden". Verificat A/B direct pe API — cu el, ambele merg.
    service_type: "Standard",
    to_name: input.toName,
    to_contact: input.toName,
    to_phone: input.toPhone,
    to_email: input.toEmail,
    to_city: input.toCity,
    to_county: input.toCounty,
    to_str: input.toStreet,
    to_country: "MD",
    weight: input.weightKg,
    cnt: input.parcels ?? 1,
    content: input.content,
    customer_reference: input.reference,
    comments: input.comments,
    // ⚠️ ramburs_type=cash e RESPINS pe contul nostru FAN ("Tip de transfer
    // COD incorect pentru acest client") — verificat direct pe API. Contul e
    // configurat pentru decontare prin virament bancar, nu cash fizic la
    // predare. "cont" e valoarea corectă: clientul plătește curierului la
    // livrare, iar noi primim suma prin transfer în contul înregistrat la FAN.
    ...(input.codAmount && input.codAmount > 0
      ? { ramburs: input.codAmount, ramburs_type: "cont" }
      : {}),
  });

  if (res.status !== "done") {
    throw new Error(`FAN a refuzat expediția: ${res.message ?? res.error ?? "motiv necunoscut"}`);
  }

  // Răspunsul poate veni ca obiect sau ca listă cu o singură expediție.
  const created = Array.isArray(res.data) ? res.data[0] : res.data;
  const awb = created?.no;

  if (!awb) {
    throw new Error("FAN a confirmat expediția dar n-a returnat numărul AWB.");
  }

  return { awb: String(awb) };
}

export async function cancelShipment(awb: string): Promise<boolean> {
  if (!isFanConfigured) return false;
  try {
    const res = await fanRequest<unknown>("cancel", { awbno: awb });
    return res.status === "done";
  } catch (error) {
    console.error("[fan] cancel a eșuat:", error);
    return false;
  }
}

// ------------------------------------------------------------------ tracking

export type FanTrackingEvent = {
  date: string;
  status: string;
  description?: string;
};

export type FanTracking = {
  awb: string;
  status: string;
  events: FanTrackingEvent[];
};

/** Istoricul coletului pentru pagina publică de urmărire. Nu aruncă. */
export async function getTracking(awb: string): Promise<FanTracking | null> {
  if (!isFanConfigured) return null;

  try {
    const res = await fanRequest<{
      no?: string;
      status?: string;
      history?: { date?: string; status?: string; description?: string }[];
    }>("get_history", { awbno: awb, full: true });

    if (res.status !== "done" || !res.data) return null;

    return {
      awb: String(res.data.no ?? awb),
      status: String(res.data.status ?? "necunoscut"),
      events: (res.data.history ?? []).map((event) => ({
        date: String(event.date ?? ""),
        status: String(event.status ?? ""),
        description: event.description ? String(event.description) : undefined,
      })),
    };
  } catch (error) {
    console.error("[fan] get_history a eșuat:", error);
    return null;
  }
}

/**
 * Eticheta de lipit pe colet, ca PDF.
 *
 * ⚠️ Parametrul corect e `pdf=true` — NU `type=pdf` (cum aveam înainte, ceea ce
 * întorcea o eroare JSON în loc de PDF). Verificat direct pe API-ul FAN:
 * `pdf=true` → PDF de ~18KB; fără parametru → tot PDF; `type=pdf` → eroare.
 * Documentat în formularul lor: <input type="checkbox" name="pdf" value="true">
 */
export async function getLabelUrl(awb: string): Promise<string> {
  const params = new URLSearchParams({
    api_key: apiKey ?? "",
    awbno: awb,
    pdf: "true",
  });
  return `${FAN_BASE_URL}/print?${params.toString()}`;
}
