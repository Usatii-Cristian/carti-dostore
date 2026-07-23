// Formatare de date/ore în fusul orar al Moldovei.
//
// Folosim IANA `Europe/Chisinau`, NU un decalaj fix: zona e UTC+2 iarna (EET) și
// UTC+3 vara (EEST), iar schimbarea orei se face automat. Dacă am hardcoda „+3",
// afișajul ar fi greșit cu o oră jumătate de an.
//
// Important și pe server: Vercel rulează în UTC, deci fără `timeZone` explicit
// o comandă plasată la 00:30 în Chișinău s-ar afișa cu data zilei precedente.

export const MD_TIMEZONE = "Europe/Chisinau";

const DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: MD_TIMEZONE,
};

const DATE_SHORT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: MD_TIMEZONE,
};

const DATE_TIME: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: MD_TIMEZONE,
};

/** Ex: „21 iulie 2026" */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("ro-RO", DATE).format(new Date(date));
}

/** Ex: „21.07.2026" */
export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("ro-RO", DATE_SHORT).format(new Date(date));
}

/** Ex: „21 iulie 2026, 14:30" */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("ro-RO", DATE_TIME).format(new Date(date));
}
