# TradeWise

A single-page stock screener with **44 US stocks and ETFs**, each shown as a rich card with live data from Finnhub.

**Live demo:** [https://lzhang-png.github.io/trade/](https://lzhang-png.github.io/trade/)

## Each card includes

- Live price, daily change, and 30-day sparkline
- Buy/sell signal and conviction score (RSI, MACD, moving averages)
- Fundamentals: market cap, P/E, dividend yield, beta, 52-week range, revenue/EPS growth, ROE
- Target price and stop-loss levels
- Analyst sentiment (Finnhub recommendation trends)
- Recent company news headlines with links

## Data sources

| Data | Source |
|------|--------|
| Prices, history, fundamentals | Finnhub API |
| History fallback | Yahoo Finance (via CORS proxy) |
| Scores & signals | Computed locally from real OHLCV |

Requires `FINNHUB_API_KEY` in GitHub Secrets for the deployed site. See [DEPLOY.md](./DEPLOY.md).

## Run locally

```bash
npm install
FINNHUB_API_KEY=your_key npm run dev
```

## Disclaimer

Educational use only — not licensed financial advice.
