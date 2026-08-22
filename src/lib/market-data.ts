import type { PriceBar, Sector, Stock } from "./types";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateHistory(basePrice: number, days: number, seed: number): PriceBar[] {
  const bars: PriceBar[] = [];
  let price = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const volatility = 0.015 + seededRandom(seed + i) * 0.02;
    const trend = (seededRandom(seed + i * 2) - 0.48) * 0.01;
    const change = price * (trend + (seededRandom(seed + i * 3) - 0.5) * volatility);
    const open = price;
    price = Math.max(price * 0.5, price + change);
    const high = Math.max(open, price) * (1 + seededRandom(seed + i * 4) * 0.005);
    const low = Math.min(open, price) * (1 - seededRandom(seed + i * 5) * 0.005);
    const volume = Math.floor(1_000_000 + seededRandom(seed + i * 6) * 5_000_000);

    bars.push({
      date: date.toISOString().split("T")[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +price.toFixed(2),
      volume,
    });
  }
  return bars;
}

const STOCK_DEFS: Array<{
  symbol: string;
  name: string;
  sector: Sector;
  basePrice: number;
  seed: number;
  marketCap: string;
  peRatio: number | null;
  dividendYield: number | null;
}> = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", basePrice: 227.5, seed: 1, marketCap: "3.5T", peRatio: 35.2, dividendYield: 0.44 },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology", basePrice: 415.2, seed: 2, marketCap: "3.1T", peRatio: 36.8, dividendYield: 0.72 },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology", basePrice: 875.4, seed: 3, marketCap: "2.2T", peRatio: 65.1, dividendYield: 0.03 },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", basePrice: 175.8, seed: 4, marketCap: "2.2T", peRatio: 24.5, dividendYield: null },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer", basePrice: 198.3, seed: 5, marketCap: "2.1T", peRatio: 42.1, dividendYield: null },
  { symbol: "META", name: "Meta Platforms", sector: "Technology", basePrice: 585.2, seed: 6, marketCap: "1.5T", peRatio: 28.3, dividendYield: 0.35 },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Finance", basePrice: 245.6, seed: 7, marketCap: "710B", peRatio: 12.4, dividendYield: 2.1 },
  { symbol: "V", name: "Visa Inc.", sector: "Finance", basePrice: 315.8, seed: 8, marketCap: "650B", peRatio: 32.1, dividendYield: 0.68 },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare", basePrice: 528.4, seed: 9, marketCap: "490B", peRatio: 22.8, dividendYield: 1.35 },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", basePrice: 158.2, seed: 10, marketCap: "380B", peRatio: 16.5, dividendYield: 2.95 },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy", basePrice: 112.5, seed: 11, marketCap: "480B", peRatio: 14.2, dividendYield: 3.2 },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrial", basePrice: 385.6, seed: 12, marketCap: "190B", peRatio: 18.9, dividendYield: 1.45 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF", basePrice: 585.2, seed: 13, marketCap: "580B", peRatio: null, dividendYield: 1.25 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "ETF", basePrice: 505.8, seed: 14, marketCap: "290B", peRatio: null, dividendYield: 0.55 },
  { symbol: "IWM", name: "iShares Russell 2000", sector: "ETF", basePrice: 225.4, seed: 15, marketCap: "68B", peRatio: null, dividendYield: 1.1 },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer", basePrice: 248.5, seed: 16, marketCap: "790B", peRatio: 72.3, dividendYield: null },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology", basePrice: 162.8, seed: 17, marketCap: "265B", peRatio: 48.2, dividendYield: null },
  { symbol: "LLY", name: "Eli Lilly & Co.", sector: "Healthcare", basePrice: 892.4, seed: 18, marketCap: "850B", peRatio: 58.6, dividendYield: 0.62 },
];

function buildStock(def: (typeof STOCK_DEFS)[0]): Stock {
  const history = generateHistory(def.basePrice * 0.85, 252, def.seed);
  const latest = history[history.length - 1];
  const prev = history[history.length - 2];
  const change = latest.close - prev.close;
  const changePercent = (change / prev.close) * 100;

  return {
    symbol: def.symbol,
    name: def.name,
    sector: def.sector,
    price: latest.close,
    change: +change.toFixed(2),
    changePercent: +changePercent.toFixed(2),
    marketCap: def.marketCap,
    peRatio: def.peRatio,
    dividendYield: def.dividendYield,
    history,
  };
}

let cache: Stock[] | null = null;

export function getAllStocks(): Stock[] {
  if (!cache) {
    cache = STOCK_DEFS.map(buildStock);
  }
  return cache;
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

export async function fetchLiveQuote(symbol: string): Promise<Stock | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return getStock(symbol) ?? null;

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return getStock(symbol) ?? null;
    const data = await res.json();
    const stock = getStock(symbol);
    if (!stock || !data.c) return stock ?? null;
    return {
      ...stock,
      price: data.c,
      change: data.d ?? 0,
      changePercent: data.dp ?? 0,
    };
  } catch {
    return getStock(symbol) ?? null;
  }
}
