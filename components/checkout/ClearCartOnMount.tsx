"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

export function ClearCartOnMount() {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
