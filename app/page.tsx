import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative flex min-h-[calc(100vh-11rem)] items-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1700906010457-c7a565935b81?auto=format&fit=crop&w=1920&h=1080&q=80"
        alt="Interiorul unei librării, cu rafturi pline de cărți"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/60 to-navy/20" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="font-medium uppercase tracking-widest text-gold">
            Librăria ta online din Moldova
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-cream sm:text-5xl">
            Cărți alese cu grijă, livrate direct la tine
          </h1>
          <p className="mt-5 text-lg text-cream/80">
            De la literatură română și universală, până la dezvoltare personală
            și cărți pentru cei mici — găsești tot ce ai nevoie, cu livrare
            rapidă oriunde în Moldova.
          </p>
          <div className="mt-8">
            <Link
              href="/carti/bestsellers"
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3.5 font-semibold text-cream shadow-lg shadow-terracotta/20 transition-colors hover:bg-terracotta-dark"
            >
              Descoperă acum
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
