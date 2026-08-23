"use client";

import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SignalBadge, ScoreBar } from "@/components/trading/signal-badge";
import { PriceChart } from "@/components/charts/price-chart";
import { useApp } from "@/lib/app-context";
import { useMarketData } from "@/lib/market-data-context";
import type { Recommendation } from "@/lib/types";
import { HORIZON_LABELS } from "@/lib/types";
import {
  StarIcon,
  PlusIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ShieldIcon,
  CircleCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const { addToWatchlist, watchlist } = useApp();
  const { getStock } = useMarketData();
  const stock = getStock(rec.symbol);
  const inWatchlist = watchlist.some((w) => w.symbol === rec.symbol);

  function handleWatchlist() {
    addToWatchlist({ symbol: rec.symbol, name: rec.name });
    toast.success(`${rec.symbol} added to watchlist`, {
      description: `Now tracking ${rec.name}`,
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="gap-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{rec.symbol}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{rec.name}</p>
          </div>
          <SignalBadge signal={rec.signal} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl font-semibold tabular-nums">${rec.price.toFixed(2)}</span>
          <Badge variant="outline" className="text-sm">
            {HORIZON_LABELS[rec.horizon]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {stock && <PriceChart data={stock.history} sma20={rec.indicators.sma20} height={140} />}

        <div>
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>Conviction Score</span>
            <span>{rec.confidence.toFixed(0)}% confidence</span>
          </div>
          <ScoreBar score={rec.score} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-base">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
            <TrendingUpIcon className="shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="font-semibold tabular-nums">${rec.targetPrice.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
            <ShieldIcon className="shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Stop Loss</p>
              <p className="font-semibold tabular-nums">${rec.stopLoss.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {rec.reasons.length > 0 && (
          <Alert className="py-3">
            <CircleCheckIcon />
            <AlertTitle>Bullish Signals</AlertTitle>
            <AlertDescription>
              <ul className="flex flex-col gap-2">
                {rec.reasons.slice(0, 3).map((r, i) => (
                  <li key={i} className="text-sm leading-relaxed">
                    {r}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {rec.risks.length > 0 && (
          <Alert variant="destructive" className="py-3">
            <TriangleAlertIcon />
            <AlertTitle>Risks</AlertTitle>
            <AlertDescription>
              <ul className="flex flex-col gap-2">
                {rec.risks.slice(0, 2).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                    <TrendingDownIcon className="mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="gap-3 pt-2">
        <Button
          variant="outline"
          size="default"
          className="flex-1"
          disabled={inWatchlist}
          onClick={handleWatchlist}
        >
          <StarIcon data-icon="inline-start" />
          {inWatchlist ? "Watching" : "Watchlist"}
        </Button>
        <Button size="default" className="flex-1">
          <PlusIcon data-icon="inline-start" />
          Add Position
        </Button>
      </CardFooter>
    </Card>
  );
}
