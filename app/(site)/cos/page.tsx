import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Coșul tău",
  description: "Vezi cărțile din coșul tău de cumpărături pe Dostore Carti.",
  robots: { index: false, follow: true },
};

export default function CosPage() {
  return <CartView />;
}
