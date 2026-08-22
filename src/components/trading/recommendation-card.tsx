"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalBadge, ScoreBar } from "@/components/trading/signal-badge";
import { PriceChart } from "@/components/charts/price-chart";
import { useApp } from "@/lib/app-context";
import { getStock } from "@/lib/market-data";
import type { Recommendation } from "@/lib/types";
import { HORIZON_LABELS } from "@/lib/types";
import { Star, Plus, TrendingUp, TrendingDown, Shield } from "lucide-react";

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const { addToWatchlist, watchlist } = useApp();
  const stock = getStock(rec.symbol);
  const inWatchlist = watchlist.some((w) => w.symbol === rec.symbol);

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold">{rec.symbol}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{rec.name}</p>
          </div>
          <SignalBadge signal={rec.signal} />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-2xl font-bold tabular-nums">${rec.price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">
            {HORIZON_LABELS[rec.horizon]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stock && <PriceChart data={stock.history} sma20={rec.indicators.sma20} height={120} />}

        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Conviction Score</span>
            <span>{rec.confidence.toFixed(0)}% confidence</span>
          </div>
          <ScoreBar score={rec.score} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2.5">
            <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Target</p>
              <p className="font-semibold tabular-nums">${rec.targetPrice.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-2.5">
            <Shield className="h-4 w-4 text-red-400 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Stop Loss</p>
              <p className="font-semibold tabular-nums">${rec.stopLoss.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {rec.reasons.length > 0 && (
          <div>
            <p className="text-xs font-medium text-emerald-400 mb-1.5">Bullish Signals</p>
            <ul className="space-y-1">
              {rec.reasons.slice(0, 3).map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-emerald-400">+</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rec.risks.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-400 mb-1.5">Risks</p>
            <ul className="space-y-1">
              {rec.risks.slice(0, 2).map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <TrendingDown className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={inWatchlist}
            onClick={() => addToWatchlist({ symbol: rec.symbol, name: rec.name })}
          >
            <Star className="h-3.5 w-3.5 mr-1.5" />
            {inWatchlist ? "Watching" : "Watchlist"}
          </Button>
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Position
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
