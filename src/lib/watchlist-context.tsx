"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { WatchlistItem } from "@/lib/types";

interface WatchlistState {
  watchlist: WatchlistItem[];
  add: (item: Omit<WatchlistItem, "addedAt">) => void;
  remove: (symbol: string) => void;
  isWatching: (symbol: string) => boolean;
}

const WatchlistContext = createContext<WatchlistState | null>(null);

const STORAGE_KEY = "tradewise-watchlist";

function loadWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WatchlistItem[]) : [];
  } catch {
    return [];
  }
}

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWatchlist(loadWatchlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist, hydrated]);

  const add = useCallback((item: Omit<WatchlistItem, "addedAt">) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.symbol === item.symbol)) return prev;
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const remove = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
  }, []);

  const isWatching = useCallback(
    (symbol: string) => watchlist.some((w) => w.symbol === symbol),
    [watchlist]
  );

  return (
    <WatchlistContext.Provider value={{ watchlist, add, remove, isWatching }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}
