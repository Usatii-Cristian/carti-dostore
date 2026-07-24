import Link from "next/link";
import Image from "next/image";
import { CreditCard, ShieldCheck, Banknote, QrCode } from "lucide-react";
import { Logo } from "./Logo";
import { footerInfoLinks, footerHelpLinks } from "@/lib/nav-links";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./SocialIcons";

export function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo variant="light" />
            <p className="max-w-xs text-sm text-cream/70">
              Librăria ta online din Moldova — cărți alese cu grijă, livrate rapid,
              oriunde te-ai afla.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dostore Carti pe Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 transition-colors hover:bg-terracotta"
              >
                <FacebookIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dostore Carti pe Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 transition-colors hover:bg-terracotta"
              >
                <InstagramIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dostore Carti pe TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 transition-colors hover:bg-terracotta"
              >
                <TikTokIcon className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold">Informații</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              {footerInfoLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold">Ajutor clienți</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              {footerHelpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold">Plăți sigure</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              <li className="flex items-center gap-2">
                <QrCode className="h-4.5 w-4.5 text-gold" aria-hidden="true" />
                Plată online prin QR
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-gold" aria-hidden="true" />
                Card la livrare
              </li>
              <li className="flex items-center gap-2">
                <Banknote className="h-4.5 w-4.5 text-gold" aria-hidden="true" />
                Numerar la livrare
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-gold" aria-hidden="true" />
                Plăți criptate și securizate
              </li>
            </ul>

            {/* Siglele partenerilor de plată, în variantă albă ca să stea direct
                pe navy, fără cutie de fundal. La MIA am păstrat bulinele colorate. */}
            <div className="mt-6 flex flex-col items-start gap-4">
              {/* Aceeași înălțime pentru ambele sigle (lățimea diferă natural,
                  fiindcă au proporții diferite). */}
              <Image
                src="/plati/mia-alb.png"
                alt="MIA — plăți instant"
                width={161}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <Image
                src="/plati/victoriabank.png"
                alt="VictoriaBank"
                width={194}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-cream/10 pt-6 text-xs text-cream/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Dostore Carti. Toate drepturile rezervate.</p>
          <p>Făcut cu drag pentru cititorii din Moldova.</p>
        </div>
      </div>
    </footer>
  );
}
