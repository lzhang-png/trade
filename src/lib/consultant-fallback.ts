import { getAllStocks } from "./market-data";
import { rankStocks } from "./recommendation-engine";
import type { PortfolioPosition, RiskProfile, Stock } from "./types";

export function generateConsultantResponse(
  question: string,
  portfolio: PortfolioPosition[],
  riskProfile: RiskProfile,
  watchlist: string[],
  marketStocks?: Stock[]
): string {
  const stocks = marketStocks?.length ? marketStocks : getAllStocks();
  const shortPicks = rankStocks(stocks, "short", riskProfile).slice(0, 5);
  const midPicks = rankStocks(stocks, "mid", riskProfile).slice(0, 5);

  const q = question.toLowerCase();
  const horizon = riskProfile.preferredHorizon;
  const picks = horizon === "short" ? shortPicks : midPicks;

  if (q.includes("buy") || q.includes("what should")) {
    const top = picks.slice(0, 3);
    return `Based on current technical analysis for ${horizon === "short" ? "short-term (1-4 weeks)" : "mid-term (1-6 months)"} investing:

**Top Buy Candidates:**
${top
  .map(
    (p) =>
      `• **${p.symbol}** — ${p.signal.replace("_", " ")} (Score: ${p.score}/100)
  Target: $${p.targetPrice.toFixed(2)} | Stop: $${p.stopLoss.toFixed(2)}
  ${p.reasons[0] ?? ""}`
  )
  .join("\n\n")}

**Position Sizing:** With your ${riskProfile.tolerance} risk profile, limit each position to ${
      riskProfile.tolerance === "aggressive"
        ? "15"
        : riskProfile.tolerance === "conservative"
          ? "5"
          : "10"
    }% of portfolio.

⚠️ *Not financial advice. Always do your own research.*`;
  }

  if (q.includes("sell") && portfolio.length > 0) {
    return `**Portfolio Sell Review:**

${portfolio
  .map((p) => {
    const stock =
      shortPicks.find((s) => s.symbol === p.symbol) ??
      midPicks.find((s) => s.symbol === p.symbol);
    const pnl = stock
      ? (((stock.price - p.avgCost) / p.avgCost) * 100).toFixed(1)
      : "?";
    return `• **${p.symbol}** (${p.shares} shares @ $${p.avgCost}) — P&L: ${pnl}%
  Signal: ${stock?.signal.replace("_", " ") ?? "N/A"} — ${stock?.reasons[0] ?? "Review manually"}`;
  })
  .join("\n\n")}

**General guidance:** Consider selling positions with "sell" signals or where you've hit your profit target (15%+ gains).

⚠️ *Not financial advice.*`;
  }

  if (q.includes("compare") || (q.includes("vs") && q.length < 80)) {
    const symbols = stocks
      .filter((s) => q.includes(s.symbol.toLowerCase()))
      .slice(0, 2);
    if (symbols.length >= 2) {
      const recs = symbols.map((s) =>
        rankStocks([s], horizon, riskProfile)[0]
      );
      return `**${recs[0].symbol} vs ${recs[1].symbol}** (${horizon === "short" ? "Short-term" : "Mid-term"})

| | ${recs[0].symbol} | ${recs[1].symbol} |
|---|---|---|
| Signal | ${recs[0].signal.replace("_", " ")} | ${recs[1].signal.replace("_", " ")} |
| Score | ${recs[0].score} | ${recs[1].score} |
| Target | $${recs[0].targetPrice.toFixed(2)} | $${recs[1].targetPrice.toFixed(2)} |
| RSI | ${recs[0].indicators.rsi.toFixed(0)} | ${recs[1].indicators.rsi.toFixed(0)} |

**Verdict:** ${recs[0].score >= recs[1].score ? recs[0].symbol : recs[1].symbol} has the stronger setup right now.

⚠️ *Not financial advice.*`;
    }
  }

  const watchlistNote =
    watchlist.length > 0
      ? `\n\n**Your watchlist:** ${watchlist.join(", ")}`
      : "";

  return `**TradeWise Analysis** (${horizon === "short" ? "Short-term" : "Mid-term"} focus)

**Market Overview:**
• Strongest signals: ${picks
    .slice(0, 3)
    .map((p) => `${p.symbol} (${p.signal.replace("_", " ")})`)
    .join(", ")}
• Weakest signals: ${[...picks]
    .reverse()
    .slice(0, 2)
    .map((p) => `${p.symbol} (${p.signal.replace("_", " ")})`)
    .join(", ")}

**Quick Tips:**
• Short-term: Focus on RSI oversold bounces and MACD crossovers
• Mid-term: Look for golden cross patterns and sector rotation
• Always set stop-losses at the levels shown in the scanner${watchlistNote}

Ask me specifically about a stock, your portfolio, or a sector for detailed advice.

⚠️ *Not financial advice.*`;
}
