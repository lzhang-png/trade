import { fetchJson } from "./cors-fetch";
import type { PriceBar } from "./types";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
}

export interface FinnhubProfile {
  name?: string;
  marketCapitalization?: number;
}

export interface FinnhubMetrics {
  metric?: {
    peBasicExclExtraTTM?: number;
    dividendYieldIndicatedAnnual?: number;
  };
}

interface FinnhubCandleResponse {
  s: string;
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
  error?: string;
}

export interface FinnhubChartData {
  price: number;
  change: number;
  changePercent: number;
  history: PriceBar[];
}

function finnhubUrl(path: string, apiKey: string): string {
  return `${FINNHUB_BASE}${path}${path.includes("?") ? "&" : "?"}token=${apiKey}`;
}

export async function fetchFinnhubQuote(
  symbol: string,
  apiKey: string
): Promise<FinnhubQuote | null> {
  const data = await fetchJson<FinnhubQuote & { error?: string }>(
    finnhubUrl(`/quote?symbol=${encodeURIComponent(symbol)}`, apiKey),
    true
  );
  if (!data || data.error || !data.c) return null;
  return data;
}

export async function fetchFinnhubProfile(
  symbol: string,
  apiKey: string
): Promise<FinnhubProfile | null> {
  return fetchJson<FinnhubProfile>(
    finnhubUrl(`/stock/profile2?symbol=${encodeURIComponent(symbol)}`, apiKey),
    true
  );
}

export async function fetchFinnhubMetrics(
  symbol: string,
  apiKey: string
): Promise<FinnhubMetrics | null> {
  return fetchJson<FinnhubMetrics>(
    finnhubUrl(`/stock/metric?symbol=${symbol}&metric=all`, apiKey),
    true
  );
}

export async function fetchFinnhubCandles(
  symbol: string,
  apiKey: string
): Promise<FinnhubChartData | null> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 365 * 24 * 60 * 60;
  const data = await fetchJson<FinnhubCandleResponse>(
    finnhubUrl(
      `/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}`,
      apiKey
    ),
    true
  );

  if (!data || data.error || data.s !== "ok" || !data.t?.length) return null;

  const history: PriceBar[] = [];
  for (let i = 0; i < data.t.length; i++) {
    const close = data.c?.[i];
    if (close == null) continue;
    history.push({
      date: new Date(data.t[i] * 1000).toISOString().split("T")[0],
      open: +(data.o?.[i] ?? close).toFixed(2),
      high: +(data.h?.[i] ?? close).toFixed(2),
      low: +(data.l?.[i] ?? close).toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(data.v?.[i] ?? 0),
    });
  }

  if (history.length < 2) return null;

  const price = history[history.length - 1].close;
  const prevClose = history[history.length - 2].close;
  const change = price - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    price: +price.toFixed(2),
    change: +change.toFixed(2),
    changePercent: +changePercent.toFixed(2),
    history,
  };
}
