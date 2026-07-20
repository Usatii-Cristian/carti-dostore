import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { DeferredAnalytics } from "@/components/providers/DeferredAnalytics";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreHydration } from "@/components/providers/StoreHydration";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

// ISR: paginile magazinului sunt prerandate (servite rapid din CDN) și
// revalidate periodic + la cerere (revalidatePath din admin la orice modificare).
// Mult mai rapid decât force-dynamic, care lovea baza de date la fiecare request.
export const revalidate = 3600;

// `display: "swap"` — textul apare imediat cu fontul de sistem și se schimbă
// când fontul real e gata, în loc să rămână invizibil. Fără el, titlul din hero
// aștepta ~190KB de woff2 înainte să se vadă.
// Playfair e doar pentru titluri: îi cerem strict greutățile folosite, ca să nu
// descărcăm toată axa variabilă.
// Playfair e folosit DOAR la titluri, care apar mai jos în pagină. `preload:false`
// îl scoate din lanțul critic: browserul nu mai amână prima randare pentru el,
// iar `swap` afișează titlul cu fontul de sistem până sosește. Inter (textul
// curent, deci vizibil imediat) rămâne preîncărcat.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  // Doar 600: în tot site-ul, `font-serif` apare exclusiv cu `font-semibold`.
  // Greutatea 700 se descărca degeaba.
  weight: ["600"],
  display: "swap",
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
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
        <DeferredAnalytics />
      </body>
    </html>
  );
}
