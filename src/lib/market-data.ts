import type { Stock } from "./types";
import {
  fetchFinnhubExtras,
  fetchFinnhubNews,
  fetchFinnhubQuote,
  fetchFinnhubRecommendation,
} from "./finnhub-client";
import { STOCK_UNIVERSE } from "./stock-universe";
import { saveStockCache } from "./stock-cache";
import { fetchYahooChart } from "./yahoo-finance";

export { STOCK_UNIVERSE, UNIVERSE_CRITERIA } from "./stock-universe";

export type MarketDataError =
  | "missing_key"
  | "invalid_key"
  | "fetch_failed"
  | "partial";

const CORE_BATCH_SIZE = 6;
const CORE_BATCH_DELAY_MS = 700;
/** ~4 Finnhub calls per enrich × 1 stock every 4s ≈ 60 calls/min */
const ENRICH_DELAY_MS = 4000;

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
    week52High: null,
    week52Low: null,
    beta: null,
    revenueGrowth: null,
    epsGrowth: null,
    roe: null,
    history: [],
    news: [],
    analystTrend: null,
    detailsLoaded: false,
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

function getFinnhubApiKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_FINNHUB_API_KEY ||
    process.env.FINNHUB_API_KEY ||
    undefined
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Fast path: live quote + price history only (2 network calls, 1 Finnhub). */
async function fetchSymbolCore(
  def: (typeof STOCK_UNIVERSE)[0],
  apiKey: string
): Promise<Stock | null> {
  const [quote, chart] = await Promise.all([
    fetchFinnhubQuote(def.symbol, apiKey),
    fetchYahooChart(def.symbol),
  ]);

  if (!chart && !quote) return null;

  const history = chart?.history ?? [];
  const price = quote?.c ?? chart?.price ?? 0;
  if (price <= 0 || history.length < 2) return null;

  const change = quote ? +(quote.d ?? 0).toFixed(2) : (chart?.change ?? 0);
  const changePercent = quote ? +(quote.dp ?? 0).toFixed(2) : (chart?.changePercent ?? 0);

  return {
    ...emptyStock(def),
    name: chart?.name ?? def.name,
    price,
    change,
    changePercent,
    history,
    detailsLoaded: false,
  };
}

/** Slower path: fundamentals, news, analyst trends (runs in background). */
async function enrichStock(stock: Stock, apiKey: string): Promise<Stock> {
  const isEtf = stock.sector === "ETF";
  const [extras, news, analystTrend] = await Promise.all([
    fetchFinnhubExtras(stock.symbol, apiKey),
    fetchFinnhubNews(stock.symbol, apiKey),
    isEtf ? Promise.resolve(null) : fetchFinnhubRecommendation(stock.symbol, apiKey),
  ]);

  return {
    ...stock,
    name: extras.name ?? stock.name,
    industry: extras.industry,
    website: extras.website,
    marketCap: extras.marketCap,
    peRatio: extras.peRatio,
    dividendYield: extras.dividendYield,
    week52High: extras.week52High,
    week52Low: extras.week52Low,
    beta: extras.beta,
    revenueGrowth: extras.revenueGrowth,
    epsGrowth: extras.epsGrowth,
    roe: extras.roe,
    news,
    analystTrend,
    detailsLoaded: true,
  };
}

async function enrichQueue(
  stocks: Stock[],
  apiKey: string,
  onEnrich?: (stock: Stock) => void
) {
  for (const stock of stocks) {
    if (stock.price <= 0) continue;
    try {
      const enriched = await enrichStock(stock, apiKey);
      onEnrich?.(enriched);
    } catch {
      onEnrich?.({ ...stock, detailsLoaded: true });
    }
    await sleep(ENRICH_DELAY_MS);
  }
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

export interface FetchLiveStocksCallbacks {
  onProgress?: (stock: Stock) => void;
  onEnrich?: (stock: Stock) => void;
}

/** Phase 1: prices + charts in parallel batches. Phase 2: enrich in background. */
export async function fetchLiveStocks(
  apiKey?: string,
  callbacks?: FetchLiveStocksCallbacks
): Promise<{
  stocks: Stock[];
  live: boolean;
  updatedAt: string | null;
  failedSymbols: string[];
  errorCode: MarketDataError | null;
}> {
  const key = apiKey ?? getFinnhubApiKey();
  const { onProgress, onEnrich } = callbacks ?? {};

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
  const liveStocks: Stock[] = [];

  for (let i = 0; i < STOCK_UNIVERSE.length; i += CORE_BATCH_SIZE) {
    const batch = STOCK_UNIVERSE.slice(i, i + CORE_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (def) => {
        const stock = await fetchSymbolCore(def, key);
        if (stock) {
          onProgress?.(stock);
          liveStocks.push(stock);
          return stock;
        }
        failedSymbols.push(def.symbol);
        return emptyStock(def);
      })
    );
    results.push(...batchResults);
    saveStockCache(liveStocks);

    if (i + CORE_BATCH_SIZE < STOCK_UNIVERSE.length) {
      await sleep(CORE_BATCH_DELAY_MS);
    }
  }

  const liveCount = liveStocks.length;

  if (liveCount > 0) {
    setCachedStocks(results.filter((s) => s.price > 0));
    void enrichQueue(liveStocks, key, onEnrich);
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
