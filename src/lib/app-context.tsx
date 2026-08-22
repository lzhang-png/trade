"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { PortfolioPosition, RiskProfile, WatchlistItem } from "@/lib/types";

const DEFAULT_RISK: RiskProfile = {
  tolerance: "moderate",
  maxPositionSize: 10,
  preferredHorizon: "mid",
  sectors: ["Technology", "Healthcare", "Finance"],
  maxDrawdown: 15,
};

interface AppState {
  portfolio: PortfolioPosition[];
  watchlist: WatchlistItem[];
  riskProfile: RiskProfile;
  addPosition: (position: Omit<PortfolioPosition, "id">) => void;
  removePosition: (id: string) => void;
  addToWatchlist: (item: Omit<WatchlistItem, "addedAt">) => void;
  removeFromWatchlist: (symbol: string) => void;
  updateRiskProfile: (profile: Partial<RiskProfile>) => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = "tradewise-state";

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(DEFAULT_RISK);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setPortfolio(saved.portfolio ?? []);
      setWatchlist(saved.watchlist ?? []);
      setRiskProfile(saved.riskProfile ?? DEFAULT_RISK);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ portfolio, watchlist, riskProfile })
    );
  }, [portfolio, watchlist, riskProfile, hydrated]);

  const addPosition = useCallback((position: Omit<PortfolioPosition, "id">) => {
    setPortfolio((prev) => [
      ...prev,
      { ...position, id: `${position.symbol}-${Date.now()}` },
    ]);
  }, []);

  const removePosition = useCallback((id: string) => {
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, "addedAt">) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.symbol === item.symbol)) return prev;
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
  }, []);

  const updateRiskProfile = useCallback((profile: Partial<RiskProfile>) => {
    setRiskProfile((prev) => ({ ...prev, ...profile }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        portfolio,
        watchlist,
        riskProfile,
        addPosition,
        removePosition,
        addToWatchlist,
        removeFromWatchlist,
        updateRiskProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
