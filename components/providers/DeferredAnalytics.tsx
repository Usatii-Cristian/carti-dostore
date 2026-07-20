"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

/**
 * Analytics + Speed Insights, montate DUPĂ ce pagina a devenit interactivă.
 *
 * Montate direct în layout, scripturile lor concurau cu hidratarea React pe
 * main thread și amânau desenarea hero-ului (element LCP). Le pornim la primul
 * moment de inactivitate al browserului (`requestIdleCallback`, cu fallback pe
 * timeout) — colectarea de date rămâne completă, dar nu mai fură din timpul de
 * randare inițial.
 */
export function DeferredAnalytics() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    const handle = idle(() => setReady(true));
    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, []);

  if (!ready) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
