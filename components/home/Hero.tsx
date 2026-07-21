import Image from "next/image";
import Link from "next/link";
import { HERO_BLUR } from "@/lib/hero-blur";

export function Hero() {
  // Hero-ul e elementul LCP. Randăm imaginea mobilă cu `priority` (Lighthouse și
  // majoritatea vizitatorilor sunt pe mobil, deci ea trebuie preîncărcată în
  // <head>) și cea de desktop fără priority, ascunsă pe mobil (`hidden md:block`,
  // deci nu se descarcă pe telefon). Un `<picture>` cu <img> simplu NU emite
  // hint-ul de preload al lui Next — de-aia folosim componenta `Image`.
  return (
    <section className="relative isolate flex min-h-[32rem] items-start overflow-hidden sm:min-h-[34rem] md:items-center">
      {/* Placeholder blur: apare instant ca fundal cât timp se încarcă imaginea
          reală. Elimină „gap-ul" gol dinaintea LCP-ului. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BLUR.mobile})` }}
      />
      <Image
        src="/hero-mobile.webp"
        alt="Cărți și flori uscate pe o masă de lemn"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-bottom md:hidden"
      />
      <Image
        src="/hero-desktop.webp"
        alt=""
        fill
        sizes="100vw"
        className="hidden object-cover md:block"
      />

      {/* Voal crem pentru lizibilitatea textului (sus pe mobil, stânga pe desktop) */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream/85 via-cream/30 to-transparent md:bg-gradient-to-r md:from-cream/90 md:via-cream/45 md:to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-md md:max-w-xl">
          {/* Titlul vizibil a fost scos la cererea utilizatorului. Păstrăm un H1
              invizibil (doar pentru Google + cititoare de ecran), altfel pagina
              ar rămâne fără titlu principal — rău pentru SEO. */}
          <h1 className="sr-only">Dostore Cărți — librărie și uleiuri esențiale în Moldova</h1>
          <p className="font-medium uppercase tracking-widest text-terracotta">
            Dostore Cărți — Moldova
          </p>
          <p className="mt-5 max-w-lg text-lg text-ink-soft">
            De la cărți pentru suflet și dezvoltare, până la ghiduri de uleiuri esențiale și
            materiale pentru afacerea ta — livrate rapid oriunde în Moldova.
          </p>
          <div className="mt-8">
            <Link
              href="/carti/bestsellers"
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3.5 font-semibold text-cream shadow-lg shadow-terracotta/20 transition-colors hover:bg-terracotta-dark"
            >
              Descoperă acum
            </Link>
          </div>

          {/* Citat-semnătură: stă sub CTA ca să nu-i fure atenția. Pe mobil cade
              peste fotografie (voalul crem e transparent jos), deci primește un
              panou translucid cu blur; pe desktop stă pe voal și rămâne curat. */}
          <blockquote className="mt-10 rounded-r-xl border-l-2 border-terracotta/60 bg-cream/75 p-4 pl-5 backdrop-blur-sm md:bg-transparent md:p-0 md:pl-5 md:backdrop-blur-none">
            <p className="font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
              „Singurul bine este <span className="font-semibold not-italic text-ink">CUNOAȘTEREA</span>.
              Singurul rău este <span className="font-semibold not-italic text-ink">ignoranța</span>!”
            </p>
            <cite className="mt-2 block text-sm not-italic uppercase tracking-widest text-terracotta">
              Socrate
            </cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
