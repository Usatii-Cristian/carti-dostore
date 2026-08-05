import Link from "next/link";
import Image from "next/image";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-cream" : "text-navy";
  const accentColor = variant === "light" ? "text-gold" : "text-terracotta";

  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2 sm:gap-2.5"
      aria-label="Dostore Carti — pagina principală"
    >
      {/* Fără `priority`: logo-ul e mic (6KB) și nu trebuie să fure slotul de
          preload al imaginii LCP (hero-ul). */}
      <Image
        src="/logo-nou.png"
        alt=""
        width={56}
        height={56}
        // Mai mic pe telefon: acolo bara rămâne lipită la scroll și trebuie să
        // încapă pe UN rând (logo + meniu + coș), nu pe două.
        className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
      />
      <span
        className={`font-serif text-xl font-semibold leading-none tracking-tight sm:text-2xl ${textColor}`}
      >
        Dostore <span className={accentColor}>Cărți</span>
      </span>
    </Link>
  );
}
