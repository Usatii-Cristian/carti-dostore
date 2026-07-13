"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";

export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useFavoritesStore.persist.rehydrate();
  }, []);

  return null;
}
