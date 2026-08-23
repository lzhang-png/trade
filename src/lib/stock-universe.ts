import type { Sector } from "./types";

/** Why these tickers — shown in the app UI. */
export const UNIVERSE_CRITERIA = {
  summary:
    "Large-cap US stocks and sector ETFs, manually picked for liquid names across major industries.",
  bullets: [
    "S&P 500–adjacent leaders (Apple, Microsoft, JPMorgan, etc.)",
    "Balanced sector coverage: tech, healthcare, finance, consumer, energy, industrial",
    "Sector ETFs (SPY, QQQ, XLF…) for market context",
    "Not a dynamic screener — the list is fixed in code and updated manually",
  ],
} as const;

/** Static universe — all prices and scores come from live APIs. */
export const STOCK_UNIVERSE: Array<{ symbol: string; name: string; sector: Sector }> = [
  // Technology (14)
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
  // Consumer (10)
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
  // Finance (6)
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Finance" },
  { symbol: "V", name: "Visa Inc.", sector: "Finance" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Finance" },
  { symbol: "BAC", name: "Bank of America", sector: "Finance" },
  { symbol: "GS", name: "Goldman Sachs", sector: "Finance" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Finance" },
  // Healthcare (6)
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "LLY", name: "Eli Lilly & Co.", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co.", sector: "Healthcare" },
  // Energy & Industrial (5)
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy" },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrial" },
  { symbol: "BA", name: "Boeing Co.", sector: "Industrial" },
  { symbol: "GE", name: "GE Aerospace", sector: "Industrial" },
  // ETFs (6)
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "ETF" },
  { symbol: "IWM", name: "iShares Russell 2000", sector: "ETF" },
  { symbol: "VTI", name: "Vanguard Total Stock Market", sector: "ETF" },
  { symbol: "XLF", name: "Financial Select Sector SPDR", sector: "ETF" },
  { symbol: "XLK", name: "Technology Select Sector SPDR", sector: "ETF" },
];
