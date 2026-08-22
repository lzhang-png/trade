import { calculateIndicators } from "./technical-analysis";
import type {
  Recommendation,
  RiskProfile,
  Signal,
  Stock,
  TimeHorizon,
} from "./types";

function scoreToSignal(score: number): Signal {
  if (score >= 75) return "strong_buy";
  if (score >= 60) return "buy";
  if (score >= 40) return "hold";
  if (score >= 25) return "sell";
  return "strong_sell";
}

function analyzeShortTerm(indicators: ReturnType<typeof calculateIndicators>, price: number) {
  let score = 50;
  const reasons: string[] = [];
  const risks: string[] = [];

  if (indicators.rsi < 30) {
    score += 15;
    reasons.push(`RSI at ${indicators.rsi.toFixed(0)} — oversold, potential bounce`);
  } else if (indicators.rsi > 70) {
    score -= 15;
    risks.push(`RSI at ${indicators.rsi.toFixed(0)} — overbought, pullback risk`);
  } else if (indicators.rsi >= 40 && indicators.rsi <= 60) {
    score += 5;
    reasons.push("RSI in neutral zone with room to run");
  }

  if (indicators.macdHistogram > 0 && indicators.macd > indicators.macdSignal) {
    score += 12;
    reasons.push("MACD bullish crossover — momentum building");
  } else if (indicators.macdHistogram < 0) {
    score -= 10;
    risks.push("MACD bearish — weakening momentum");
  }

  if (price > indicators.sma20) {
    score += 8;
    reasons.push("Price above 20-day SMA — short-term uptrend");
  } else {
    score -= 8;
    risks.push("Price below 20-day SMA — short-term weakness");
  }

  if (indicators.volumeRatio > 1.5) {
    score += 5;
    reasons.push(`Volume ${(indicators.volumeRatio * 100).toFixed(0)}% above average — strong interest`);
  }

  const targetPrice = price * 1.05;
  const stopLoss = Math.max(indicators.support, price - indicators.atr * 1.5);

  return { score, reasons, risks, targetPrice, stopLoss };
}

function analyzeMidTerm(indicators: ReturnType<typeof calculateIndicators>, price: number) {
  let score = 50;
  const reasons: string[] = [];
  const risks: string[] = [];

  if (price > indicators.sma50 && indicators.sma50 > indicators.sma200) {
    score += 15;
    reasons.push("Golden cross pattern — 50 SMA above 200 SMA");
  } else if (price < indicators.sma50 && indicators.sma50 < indicators.sma200) {
    score -= 15;
    risks.push("Death cross pattern — bearish long-term trend");
  }

  if (price > indicators.sma50) {
    score += 10;
    reasons.push("Price above 50-day SMA — mid-term uptrend intact");
  } else {
    score -= 10;
    risks.push("Price below 50-day SMA — mid-term trend weakening");
  }

  if (indicators.rsi >= 35 && indicators.rsi <= 55) {
    score += 8;
    reasons.push("RSI in healthy accumulation zone");
  } else if (indicators.rsi > 65) {
    score -= 8;
    risks.push("RSI elevated — limited upside near-term");
  }

  if (indicators.macd > 0) {
    score += 7;
    reasons.push("MACD positive — sustained buying pressure");
  }

  const distanceToResistance = ((indicators.resistance - price) / price) * 100;
  if (distanceToResistance > 10) {
    score += 5;
    reasons.push(`${distanceToResistance.toFixed(0)}% room to resistance level`);
  } else {
    risks.push("Near resistance — limited upside before pullback");
  }

  const targetPrice = indicators.resistance * 0.98;
  const stopLoss = Math.max(indicators.support, price - indicators.atr * 2.5);

  return { score, reasons, risks, targetPrice, stopLoss };
}

export function generateRecommendation(
  stock: Stock,
  horizon: TimeHorizon,
  riskProfile?: RiskProfile
): Recommendation {
  const indicators = calculateIndicators(stock.history);
  const analysis =
    horizon === "short"
      ? analyzeShortTerm(indicators, stock.price)
      : analyzeMidTerm(indicators, stock.price);

  let adjustedScore = analysis.score;

  if (riskProfile) {
    if (riskProfile.tolerance === "conservative" && indicators.atr / stock.price > 0.03) {
      adjustedScore -= 10;
      analysis.risks.push("High volatility for conservative profile");
    }
    if (riskProfile.sectors.length > 0 && !riskProfile.sectors.includes(stock.sector)) {
      adjustedScore -= 5;
      analysis.risks.push(`Outside preferred sectors (${riskProfile.sectors.join(", ")})`);
    }
  }

  adjustedScore = Math.max(0, Math.min(100, adjustedScore));
  const confidence = Math.min(
    95,
    50 + Math.abs(adjustedScore - 50) * 0.8 + analysis.reasons.length * 3
  );

  return {
    symbol: stock.symbol,
    name: stock.name,
    signal: scoreToSignal(adjustedScore),
    score: adjustedScore,
    confidence,
    horizon,
    price: stock.price,
    targetPrice: analysis.targetPrice,
    stopLoss: analysis.stopLoss,
    reasons: analysis.reasons,
    risks: analysis.risks,
    indicators,
  };
}

export function generatePortfolioAdvice(
  position: { symbol: string; shares: number; avgCost: number },
  stock: Stock,
  horizon: TimeHorizon
): Recommendation & { gainLoss: number; gainLossPercent: number } {
  const rec = generateRecommendation(stock, horizon);
  const currentValue = stock.price * position.shares;
  const costBasis = position.avgCost * position.shares;
  const gainLoss = currentValue - costBasis;
  const gainLossPercent = ((stock.price - position.avgCost) / position.avgCost) * 100;

  if (gainLossPercent > 15 && rec.signal !== "strong_buy") {
    rec.signal = rec.score < 50 ? "sell" : "hold";
    rec.reasons.unshift(`Up ${gainLossPercent.toFixed(1)}% — consider taking profits`);
  } else if (gainLossPercent < -10) {
    rec.risks.unshift(`Down ${Math.abs(gainLossPercent).toFixed(1)}% — review stop-loss`);
    if (rec.score < 40) rec.signal = "sell";
  }

  return { ...rec, gainLoss, gainLossPercent };
}

export function rankStocks(
  stocks: Stock[],
  horizon: TimeHorizon,
  riskProfile?: RiskProfile
): Recommendation[] {
  return stocks
    .map((s) => generateRecommendation(s, horizon, riskProfile))
    .sort((a, b) => b.score - a.score);
}
