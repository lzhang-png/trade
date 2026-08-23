"use client";

import type { Recommendation, Stock } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SignalBadge, ScoreBar, PriceChange } from "@/components/trading/signal-badge";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  NewspaperIcon,
  BarChart3Icon,
  ExternalLinkIcon,
  ShieldIcon,
  TargetIcon,
} from "lucide-react";

function MiniSparkline({ history }: { history: Stock["history"] }) {
  const points = history.slice(-30);
  if (points.length < 2) return null;

  const closes = points.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const w = 120;
  const h = 36;

  const coords = closes
    .map((c, i) => {
      const x = (i / (closes.length - 1)) * w;
      const y = h - ((c - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const up = closes[closes.length - 1] >= closes[0];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-[120px]" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={up ? "text-foreground" : "text-destructive"}
        points={coords}
      />
    </svg>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function analystLabel(trend: Stock["analystTrend"]): string | null {
  if (!trend) return null;
  const total =
    trend.strongBuy + trend.buy + trend.hold + trend.sell + trend.strongSell;
  if (total === 0) return null;
  const bullish = trend.strongBuy + trend.buy;
  const bearish = trend.sell + trend.strongSell;
  const pct = Math.round((bullish / total) * 100);
  if (bullish > bearish * 2) return `${pct}% analyst bullish`;
  if (bearish > bullish * 2) return `${Math.round((bearish / total) * 100)}% analyst bearish`;
  return `${pct}% analyst buy/hold`;
}

export function StockCard({
  stock,
  rec,
}: {
  stock: Stock;
  rec: Recommendation;
}) {
  const analyst = analystLabel(stock.analystTrend);

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="gap-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{stock.symbol}</h2>
              <Badge variant="outline">{stock.sector}</Badge>
              {stock.industry && (
                <Badge variant="secondary" className="truncate max-w-[180px]">
                  {stock.industry}
                </Badge>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{stock.name}</p>
          </div>
          <SignalBadge signal={rec.signal} />
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold tabular-nums">${rec.price.toFixed(2)}</p>
            <div className="mt-2">
              <PriceChange change={stock.change} changePercent={stock.changePercent} />
            </div>
          </div>
          <MiniSparkline history={stock.history} />
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Conviction score</span>
            <span>{rec.confidence.toFixed(0)}% confidence</span>
          </div>
          <ScoreBar score={rec.score} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 pt-0">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Market cap" value={stock.marketCap} />
          <Metric label="P/E" value={stock.peRatio?.toFixed(1) ?? "—"} />
          <Metric label="Div yield" value={stock.dividendYield != null ? `${stock.dividendYield}%` : "—"} />
          <Metric label="Beta" value={stock.beta?.toFixed(2) ?? "—"} />
          <Metric
            label="52W range"
            value={
              stock.week52Low != null && stock.week52High != null
                ? `$${stock.week52Low.toFixed(0)}–$${stock.week52High.toFixed(0)}`
                : "—"
            }
          />
          <Metric
            label="Rev growth (3Y)"
            value={stock.revenueGrowth != null ? `${stock.revenueGrowth}%` : "—"}
          />
          <Metric label="EPS growth (3Y)" value={stock.epsGrowth != null ? `${stock.epsGrowth}%` : "—"} />
          <Metric label="ROE" value={stock.roe != null ? `${stock.roe}%` : "—"} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
            <TargetIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="font-semibold tabular-nums">${rec.targetPrice.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
            <ShieldIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Stop loss</p>
              <p className="font-semibold tabular-nums">${rec.stopLoss.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-md border px-2 py-2">
            <p className="text-xs text-muted-foreground">RSI</p>
            <p className="font-semibold tabular-nums">{rec.indicators.rsi.toFixed(0)}</p>
          </div>
          <div className="rounded-md border px-2 py-2">
            <p className="text-xs text-muted-foreground">MACD</p>
            <p className="font-semibold tabular-nums">
              {rec.indicators.macdHistogram > 0 ? "Bullish" : "Bearish"}
            </p>
          </div>
          <div className="rounded-md border px-2 py-2">
            <p className="text-xs text-muted-foreground">vs SMA50</p>
            <p className="font-semibold tabular-nums">
              {rec.price > rec.indicators.sma50 ? "Above" : "Below"}
            </p>
          </div>
        </div>

        {analyst && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3Icon className="size-4 shrink-0" />
            <span>{analyst}</span>
          </div>
        )}

        {rec.reasons.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <TrendingUpIcon className="size-4" />
              Bullish signals
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              {rec.reasons.slice(0, 3).map((r, i) => (
                <li key={i} className="leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rec.risks.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <TrendingDownIcon className="size-4" />
              Risks
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              {rec.risks.slice(0, 2).map((r, i) => (
                <li key={i} className="leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {stock.news.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <NewspaperIcon className="size-4" />
                Recent news
              </div>
              <ul className="flex flex-col gap-3">
                {stock.news.slice(0, 3).map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-md transition-colors hover:bg-muted/50"
                    >
                      <p className="text-sm font-medium leading-snug group-hover:underline">
                        {item.headline}
                        <ExternalLinkIcon className="ml-1 inline size-3 opacity-50" />
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.source} ·{" "}
                        {new Date(item.datetime * 1000).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>

      {stock.website && (
        <CardFooter className="pt-0">
          <a
            href={stock.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Company website
            <ExternalLinkIcon className="size-3" />
          </a>
        </CardFooter>
      )}
    </Card>
  );
}
