"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  fetchLiveStocks,
  getAllStocks,
  marketDataErrorMessage,
} from "@/lib/market-data";
import type { Stock } from "@/lib/types";

interface MarketDataState {
  stocks: Stock[];
  live: boolean;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
  refresh: () => Promise<void>;
}

const MarketDataContext = createContext<MarketDataState | null>(null);

const REFRESH_MS = 5 * 60_000;

function mergeStocks(existing: Stock[], incoming: Stock[]): Stock[] {
  const map = new Map(existing.map((s) => [s.symbol, s]));
  for (const stock of incoming) {
    map.set(stock.symbol, stock);
  }
  return Array.from(map.values());
}

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>(() => getAllStocks());
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLiveStocks(undefined, (stock) => {
        setStocks((prev) => mergeStocks(prev, [stock]));
        setLive(true);
        setUpdatedAt(new Date().toISOString());
      });

      setLive(result.live);
      setUpdatedAt(result.updatedAt);

      if (!result.live) {
        setError(
          marketDataErrorMessage(result.errorCode ?? "fetch_failed", result.failedSymbols)
        );
      } else if (result.failedSymbols.length > 0) {
        setError(marketDataErrorMessage("partial", result.failedSymbols));
      }
    } catch {
      setError("Failed to load market data");
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <MarketDataContext.Provider
      value={{ stocks, live, loading, error, updatedAt, refresh }}
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
