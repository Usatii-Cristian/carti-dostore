import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Finalizează comanda — BookStore",
  description: "Completează datele de livrare și plătește în siguranță prin maib.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
