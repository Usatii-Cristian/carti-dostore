import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Finalizează comanda",
  description: "Completează datele de livrare și plătește în siguranță prin maib.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
