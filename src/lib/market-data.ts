import type { Sector, Stock } from "./types";
import { fetchYahooChart, fetchYahooCharts } from "./yahoo-finance";

/** Static universe — sector labels only; all prices come from live APIs. */
export const STOCK_UNIVERSE: Array<{ symbol: string; name: string; sector: Sector }> = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer" },
  { symbol: "META", name: "Meta Platforms", sector: "Technology" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Finance" },
  { symbol: "V", name: "Visa Inc.", sector: "Finance" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrial" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "ETF" },
  { symbol: "IWM", name: "iShares Russell 2000", sector: "ETF" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology" },
  { symbol: "LLY", name: "Eli Lilly & Co.", sector: "Healthcare" },
];

function emptyStock(def: (typeof STOCK_UNIVERSE)[0]): Stock {
  return {
    symbol: def.symbol,
    name: def.name,
    sector: def.sector,
    price: 0,
    change: 0,
    changePercent: 0,
    marketCap: "—",
    peRatio: null,
    dividendYield: null,
    history: [],
  };
}

let cachedStocks: Stock[] | null = null;

/** Placeholder list before live data loads (no simulated prices). */
export function getAllStocks(): Stock[] {
  if (!cachedStocks) {
    cachedStocks = STOCK_UNIVERSE.map(emptyStock);
  }
  return cachedStocks;
}

export function setCachedStocks(stocks: Stock[]) {
  cachedStocks = stocks;
}

export function getStock(symbol: string): Stock | undefined {
  return getAllStocks().find((s) => s.symbol === symbol);
}

export function searchStocks(query: string): Stock[] {
  const q = query.toLowerCase();
  return getAllStocks().filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );
}

export function getFinnhubApiKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_FINNHUB_API_KEY ||
    process.env.FINNHUB_API_KEY ||
    undefined
  );
}

export function isFinnhubConfigured(): boolean {
  return Boolean(getFinnhubApiKey());
}

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

function formatMarketCap(value: number | undefined): string {
  if (!value) return "—";
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
  return value.toLocaleString();
}

async function fetchFinnhubExtras(
  symbol: string,
  apiKey: string
): Promise<{ marketCap: string; peRatio: number | null; dividendYield: number | null }> {
  try {
    const [profileRes, metricRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`),
    ]);

    let marketCap = "—";
    let peRatio: number | null = null;
    let dividendYield: number | null = null;

    if (profileRes.ok) {
      const profile = (await profileRes.json()) as FinnhubProfile;
      if (profile.marketCapitalization) {
        marketCap = formatMarketCap(profile.marketCapitalization * 1_000_000);
      }
    }

    if (metricRes.ok) {
      const metrics = (await metricRes.json()) as FinnhubMetrics;
      if (metrics.metric?.peBasicExclExtraTTM) {
        peRatio = +metrics.metric.peBasicExclExtraTTM.toFixed(1);
      }
      if (metrics.metric?.dividendYieldIndicatedAnnual != null) {
        dividendYield = +metrics.metric.dividendYieldIndicatedAnnual.toFixed(2);
      }
    }

    return { marketCap, peRatio, dividendYield };
  } catch {
    return { marketCap: "—", peRatio: null, dividendYield: null };
  }
}

async function fetchFinnhubQuote(symbol: string, apiKey: string): Promise<FinnhubQuote | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as FinnhubQuote & { error?: string };
    if (data.error || !data.c) return null;
    return data;
  } catch {
    return null;
  }
}

function mergeYahooIntoStock(
  def: (typeof STOCK_UNIVERSE)[0],
  yahoo: Awaited<ReturnType<typeof fetchYahooChart>>,
  extras?: { marketCap: string; peRatio: number | null; dividendYield: number | null }
): Stock {
  if (!yahoo) return emptyStock(def);

  return {
    symbol: def.symbol,
    name: yahoo.name || def.name,
    sector: def.sector,
    price: yahoo.price,
    change: yahoo.change,
    changePercent: yahoo.changePercent,
    marketCap: extras?.marketCap ?? "—",
    peRatio: extras?.peRatio ?? null,
    dividendYield: extras?.dividendYield ?? null,
    history: yahoo.history,
  };
}

/** Fetch real market data for the full universe from Yahoo Finance (+ optional Finnhub extras). */
export async function fetchLiveStocks(apiKey?: string): Promise<{
  stocks: Stock[];
  live: boolean;
  updatedAt: string | null;
  failedSymbols: string[];
}> {
  const key = apiKey ?? getFinnhubApiKey();
  const symbols = STOCK_UNIVERSE.map((s) => s.symbol);
  const yahooData = await fetchYahooCharts(symbols);

  const results: Stock[] = [];
  const failedSymbols: string[] = [];

  for (const def of STOCK_UNIVERSE) {
    const chart = yahooData.get(def.symbol);
    if (!chart) {
      failedSymbols.push(def.symbol);
      results.push(emptyStock(def));
      continue;
    }

    let stock = mergeYahooIntoStock(def, chart);

    if (key) {
      const [quote, extras] = await Promise.all([
        fetchFinnhubQuote(def.symbol, key),
        fetchFinnhubExtras(def.symbol, key),
      ]);
      if (quote) {
        stock = {
          ...stock,
          price: quote.c,
          change: +(quote.d ?? 0).toFixed(2),
          changePercent: +(quote.dp ?? 0).toFixed(2),
        };
      }
      stock = {
        ...stock,
        marketCap: extras.marketCap,
        peRatio: extras.peRatio,
        dividendYield: extras.dividendYield,
      };
      await new Promise((r) => setTimeout(r, 50));
    }

    results.push(stock);
  }

  const liveCount = results.filter((s) => s.history.length > 0 && s.price > 0).length;

  if (liveCount > 0) {
    setCachedStocks(results);
  }

  return {
    stocks: results,
    live: liveCount > 0,
    updatedAt: liveCount > 0 ? new Date().toISOString() : null,
    failedSymbols,
  };
}

/** Fetch a single symbol (e.g. custom portfolio ticker). */
export async function fetchRealStock(symbol: string): Promise<Stock | null> {
  const def = STOCK_UNIVERSE.find((s) => s.symbol === symbol);
  const chart = await fetchYahooChart(symbol);
  if (!chart) return null;

  const base = def ?? {
    symbol: chart.symbol,
    name: chart.name,
    sector: "Technology" as Sector,
  };

  const key = getFinnhubApiKey();
  const extras = key ? await fetchFinnhubExtras(symbol, key) : undefined;
  return mergeYahooIntoStock(base, chart, extras);
}
