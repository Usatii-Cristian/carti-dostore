"use client";

import { useEffect, useState } from "react";

/**
 * Numărătoare inversă vizibilă, apoi trimitem clientul pe pagina principală.
 *
 * De ce cu întârziere și nu redirect imediat: statusul HTTP rămâne 404 (Next
 * adaugă automat și `noindex`), deci motoarele de căutare văd corect că pagina
 * nu există, iar omul apucă să înțeleagă ce s-a întâmplat înainte să fie mutat.
 * Un redirect instant ar face adresa greșită invizibilă și ar deruta.
 *
 * `window.location.replace` (nu `push`): pagina inexistentă nu rămâne în
 * istoric, deci butonul „înapoi" nu readuce clientul în 404.
 */
export function NotFoundRedirect({ seconds = 5 }: { seconds?: number }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const tick = setInterval(() => setLeft((value) => value - 1), 1000);
    const timer = setTimeout(() => window.location.replace("/"), seconds * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(timer);
    };
  }, [seconds]);

  return (
    <p className="mt-6 text-sm text-ink-soft/80" aria-live="polite">
      Te ducem pe pagina principală în {Math.max(0, left)}{" "}
      {Math.max(0, left) === 1 ? "secundă" : "secunde"}…
    </p>
  );
}
