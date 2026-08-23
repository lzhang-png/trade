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
  isFinnhubConfigured,
} from "@/lib/market-data";
import type { Stock } from "@/lib/types";

interface MarketDataState {
  stocks: Stock[];
  live: boolean;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
  refresh: () => Promise<void>;
  getStock: (symbol: string) => Stock | undefined;
}

const MarketDataContext = createContext<MarketDataState | null>(null);

const REFRESH_MS = 60_000; // Finnhub free tier — refresh once per minute

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>(() => getAllStocks());
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(isFinnhubConfigured());
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isFinnhubConfigured()) {
      setStocks(getAllStocks());
      setLive(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchLiveStocks();
      setStocks(result.stocks);
      setLive(result.live);
      setUpdatedAt(result.updatedAt);
      if (!result.live) {
        setError("Could not reach Finnhub — showing demo data");
      }
    } catch {
      setError("Failed to load live quotes");
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (!isFinnhubConfigured()) return;

    const id = setInterval(() => {
      void refresh();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const getStockBySymbol = useCallback(
    (symbol: string) => stocks.find((s) => s.symbol === symbol),
    [stocks]
  );

  return (
    <MarketDataContext.Provider
      value={{
        stocks,
        live,
        loading,
        error,
        updatedAt,
        refresh,
        getStock: getStockBySymbol,
      }}
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
