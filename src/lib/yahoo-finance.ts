import type { PriceBar } from "./types";

interface YahooChartResult {
  meta: {
    symbol: string;
    longName?: string;
    shortName?: string;
    regularMarketPrice?: number;
    chartPreviousClose?: number;
    previousClose?: number;
  };
  timestamp: number[];
  indicators: {
    quote: Array<{
      open: (number | null)[];
      high: (number | null)[];
      low: (number | null)[];
      close: (number | null)[];
      volume: (number | null)[];
    }>;
  };
}

export interface YahooChartData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: PriceBar[];
}

function parseChartResult(result: YahooChartResult): YahooChartData | null {
  const { meta, timestamp, indicators } = result;
  const quote = indicators.quote[0];
  if (!quote || !timestamp?.length) return null;

  const history: PriceBar[] = [];
  for (let i = 0; i < timestamp.length; i++) {
    const close = quote.close[i];
    if (close == null) continue;
    const date = new Date(timestamp[i] * 1000).toISOString().split("T")[0];
    history.push({
      date,
      open: +(quote.open[i] ?? close).toFixed(2),
      high: +(quote.high[i] ?? close).toFixed(2),
      low: +(quote.low[i] ?? close).toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(quote.volume[i] ?? 0),
    });
  }

  if (history.length < 2) return null;

  const price = meta.regularMarketPrice ?? history[history.length - 1].close;
  const prevClose =
    meta.chartPreviousClose ??
    meta.previousClose ??
    history[history.length - 2].close;
  const change = price - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    symbol: meta.symbol,
    name: meta.longName ?? meta.shortName ?? meta.symbol,
    price: +price.toFixed(2),
    change: +change.toFixed(2),
    changePercent: +changePercent.toFixed(2),
    history,
  };
}

const YAHOO_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (compatible; TradeWise/1.0; +https://lzhang-png.github.io/trade/)",
};

/** Fetch ~1 year of daily OHLCV + latest quote from Yahoo Finance. */
export async function fetchYahooChart(symbol: string): Promise<YahooChartData | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`;
    const res = await fetch(url, { cache: "no-store", headers: YAHOO_HEADERS });
    if (!res.ok) return null;

    const json = (await res.json()) as { chart?: { result?: YahooChartResult[] | null } };
    const result = json.chart?.result?.[0];
    if (!result) return null;

    return parseChartResult(result);
  } catch {
    return null;
  }
}

/** Batch fetch with modest concurrency to respect rate limits. */
export async function fetchYahooCharts(
  symbols: string[],
  concurrency = 3
): Promise<Map<string, YahooChartData>> {
  const results = new Map<string, YahooChartData>();
  let index = 0;

  async function worker() {
    while (index < symbols.length) {
      const i = index++;
      const symbol = symbols[i];
      const data = await fetchYahooChart(symbol);
      if (data) results.set(symbol, data);
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, symbols.length) }, worker));
  return results;
}
