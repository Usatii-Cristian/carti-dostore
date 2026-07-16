import Link from "next/link";
import Image from "next/image";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-cream" : "text-navy";
  const accentColor = variant === "light" ? "text-gold" : "text-terracotta";

  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5"
      aria-label="Dostore Carti — pagina principală"
    >
      <Image
        src="/logo-nou.png"
        alt=""
        width={44}
        height={44}
        priority
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
      <span
        className={`font-serif text-2xl font-semibold leading-none tracking-tight ${textColor}`}
      >
        Dostore <span className={accentColor}>Carti</span>
      </span>
    </Link>
  );
}
