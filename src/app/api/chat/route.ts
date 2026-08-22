import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { getAllStocks } from "@/lib/market-data";
import { rankStocks } from "@/lib/recommendation-engine";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, portfolio, riskProfile, watchlist } = await req.json();

  const stocks = getAllStocks();
  const shortPicks = rankStocks(stocks, "short", riskProfile).slice(0, 5);
  const midPicks = rankStocks(stocks, "mid", riskProfile).slice(0, 5);

  const marketContext = `
CURRENT MARKET DATA (simulated for demo):
Top Short-Term Picks: ${shortPicks.map((p) => `${p.symbol} (${p.signal}, score ${p.score})`).join(", ")}
Top Mid-Term Picks: ${midPicks.map((p) => `${p.symbol} (${p.signal}, score ${p.score})`).join(", ")}

USER PORTFOLIO: ${portfolio?.length ? portfolio.map((p: { symbol: string; shares: number; avgCost: number }) => `${p.symbol}: ${p.shares} shares @ $${p.avgCost}`).join("; ") : "Empty"}

USER RISK PROFILE:
- Tolerance: ${riskProfile?.tolerance ?? "moderate"}
- Preferred horizon: ${riskProfile?.preferredHorizon ?? "mid"}
- Max position size: ${riskProfile?.maxPositionSize ?? 10}%
- Preferred sectors: ${riskProfile?.sectors?.join(", ") ?? "all"}

WATCHLIST: ${watchlist?.length ? watchlist.join(", ") : "Empty"}
`;

  const systemPrompt = `You are TradeWise, an expert trading consultant specializing in short-term (1-4 weeks) and mid-term (1-6 months) investing.

Your role:
- Help users decide what to BUY and what to SELL
- Provide specific, actionable advice with entry/exit levels when possible
- Consider the user's risk profile and existing portfolio
- Reference technical indicators (RSI, MACD, moving averages) in your analysis
- Always mention risks and stop-loss levels
- Be concise but thorough — use bullet points for clarity

Important rules:
- This is educational guidance, NOT licensed financial advice
- Always remind users to do their own research for large decisions
- When recommending buys, suggest position sizing based on risk tolerance
- When recommending sells, explain whether it's profit-taking, stop-loss, or trend reversal
- For conservative users, favor ETFs and established large-caps
- For aggressive users, you can discuss higher-volatility plays

${marketContext}`;

  const hasApiKey = !!process.env.OPENAI_API_KEY;

  if (!hasApiKey) {
    const lastMessage = messages[messages.length - 1];
    const userQuestion =
      lastMessage?.parts?.find((p: { type: string }) => p.type === "text")?.text ?? "";

    const fallbackResponse = generateFallbackResponse(
      userQuestion,
      shortPicks,
      midPicks,
      portfolio,
      riskProfile
    );

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const id = "fallback-text";
        writer.write({ type: "text-start", id });
        writer.write({ type: "text-delta", id, delta: fallbackResponse });
        writer.write({ type: "text-end", id });
      },
    });

    return createUIMessageStreamResponse({ stream });
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}

function generateFallbackResponse(
  question: string,
  shortPicks: ReturnType<typeof rankStocks>,
  midPicks: ReturnType<typeof rankStocks>,
  portfolio: Array<{ symbol: string; shares: number; avgCost: number }> | undefined,
  riskProfile: { tolerance?: string; preferredHorizon?: string } | undefined
) {
  const q = question.toLowerCase();
  const horizon = riskProfile?.preferredHorizon ?? "mid";
  const picks = horizon === "short" ? shortPicks : midPicks;

  if (q.includes("buy") || q.includes("what should")) {
    const top = picks.slice(0, 3);
    return `Based on current technical analysis for ${horizon === "short" ? "short-term (1-4 weeks)" : "mid-term (1-6 months)"} investing:

**Top Buy Candidates:**
${top.map((p) => `• **${p.symbol}** — ${p.signal.replace("_", " ")} (Score: ${p.score}/100)
  Target: $${p.targetPrice.toFixed(2)} | Stop: $${p.stopLoss.toFixed(2)}
  ${p.reasons[0] ?? ""}`).join("\n\n")}

**Position Sizing:** With your ${riskProfile?.tolerance ?? "moderate"} risk profile, limit each position to ${riskProfile?.tolerance === "aggressive" ? "15" : riskProfile?.tolerance === "conservative" ? "5" : "10"}% of portfolio.

⚠️ *Demo mode — add OPENAI_API_KEY for full AI analysis. Not financial advice.*`;
  }

  if (q.includes("sell") && portfolio?.length) {
    return `**Portfolio Sell Review:**

${portfolio.map((p) => {
  const stock = shortPicks.find((s) => s.symbol === p.symbol) ?? midPicks.find((s) => s.symbol === p.symbol);
  const pnl = stock ? ((stock.price - p.avgCost) / p.avgCost * 100).toFixed(1) : "?";
  return `• **${p.symbol}** (${p.shares} shares @ $${p.avgCost}) — P&L: ${pnl}%
  Signal: ${stock?.signal.replace("_", " ") ?? "N/A"} — ${stock?.reasons[0] ?? "Review manually"}`;
}).join("\n\n")}

**General guidance:** Consider selling positions with "sell" signals or where you've hit your profit target (15%+ gains).

⚠️ *Demo mode — add OPENAI_API_KEY for full AI analysis.*`;
  }

  return `**TradeWise Analysis** (${horizon === "short" ? "Short-term" : "Mid-term"} focus)

**Market Overview:**
• Strongest signals: ${picks.slice(0, 3).map((p) => `${p.symbol} (${p.signal.replace("_", " ")})`).join(", ")}
• Weakest signals: ${[...picks].reverse().slice(0, 2).map((p) => `${p.symbol} (${p.signal.replace("_", " ")})`).join(", ")}

**Quick Tips:**
• Short-term: Focus on RSI oversold bounces and MACD crossovers
• Mid-term: Look for golden cross patterns and sector rotation
• Always set stop-losses at the levels shown in the scanner

Ask me specifically about a stock, your portfolio, or a sector for detailed advice.

⚠️ *Demo mode — set OPENAI_API_KEY in .env for full AI-powered responses. Not financial advice.*`;
}
