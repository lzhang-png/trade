# TradeWise

A single-page stock screener that ranks 18 US stocks and ETFs by technical analysis score, using live market data from Finnhub.

**Live demo:** [https://lzhang-png.github.io/trade/](https://lzhang-png.github.io/trade/)

## What it shows

One table of recommended stocks with:

- Live price and daily change
- Buy/sell signal (Strong Buy → Strong Sell)
- Conviction score (0–100) from RSI, MACD, and moving averages
- RSI, target price, and stop-loss levels

Toggle between **short-term** (1–4 weeks) and **mid-term** (1–6 months) analysis.

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
