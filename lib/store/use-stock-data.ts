"use client";

import { useEffect, useState } from "react";

export type StockData = {
  [bookId: string]: {
    inStock: boolean;
    stock: number;
    variants: Record<string, number>;
  };
};

export function useStockData(): StockData | null {
  const [data, setData] = useState<StockData | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/stock")
      .then((res) => (res.ok ? res.json() : null))
      .then((res: { stockData?: StockData } | null) => {
        if (cancelled || !res?.stockData) return;
        setData(res.stockData);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
