import { fetchJson } from "./cors-fetch";
import type { AnalystTrend, PriceBar, StockNews } from "./types";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
}

export interface FinnhubProfile {
  name?: string;
  marketCapitalization?: number;
  finnhubIndustry?: string;
  weburl?: string;
  exchange?: string;
  ipo?: string;
  logo?: string;
}

export interface FinnhubMetrics {
  metric?: Record<string, number | undefined> & {
    peBasicExclExtraTTM?: number;
    dividendYieldIndicatedAnnual?: number;
    beta?: number;
    "52WeekHigh"?: number;
    "52WeekLow"?: number;
    revenueGrowth3Y?: number;
    epsGrowth3Y?: number;
    roeTTM?: number;
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

interface FinnhubNewsItem {
  headline: string;
  source: string;
  datetime: number;
  url: string;
  summary?: string;
}

interface FinnhubRecommendationResponse {
  recommendation?: AnalystTrend[];
  error?: string;
}

export interface FinnhubChartData {
  price: number;
  change: number;
  changePercent: number;
  history: PriceBar[];
}

export interface FinnhubExtras {
  marketCap: string;
  peRatio: number | null;
  dividendYield: number | null;
  name?: string;
  industry?: string;
  website?: string;
  week52High: number | null;
  week52Low: number | null;
  beta: number | null;
  revenueGrowth: number | null;
  epsGrowth: number | null;
  roe: number | null;
}

function finnhubUrl(path: string, apiKey: string): string {
  return `${FINNHUB_BASE}${path}${path.includes("?") ? "&" : "?"}token=${apiKey}`;
}

function formatMarketCap(value: number | undefined): string {
  if (!value) return "—";
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
  return value.toLocaleString();
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

export async function fetchFinnhubNews(
  symbol: string,
  apiKey: string,
  days = 14
): Promise<StockNews[]> {
  const to = new Date();
  const from = new Date(Date.now() - days * 86_400_000);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const data = await fetchJson<FinnhubNewsItem[]>(
    finnhubUrl(
      `/company-news?symbol=${encodeURIComponent(symbol)}&from=${fmt(from)}&to=${fmt(to)}`,
      apiKey
    ),
    true
  );
  if (!Array.isArray(data)) return [];
  return data.slice(0, 5).map((item) => ({
    headline: item.headline,
    source: item.source,
    datetime: item.datetime,
    url: item.url,
    summary: item.summary,
  }));
}

export async function fetchFinnhubRecommendation(
  symbol: string,
  apiKey: string
): Promise<AnalystTrend | null> {
  const data = await fetchJson<FinnhubRecommendationResponse>(
    finnhubUrl(`/stock/recommendation?symbol=${encodeURIComponent(symbol)}`, apiKey),
    true
  );
  if (!data?.recommendation?.length) return null;
  return data.recommendation[data.recommendation.length - 1];
}

export async function fetchFinnhubExtras(
  symbol: string,
  apiKey: string
): Promise<FinnhubExtras> {
  const [profile, metrics] = await Promise.all([
    fetchFinnhubProfile(symbol, apiKey),
    fetchFinnhubMetrics(symbol, apiKey),
  ]);

  const m = metrics?.metric;

  return {
    marketCap: formatMarketCap(profile?.marketCapitalization
      ? profile.marketCapitalization * 1_000_000
      : undefined),
    peRatio: m?.peBasicExclExtraTTM ? +m.peBasicExclExtraTTM.toFixed(1) : null,
    dividendYield:
      m?.dividendYieldIndicatedAnnual != null
        ? +m.dividendYieldIndicatedAnnual.toFixed(2)
        : null,
    name: profile?.name,
    industry: profile?.finnhubIndustry,
    website: profile?.weburl,
    week52High: m?.["52WeekHigh"] ?? null,
    week52Low: m?.["52WeekLow"] ?? null,
    beta: m?.beta != null ? +m.beta.toFixed(2) : null,
    revenueGrowth: m?.revenueGrowth3Y != null ? +m.revenueGrowth3Y.toFixed(1) : null,
    epsGrowth: m?.epsGrowth3Y != null ? +m.epsGrowth3Y.toFixed(1) : null,
    roe: m?.roeTTM != null ? +m.roeTTM.toFixed(1) : null,
  };
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
