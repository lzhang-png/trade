# TradeWise — AI Trading Consultant

A smart trading consultant app that helps you decide **what to buy** and **what to sell** for short-term (1–4 weeks) and mid-term (1–6 months) investment plans.

## Features

### Dashboard
- Portfolio summary with P&L tracking
- Top short-term and mid-term picks ranked by conviction score
- Market movers (gainers/losers)

### Market Scanner
- Scan 18 stocks and ETFs across 7 sectors
- Filter by signal (Strong Buy → Strong Sell), sector, and time horizon
- Technical indicators: RSI, MACD, SMA crossovers, volume analysis
- Target price and stop-loss levels for every asset

### Portfolio Manager
- Track positions with cost basis and unrealized P&L
- Personalized sell/hold recommendations per holding
- Profit-taking and stop-loss alerts

### AI Consultant
- Chat with an AI trading advisor
- Context-aware: knows your portfolio, risk profile, and watchlist
- Suggested prompts for common decisions
- Works in demo mode without API key; full AI with `OPENAI_API_KEY`

### Watchlist
- Monitor stocks you're considering
- Live signal updates and price targets

### Risk Profile Settings
- Conservative / Moderate / Aggressive tolerance
- Preferred time horizon and sectors
- Max position size and drawdown limits

## Recommendation Engine

TradeWise scores every asset 0–100 using:

| Indicator | Short-term weight | Mid-term weight |
|-----------|------------------|-----------------|
| RSI (14) | Oversold/overbought signals | Accumulation zone |
| MACD | Crossover momentum | Sustained trend |
| SMA 20/50/200 | Price vs 20-day SMA | Golden/death cross |
| Volume | Relative volume spikes | — |
| Support/Resistance | — | Room to resistance |

Scores map to signals: **Strong Buy** (75+) → **Strong Sell** (<25)

## Live Demo

**GitHub Pages:** [https://lzhang-png.github.io/trade/](https://lzhang-png.github.io/trade/)

> **First-time setup:** Enable GitHub Pages in [repo Settings → Pages](https://github.com/lzhang-png/trade/settings/pages) → set Source to **GitHub Actions**, then re-run the [deploy workflow](https://github.com/lzhang-png/trade/actions/workflows/deploy.yml). See [DEPLOY.md](./DEPLOY.md) for details.

Open on your phone — tap the **☰ menu** in the top-right for navigation.

Deploys automatically to GitHub Pages on every push to `main`.


### Optional: Enable full AI consultant

```bash
# .env.local
OPENAI_API_KEY=sk-...
```

### Live market data

Prices and 1-year daily history come from **Yahoo Finance** (loaded in your browser). Technical scores are computed from that real OHLCV data.

Optional **Finnhub** key adds live quotes and fundamentals (market cap, P/E, dividend yield):

```bash
# .env.local or GitHub Actions secret FINNHUB_API_KEY
FINNHUB_API_KEY=your_key
```

Without a Finnhub key, fundamentals show as "—" but prices, charts, and signals still use real market data.

## Tech Stack

- **Next.js 16** (App Router)
- **shadcn/ui** + Tailwind CSS v4
- **Vercel AI SDK** for the consultant chat
- **Recharts** for price charts
- **Local storage** for portfolio and settings persistence

## Disclaimer

TradeWise provides educational guidance only. It is **not** licensed financial advice. Always do your own research before making investment decisions.
