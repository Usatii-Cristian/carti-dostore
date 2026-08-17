import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nu expune „X-Powered-By: Next.js" — info leak inutil despre stack.
  poweredByHeader: false,
  // Fișierele citite la runtime cu `fs` (fonturile și siglele din bonul PDF) nu
  // sunt detectate automat de tracing-ul Vercel — fără asta, funcția ajunge în
  // producție fără ele și generarea bonului crapă.
  outputFileTracingIncludes: {
    "/**": [
      "./lib/email/pdf/fonts/**",
      "./public/plati/mia-logo.png",
      "./public/logo-nou.png",
      "./node_modules/pdfkit/js/data/**",
    ],
  },
  // lucide-react exportă mii de iconițe dintr-un singur barrel file. Fără asta,
  // bundler-ul trage tot modulul ca să găsească cele ~20 pe care le folosim.
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // 404 propriu pentru rutele care nu se potrivesc cu nimic. Necesar fiindcă
    // avem DOUĂ root layout-uri (app/(site) și app/admin), deci Next n-are din
    // ce compune un 404 global — fără asta, o adresă inexistentă primea pagina
    // implicită „This page could not be found". Vezi app/global-not-found.tsx.
    globalNotFound: true,
    // Cache-ul client pentru navigarea înapoi. Fără el, o pagină dinamică
    // (ex. /carti) se re-randează la „back", iar browserul restaurează scroll-ul
    // înainte să existe conținutul — utilizatorul ajunge mult mai sus decât era
    // (măsurat: 1400px → 261px pe mobil, după intrarea pe un produs).
    staleTimes: { dynamic: 60, static: 180 },
  },
  images: {
    // AVIF înaintea WebP: pe aceleași coperți iese cu 20–40% mai mic, iar
    // browserele care nu-l acceptă primesc automat WebP.
    formats: ["image/avif", "image/webp"],
    // Imaginile de produs nu se schimbă după încărcare, deci varianta optimizată
    // poate sta mult în cache-ul CDN (implicit era ordinul minutelor).
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Next 16 acceptă doar calitățile declarate aici. 65 pentru miniaturile din
    // catalog, 75 pentru imaginile mari de pe pagina produsului.
    qualities: [65, 70, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "www.jotform.com",
      },
    ],
  },
  // Headere de securitate aplicate tuturor rutelor. MIA nu iframe-uiește
  // callback-ul, iar site-ul nu e menit să fie încapsulat, deci blocăm
  // clickjacking-ul cu frame-ancestors 'none' / X-Frame-Options DENY.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
