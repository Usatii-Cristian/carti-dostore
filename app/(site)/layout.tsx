import type { Metadata } from "next";
import { inter, playfairDisplay } from "@/app/fonts";
import { DeferredAnalytics } from "@/components/providers/DeferredAnalytics";
import { CookieConsent } from "@/components/providers/CookieConsent";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreHydration } from "@/components/providers/StoreHydration";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Site-ul e accesibil și pe adresa *.vercel.app, iar fără canonical Google
  // le-ar putea trata ca două site-uri identice (conținut duplicat) și ar
  // indexa-o pe cea greșită. `"./"` se rezolvă relativ la `metadataBase`, deci
  // fiecare pagină își declară singură adresa canonică pe dostore.md.
  alternates: { canonical: "./" },
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
        <CookieConsent />
        <DeferredAnalytics />
      </body>
    </html>
  );
}
