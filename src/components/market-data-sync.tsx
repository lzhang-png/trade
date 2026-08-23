"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/app-context";
import { useMarketData } from "@/lib/market-data-context";

/** Loads live data for portfolio and watchlist symbols outside the default universe. */
export function MarketDataSync() {
  const { portfolio, watchlist } = useApp();
  const { ensureSymbols } = useMarketData();

  useEffect(() => {
    const symbols = [
      ...portfolio.map((p) => p.symbol),
      ...watchlist.map((w) => w.symbol),
    ];
    void ensureSymbols(symbols);
  }, [portfolio, watchlist, ensureSymbols]);

  return null;
}
