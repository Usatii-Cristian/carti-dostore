import { getImageProps } from "next/image";
import Link from "next/link";
import { HERO_BLUR } from "@/lib/hero-blur";

export function Hero() {
  // Hero-ul e elementul LCP al site-ului. Înainte randam DOUĂ <Image priority>
  // (desktop + mobil), ascunse alternativ din CSS — dar `priority` pune preload
  // pe amândouă, deci pe mobil se descărca degeaba și varianta de desktop, iar
  // cele două își furau banda una alteia. Aici folosim un singur <picture> cu
  // `media`: browserul alege și descarcă EXACT o imagine.
  // `getImageProps` ne dă srcset-ul optimizat de Next pentru fiecare variantă.
  const common = {
    alt: "Cărți și flori uscate pe o masă de lemn",
    fill: true,
    priority: true,
    sizes: "100vw",
  } as const;

  const desktop = getImageProps({ ...common, src: "/hero-desktop.webp" }).props;
  const mobile = getImageProps({ ...common, src: "/hero-mobile.webp" }).props;

  return (
    <section className="relative isolate flex min-h-[32rem] items-start overflow-hidden sm:min-h-[34rem] md:items-center">
      {/* Placeholder blur: apare instant ca fundal cât timp se încarcă imaginea
          reală. Elimină „gap-ul" gol dinaintea LCP-ului. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BLUR.mobile})` }}
      />
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
        <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
        {/* eslint-disable-next-line @next/next/no-img-element -- art direction: vezi comentariul de mai sus */}
        <img
          {...mobile}
          srcSet={undefined}
          alt={common.alt}
          className="absolute inset-0 h-full w-full object-cover object-bottom md:object-center"
        />
      </picture>

      {/* Voal crem pentru lizibilitatea textului (sus pe mobil, stânga pe desktop) */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream/85 via-cream/30 to-transparent md:bg-gradient-to-r md:from-cream/90 md:via-cream/45 md:to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-md md:max-w-xl">
          <p className="font-medium uppercase tracking-widest text-terracotta">
            Dostore Carti — Moldova
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Cărți și uleiuri esențiale, alese cu grijă
          </h1>
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
