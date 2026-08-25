"use client";

import { useEffect, useState } from "react";

/**
 * Id-urile produselor epuizate, aduse o dată de la `/api/stock`.
 *
 * De ce nu ne bazăm pe ce e salvat în coș: coșul stă în localStorage, cu datele
 * produsului „înghețate" în momentul adăugării. Un produs adăugat săptămâna
 * trecută poate fi epuizat azi, iar coșul n-ar avea de unde ști. Răspunsul e
 * mic și cachat pe CDN, deci verificarea nu costă nimic vizibil.
 *
 * Dacă cererea eșuează, întoarcem o mulțime goală: nu blocăm cumpărarea pentru
 * o eroare de rețea — verificarea decisivă se face oricum pe server, la
 * plasarea comenzii.
 */
export function useOutOfStockIds(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;

    fetch("/api/stock")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { outOfStock?: string[] } | null) => {
        if (cancelled || !data?.outOfStock) return;
        setIds(new Set(data.outOfStock));
      })
      .catch(() => {
        // vezi comentariul de mai sus
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return ids;
}
