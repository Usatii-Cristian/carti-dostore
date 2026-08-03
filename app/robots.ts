import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/cos",
        "/favorite",
        "/checkout",
        // Paginile de confirmare/urmărire ale unei comenzi conțin date
        // personale și n-au ce căuta în rezultatele căutării.
        "/comanda",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
