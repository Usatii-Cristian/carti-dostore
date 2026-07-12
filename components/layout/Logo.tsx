import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-cream" : "text-navy";
  const iconColor = variant === "light" ? "text-gold" : "text-terracotta";

  return (
    <Link
      href="/"
      className="flex items-center gap-2 shrink-0"
      aria-label="BookStore — pagina principală"
    >
      <BookOpen className={`h-7 w-7 ${iconColor}`} aria-hidden="true" />
      <span className={`font-serif text-2xl font-semibold tracking-tight ${textColor}`}>
        BookStore
      </span>
    </Link>
  );
}
