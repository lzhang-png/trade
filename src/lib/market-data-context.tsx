"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  fetchLiveStocks,
  getAllStocks,
  marketDataErrorMessage,
} from "@/lib/market-data";
import { loadStockCache, saveStockCache } from "@/lib/stock-cache";
import type { Stock } from "@/lib/types";

interface MarketDataState {
  stocks: Stock[];
  live: boolean;
  loading: boolean;
  enriching: boolean;
  error: string | null;
  updatedAt: string | null;
  refresh: () => Promise<void>;
}

const MarketDataContext = createContext<MarketDataState | null>(null);

const REFRESH_MS = 5 * 60_000;

function mergeStocks(existing: Stock[], incoming: Stock[]): Stock[] {
  const map = new Map(existing.map((s) => [s.symbol, s]));
  for (const stock of incoming) {
    const prev = map.get(stock.symbol);
    map.set(stock.symbol, prev ? { ...prev, ...stock } : stock);
  }
  return Array.from(map.values());
}

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const cached = loadStockCache();
  const [stocks, setStocks] = useState<Stock[]>(() =>
    cached?.length ? mergeStocks(getAllStocks(), cached) : getAllStocks()
  );
  const [live, setLive] = useState(() => Boolean(cached?.length));
  const [loading, setLoading] = useState(() => !cached?.length);
  const [enriching, setEnriching] = useState(
    () => Boolean(cached?.some((s) => s.price > 0 && !s.detailsLoaded))
  );
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(() =>
    cached?.length ? new Date().toISOString() : null
  );
  const hasLiveRef = useRef(Boolean(cached?.length));

  const refresh = useCallback(async () => {
    if (!hasLiveRef.current) setLoading(true);
    setEnriching(true);
    setError(null);

    try {
      const result = await fetchLiveStocks(undefined, {
        onProgress: (stock) => {
          hasLiveRef.current = true;
          setStocks((prev) => mergeStocks(prev, [stock]));
          setLive(true);
          setUpdatedAt(new Date().toISOString());
          setLoading(false);
        },
        onEnrich: (stock) => {
          setStocks((prev) => {
            const merged = mergeStocks(prev, [stock]);
            saveStockCache(merged);
            return merged;
          });
        },
      });

      setLive(result.live);
      setUpdatedAt(result.updatedAt);
      setLoading(false);

      if (!result.live) {
        setError(
          marketDataErrorMessage(result.errorCode ?? "fetch_failed", result.failedSymbols)
        );
        setEnriching(false);
      } else if (result.failedSymbols.length > 0) {
        setError(marketDataErrorMessage("partial", result.failedSymbols));
      }
    } catch {
      setError("Failed to load market data");
      setLive(false);
      setLoading(false);
      setEnriching(false);
    }
  }, []);

  useEffect(() => {
    const pending = stocks.filter((s) => s.price > 0 && !s.detailsLoaded);
    if (pending.length === 0 && stocks.some((s) => s.price > 0)) {
      setEnriching(false);
    }
  }, [stocks]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <MarketDataContext.Provider
      value={{ stocks, live, loading, enriching, error, updatedAt, refresh }}
    >
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const ctx = useContext(MarketDataContext);
  if (!ctx) throw new Error("useMarketData must be used within MarketDataProvider");
  return ctx;
}
