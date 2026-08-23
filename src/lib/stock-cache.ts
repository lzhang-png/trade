import type { Stock } from "./types";

const CACHE_KEY = "tradewise-stocks-v2";
const CACHE_TTL_MS = 5 * 60_000;

interface CachePayload {
  savedAt: string;
  stocks: Stock[];
}

export function loadStockCache(): Stock[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw) as CachePayload;
    if (Date.now() - new Date(payload.savedAt).getTime() > CACHE_TTL_MS) return null;
    return payload.stocks.filter((s) => s.price > 0 && s.history.length > 0);
  } catch {
    return null;
  }
}

export function saveStockCache(stocks: Stock[]) {
  if (typeof window === "undefined") return;
  try {
    const live = stocks.filter((s) => s.price > 0 && s.history.length > 0);
    if (live.length === 0) return;
    const payload: CachePayload = { savedAt: new Date().toISOString(), stocks: live };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage full or unavailable
  }
}
