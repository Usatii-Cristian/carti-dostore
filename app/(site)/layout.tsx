import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreHydration } from "@/components/providers/StoreHydration";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

// Randăm paginile magazinului la cerere, nu prerandate la build. Astfel build-ul
// (ex. pe Vercel) NU mai are nevoie de DATABASE_URL — baza de date e interogată
// la runtime. Bonus: datele (stoc, prețuri) sunt mereu proaspete.
export const dynamic = "force-dynamic";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dostore Carti — Librăria ta online din Moldova",
    template: "%s — Dostore Carti",
  },
  description:
    "Cărți alese cu grijă, livrate rapid oriunde în Moldova. Literatură română și universală, dezvoltare personală, psihologie, istorie și multe altele.",
  openGraph: {
    siteName: "Dostore Carti",
    type: "website",
    locale: "ro_RO",
    title: "Dostore Carti — Librăria ta online din Moldova",
    description:
      "Cărți alese cu grijă, livrate rapid oriunde în Moldova. Literatură română și universală, dezvoltare personală, psihologie, istorie și multe altele.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${playfairDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <StoreHydration />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
