import type { Sector, Stock } from "./types";
import {
  fetchFinnhubCandles,
  fetchFinnhubMetrics,
  fetchFinnhubProfile,
  fetchFinnhubQuote,
} from "./finnhub-client";
import { fetchYahooChart } from "./yahoo-finance";

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

export type MarketDataError =
  | "missing_key"
  | "invalid_key"
  | "fetch_failed"
  | "partial";

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

function formatMarketCap(value: number | undefined): string {
  if (!value) return "—";
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
  return value.toLocaleString();
}

async function fetchFundamentals(symbol: string, apiKey: string) {
  const [profile, metrics] = await Promise.all([
    fetchFinnhubProfile(symbol, apiKey),
    fetchFinnhubMetrics(symbol, apiKey),
  ]);

  let marketCap = "—";
  let peRatio: number | null = null;
  let dividendYield: number | null = null;

  if (profile?.marketCapitalization) {
    marketCap = formatMarketCap(profile.marketCapitalization * 1_000_000);
  }
  if (metrics?.metric?.peBasicExclExtraTTM) {
    peRatio = +metrics.metric.peBasicExclExtraTTM.toFixed(1);
  }
  if (metrics?.metric?.dividendYieldIndicatedAnnual != null) {
    dividendYield = +metrics.metric.dividendYieldIndicatedAnnual.toFixed(2);
  }

  return { marketCap, peRatio, dividendYield, name: profile?.name };
}

interface ChartSlice {
  price: number;
  change: number;
  changePercent: number;
  history: Stock["history"];
  name?: string;
}

async function fetchChartData(
  symbol: string,
  apiKey?: string
): Promise<ChartSlice | null> {
  if (apiKey) {
    const finnhub = await fetchFinnhubCandles(symbol, apiKey);
    if (finnhub) return finnhub;
  }

  const yahoo = await fetchYahooChart(symbol);
  if (!yahoo) return null;

  return {
    price: yahoo.price,
    change: yahoo.change,
    changePercent: yahoo.changePercent,
    history: yahoo.history,
    name: yahoo.name,
  };
}

async function fetchSymbolStock(
  def: (typeof STOCK_UNIVERSE)[0],
  apiKey?: string
): Promise<Stock> {
  const [chart, quote, fundamentals] = await Promise.all([
    fetchChartData(def.symbol, apiKey),
    apiKey ? fetchFinnhubQuote(def.symbol, apiKey) : Promise.resolve(null),
    apiKey ? fetchFundamentals(def.symbol, apiKey) : Promise.resolve(null),
  ]);

  if (!chart) return emptyStock(def);

  const price = quote?.c ?? chart.price;
  const change = quote ? +(quote.d ?? 0).toFixed(2) : chart.change;
  const changePercent = quote ? +(quote.dp ?? 0).toFixed(2) : chart.changePercent;

  return {
    symbol: def.symbol,
    name: fundamentals?.name ?? chart.name ?? def.name,
    sector: def.sector,
    price,
    change,
    changePercent,
    marketCap: fundamentals?.marketCap ?? "—",
    peRatio: fundamentals?.peRatio ?? null,
    dividendYield: fundamentals?.dividendYield ?? null,
    history: chart.history,
  };
}

export function marketDataErrorMessage(
  code: MarketDataError,
  failedSymbols: string[]
): string {
  switch (code) {
    case "missing_key":
      return "Finnhub API key is required. Add FINNHUB_API_KEY to GitHub Secrets and redeploy.";
    case "invalid_key":
      return "Finnhub API key is invalid. Check the FINNHUB_API_KEY secret in GitHub and redeploy.";
    case "partial":
      return `Partial load — failed: ${failedSymbols.join(", ")}`;
    default:
      return "Could not load market data. Check your connection and tap refresh.";
  }
}

/** Fetch real market data for the full universe (Finnhub + Yahoo proxy fallback). */
export async function fetchLiveStocks(
  apiKey?: string,
  onProgress?: (stock: Stock) => void
): Promise<{
  stocks: Stock[];
  live: boolean;
  updatedAt: string | null;
  failedSymbols: string[];
  errorCode: MarketDataError | null;
}> {
  const key = apiKey ?? getFinnhubApiKey();

  if (!key) {
    return {
      stocks: STOCK_UNIVERSE.map(emptyStock),
      live: false,
      updatedAt: null,
      failedSymbols: STOCK_UNIVERSE.map((s) => s.symbol),
      errorCode: "missing_key",
    };
  }

  const probe = await fetchFinnhubQuote("AAPL", key);
  if (!probe) {
    return {
      stocks: STOCK_UNIVERSE.map(emptyStock),
      live: false,
      updatedAt: null,
      failedSymbols: STOCK_UNIVERSE.map((s) => s.symbol),
      errorCode: "invalid_key",
    };
  }

  const results: Stock[] = [];
  const failedSymbols: string[] = [];

  for (const def of STOCK_UNIVERSE) {
    const stock = await fetchSymbolStock(def, key);
    if (stock.price > 0 && stock.history.length > 0) {
      results.push(stock);
      onProgress?.(stock);
    } else {
      failedSymbols.push(def.symbol);
      results.push(emptyStock(def));
    }
    // Stay under Finnhub free-tier rate limits (~60/min).
    await new Promise((r) => setTimeout(r, 1100));
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
    errorCode:
      liveCount === 0 ? "fetch_failed" : failedSymbols.length > 0 ? "partial" : null,
  };
}
