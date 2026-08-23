"use client";

import { useEffect, useRef } from "react";
import { useWatchlist } from "@/lib/watchlist-context";
import { useMarketData } from "@/lib/market-data-context";

/** Loads live data for watchlist symbols not already in market state. */
export function WatchlistSync() {
  const { watchlist } = useWatchlist();
  const { stocks, loadSymbol } = useMarketData();
  const loadingRef = useRef(new Set<string>());

  useEffect(() => {
    for (const item of watchlist) {
      const existing = stocks.find((s) => s.symbol === item.symbol);
      if (existing && existing.price > 0) continue;
      if (loadingRef.current.has(item.symbol)) continue;

      loadingRef.current.add(item.symbol);
      void loadSymbol(item.symbol, item.name, item.type).finally(() => {
        loadingRef.current.delete(item.symbol);
      });
    }
  }, [watchlist, stocks, loadSymbol]);

  return null;
}
