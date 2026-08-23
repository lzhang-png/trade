export type TimeHorizon = "short" | "mid";

export type Signal = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";

export type Sector =
  | "Technology"
  | "Healthcare"
  | "Finance"
  | "Energy"
  | "Consumer"
  | "Industrial"
  | "ETF";

export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockNews {
  headline: string;
  source: string;
  datetime: number;
  url: string;
  summary?: string;
}

export interface AnalystTrend {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: Sector;
  industry?: string;
  website?: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number | null;
  dividendYield: number | null;
  week52High: number | null;
  week52Low: number | null;
  beta: number | null;
  revenueGrowth: number | null;
  epsGrowth: number | null;
  roe: number | null;
  history: PriceBar[];
  news: StockNews[];
  analystTrend: AnalystTrend | null;
  /** False until fundamentals, news, and analyst data finish loading. */
  detailsLoaded: boolean;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  sma20: number;
  sma50: number;
  sma200: number;
  volumeRatio: number;
  atr: number;
  support: number;
  resistance: number;
}

export interface Recommendation {
  symbol: string;
  name: string;
  signal: Signal;
  score: number;
  confidence: number;
  horizon: TimeHorizon;
  price: number;
  targetPrice: number;
  stopLoss: number;
  reasons: string[];
  risks: string[];
  indicators: TechnicalIndicators;
}

export const HORIZON_LABELS: Record<TimeHorizon, string> = {
  short: "Short-term (1–4 weeks)",
  mid: "Mid-term (1–6 months)",
};
