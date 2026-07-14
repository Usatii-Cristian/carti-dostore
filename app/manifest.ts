import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dostore Carti",
    short_name: "Dostore Carti",
    description: "Librăria ta online din Moldova — cărți alese cu grijă, livrate rapid.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf5ec",
    theme_color: "#1b2a4a",
    lang: "ro",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
