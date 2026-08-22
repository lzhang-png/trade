import type { PriceBar, TechnicalIndicators } from "./types";

export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prev = prices[0];
  for (let i = 0; i < prices.length; i++) {
    prev = i === 0 ? prices[0] : prices[i] * k + prev * (1 - k);
    ema.push(prev);
  }
  return ema;
}

export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  const last = macdLine.length - 1;
  return {
    macd: macdLine[last],
    signal: signalLine[last],
    histogram: histogram[last],
  };
}

export function calculateATR(bars: PriceBar[], period = 14): number {
  if (bars.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;
    trs.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }
  const slice = trs.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function findSupportResistance(bars: PriceBar[]): { support: number; resistance: number } {
  const recent = bars.slice(-30);
  const lows = recent.map((b) => b.low);
  const highs = recent.map((b) => b.high);
  return {
    support: Math.min(...lows),
    resistance: Math.max(...highs),
  };
}

export function calculateIndicators(bars: PriceBar[]): TechnicalIndicators {
  const closes = bars.map((b) => b.close);
  const volumes = bars.map((b) => b.volume);
  const { macd, signal, histogram } = calculateMACD(closes);
  const { support, resistance } = findSupportResistance(bars);
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const currentVolume = volumes[volumes.length - 1] ?? avgVolume;

  return {
    rsi: calculateRSI(closes),
    macd,
    macdSignal: signal,
    macdHistogram: histogram,
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    sma200: calculateSMA(closes, Math.min(200, closes.length)),
    volumeRatio: avgVolume > 0 ? currentVolume / avgVolume : 1,
    atr: calculateATR(bars),
    support,
    resistance,
  };
}
