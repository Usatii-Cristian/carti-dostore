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

/** Cât așteptăm după FAN până renunțăm (checkout-ul nu trebuie să atârne). */
const FAN_TIMEOUT_MS = 8000;

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

  // Timeout explicit: fără el, o cerere care atârnă la FAN ar ține blocat
  // checkout-ul clientului (estimarea costului rulează înainte de redirect).
  const res = await fetch(`${FAN_BASE_URL}/${operation}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(FAN_TIMEOUT_MS),
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

/** Fără diacritice, litere mici, spații normalizate — pentru potrivirea localităților. */
function normalizeCityName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Găsește raionul (province) unei localități în lista FAN.
 *
 * De ce există: în checkout raionul vine din autocomplete, dar clientul poate
 * scrie orașul de mână (sau alege din sugestiile browserului) și atunci câmpul
 * rămâne gol — iar fără raion NU se poate genera AWB-ul, deci comanda rămâne
 * blocată la livrare. Aici îl deducem pe server, din același nume de localitate.
 * Întoarce și forma canonică a localității, cum o știe FAN („Chisinau", nu
 * „Chișinău"), fiindcă AWB-ul o cere exact așa.
 */
export async function resolveCityAndCounty(
  city: string
): Promise<{ city: string; county: string } | null> {
  const target = normalizeCityName(city);
  if (!target) return null;

  const cities = await listCities();
  // „mun. Chisinau", „or. Ungheni", „s. Cojusna" — prefixe scrise de client.
  const stripped = target.replace(/^(mun\.?|or\.?|s\.?|sat|com\.?)\s+/, "");

  const matches = cities.filter((entry) => {
    const name = normalizeCityName(entry.name);
    return name === target || name === stripped;
  });

  if (matches.length === 1) {
    return { city: matches[0].name, county: matches[0].province };
  }

  // ⚠️ 123 de nume se repetă în lista FAN (există și satul Soroca din raionul
  // Glodeni, nu doar orașul Soroca). Când numele e ambiguu, singura alegere
  // sigură e reședința de raion — acolo numele localității coincide cu raionul.
  // Dacă nici asta nu departajează, NU ghicim: raionul rămâne gol și îl
  // completează adminul, în loc să trimitem coletul în alt colț de țară.
  const seat = matches.find(
    (entry) => normalizeCityName(entry.province) === normalizeCityName(entry.name)
  );
  return seat ? { city: seat.name, county: seat.province } : null;
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
    // ⚠️ `service_type` e OBLIGATORIU. Fără el expediția chiar se creează, și
    // chiar rămâne în starea „initial" (ce ne doream), DAR e invalidă: FAN o
    // marchează „Serviciu lipsă. Serviciul este incorect." și magazinul nu poate
    // lucra cu ea. S-a întâmplat pe o comandă reală. Singura valoare acceptată
    // pe contul nostru e „Standard" (`list_services?type=main`).
    service_type: "Standard",
    // Cererea de ridicare e ce aducea curierul după un colet neîmpachetat.
    // Cu `false`, expediția intră în cont completă și validă, dar FAN NU
    // trimite curierul: magazinul cere ridicarea din aplicație când e gata
    // (`pickup_date` rămâne 0).
    pickup_requested: false,
    //
    // De ce nu obținem starea „Initial" din cod: verificat A/B pe API
    // (30.08.2026) — cu `service_type` → „neridicat"; fără → „initial" dar fără
    // serviciu; `update_shipment` acceptă doar `cnt`, deci serviciul nu se mai
    // poate pune după creare. Starea inițială a expedițiilor din API se schimbă
    // DOAR din setările contului FAN (`Initial_api_status`), nu prin API.
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

/**
 * Anulează expediția, indiferent în ce stare e.
 *
 * FAN are două căi și fiecare merge doar pe jumătate din cazuri: `cancel`
 * funcționează pe expedițiile finalizate („neridicat") și răspunde `forbidden`
 * pe cele „initial"; `change_status` cu „anulat" le rezolvă pe cele „initial".
 * Le încercăm pe rând, ca butonul din admin să meargă în ambele situații —
 * altfel o comandă falsă rămasă în „initial" n-ar putea fi ștearsă din panou.
 */
export async function cancelShipment(awb: string): Promise<boolean> {
  if (!isFanConfigured) return false;

  // Prima cale, pentru expedițiile finalizate. Pe cele „initial" FAN răspunde
  // cu 200 și corpul „forbidden" — text simplu, nu JSON, deci `fanRequest`
  // ARUNCĂ. De aceea apelul stă în propriul try: fără el, excepția ar sări
  // peste a doua cale și butonul de anulare n-ar merge deloc pe „initial".
  try {
    const res = await fanRequest<unknown>("cancel", { awbno: awb });
    if (res.status === "done") return true;
  } catch {
    // mergem pe a doua cale
  }

  try {
    const res = await fanRequest<unknown>("change_status", { awbno: awb, status: "anulat" });
    return res.status === "done";
  } catch (error) {
    console.error("[fan] anularea a eșuat:", error);
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
