import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[32rem] items-start overflow-hidden sm:min-h-[34rem] md:items-center">
      {/* Imagine desktop (spațiu liber în stânga) */}
      <Image
        src="/hero-desktop.webp"
        alt="Cărți și flori uscate pe o masă de lemn"
        fill
        priority
        sizes="100vw"
        className="hidden object-cover md:block"
      />
      {/* Imagine mobil (spațiu liber sus) */}
      <Image
        src="/hero-mobile.webp"
        alt="Cărți și flori uscate pe o masă de lemn"
        fill
        priority
        sizes="100vw"
        className="object-cover object-bottom md:hidden"
      />

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

          {/* Citat-semnătură: stă sub CTA ca să nu-i fure atenția */}
          <blockquote className="mt-10 border-l-2 border-terracotta/60 pl-5">
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
