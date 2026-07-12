import Link from "next/link";
import { Truck, Phone, Clock } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-navy-dark text-cream/90 text-xs sm:text-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <p className="flex items-center gap-1.5 font-medium">
          <Truck className="h-4 w-4 text-gold" aria-hidden="true" />
          <span>Livrare gratuită la comenzi peste 199 lei</span>
        </p>

        <div className="hidden items-center gap-5 sm:flex">
          <a href="tel:+37322000000" className="flex items-center gap-1.5 hover:text-gold">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span>+373 22 000 000</span>
          </a>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Luni–Vineri, 09:00–18:00</span>
          </span>
          <Link href="/contact" className="hover:text-gold">
            Contact
          </Link>
          <Link href="/despre-noi" className="hover:text-gold">
            Despre noi
          </Link>
        </div>
      </div>
    </div>
  );
}
