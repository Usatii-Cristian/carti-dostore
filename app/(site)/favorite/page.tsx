import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export const metadata: Metadata = {
  title: "Favorite",
  description: "Cărțile tale favorite, salvate pentru mai târziu.",
};

export default function FavoritePage() {
  return <FavoritesView />;
}
