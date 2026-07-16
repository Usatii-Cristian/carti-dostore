import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nu expune „X-Powered-By: Next.js" — info leak inutil despre stack.
  poweredByHeader: false,
  images: {
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
  // Headere de securitate aplicate tuturor rutelor. maib nu iframe-uiește
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
