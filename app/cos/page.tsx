import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Coșul tău — BookStore",
  description: "Vezi cărțile din coșul tău de cumpărături pe BookStore.",
};

export default function CosPage() {
  return <CartView />;
}
