import type { Sector, Stock } from "./types";
import {
  fetchFinnhubCandles,
  fetchFinnhubExtras,
  fetchFinnhubNews,
  fetchFinnhubQuote,
  fetchFinnhubRecommendation,
} from "./finnhub-client";
import { fetchYahooChart } from "./yahoo-finance";

/** Static universe — sector labels only; all prices come from live APIs. */
export const STOCK_UNIVERSE: Array<{ symbol: string; name: string; sector: Sector }> = [
  // Technology
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms", sector: "Technology" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology" },
  { symbol: "INTC", name: "Intel Corp.", sector: "Technology" },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corp.", sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Technology" },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology" },
  { symbol: "PLTR", name: "Palantir Technologies", sector: "Technology" },
  { symbol: "NOW", name: "ServiceNow Inc.", sector: "Technology" },
  { symbol: "IBM", name: "IBM Corp.", sector: "Technology" },
  // Consumer
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer" },
  { symbol: "COST", name: "Costco Wholesale", sector: "Consumer" },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer" },
  { symbol: "HD", name: "Home Depot Inc.", sector: "Consumer" },
  { symbol: "DIS", name: "Walt Disney Co.", sector: "Consumer" },
  { symbol: "NKE", name: "Nike Inc.", sector: "Consumer" },
  { symbol: "UBER", name: "Uber Technologies", sector: "Consumer" },
  { symbol: "ABNB", name: "Airbnb Inc.", sector: "Consumer" },
  { symbol: "PYPL", name: "PayPal Holdings", sector: "Consumer" },
  // Finance
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Finance" },
  { symbol: "V", name: "Visa Inc.", sector: "Finance" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Finance" },
  { symbol: "BAC", name: "Bank of America", sector: "Finance" },
  { symbol: "GS", name: "Goldman Sachs", sector: "Finance" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Finance" },
  // Healthcare
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "LLY", name: "Eli Lilly & Co.", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co.", sector: "Healthcare" },
  // Energy & Industrial
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy" },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrial" },
  { symbol: "BA", name: "Boeing Co.", sector: "Industrial" },
  { symbol: "GE", name: "GE Aerospace", sector: "Industrial" },
  // ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "ETF" },
  { symbol: "IWM", name: "iShares Russell 2000", sector: "ETF" },
  { symbol: "VTI", name: "Vanguard Total Stock Market", sector: "ETF" },
  { symbol: "XLF", name: "Financial Select Sector SPDR", sector: "ETF" },
  { symbol: "XLK", name: "Technology Select Sector SPDR", sector: "ETF" },
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
    week52High: null,
    week52Low: null,
    beta: null,
    revenueGrowth: null,
    epsGrowth: null,
    roe: null,
    history: [],
    news: [],
    analystTrend: null,
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

function getFinnhubApiKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_FINNHUB_API_KEY ||
    process.env.FINNHUB_API_KEY ||
    undefined
  );
}

export function isFinnhubConfigured(): boolean {
  return Boolean(getFinnhubApiKey());
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
  apiKey: string
): Promise<Stock> {
  const [chart, quote, extras, news, analystTrend] = await Promise.all([
    fetchChartData(def.symbol, apiKey),
    fetchFinnhubQuote(def.symbol, apiKey),
    fetchFinnhubExtras(def.symbol, apiKey),
    fetchFinnhubNews(def.symbol, apiKey),
    fetchFinnhubRecommendation(def.symbol, apiKey),
  ]);

  if (!chart) return emptyStock(def);

  const price = quote?.c ?? chart.price;
  const change = quote ? +(quote.d ?? 0).toFixed(2) : chart.change;
  const changePercent = quote ? +(quote.dp ?? 0).toFixed(2) : chart.changePercent;

  return {
    symbol: def.symbol,
    name: extras.name ?? chart.name ?? def.name,
    sector: def.sector,
    industry: extras.industry,
    website: extras.website,
    price,
    change,
    changePercent,
    marketCap: extras.marketCap,
    peRatio: extras.peRatio,
    dividendYield: extras.dividendYield,
    week52High: extras.week52High,
    week52Low: extras.week52Low,
    beta: extras.beta,
    revenueGrowth: extras.revenueGrowth,
    epsGrowth: extras.epsGrowth,
    roe: extras.roe,
    history: chart.history,
    news,
    analystTrend,
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
