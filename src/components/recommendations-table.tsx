"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SignalBadge, ScoreBar, PriceChange } from "@/components/trading/signal-badge";
import { LiveDataBadge } from "@/components/trading/live-data-badge";
import { rankStocks } from "@/lib/recommendation-engine";
import { useMarketData } from "@/lib/market-data-context";
import type { TimeHorizon } from "@/lib/types";
import { TrendingUpIcon } from "lucide-react";

export function RecommendationsTable() {
  const { stocks, loading, live } = useMarketData();
  const [horizon, setHorizon] = useState<TimeHorizon>("mid");

  const recommendations = useMemo(
    () => rankStocks(stocks, horizon),
    [stocks, horizon]
  );

  const loadedCount = stocks.filter((s) => s.price > 0).length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <TrendingUpIcon className="size-7" />
            <h1 className="text-2xl font-semibold md:text-3xl">TradeWise</h1>
          </div>
          <p className="text-muted-foreground">
            Stock recommendations ranked by technical analysis on live market data.
          </p>
        </div>
        <LiveDataBadge />
      </header>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">
            {loading && !live
              ? "Loading recommendations…"
              : `${recommendations.length} stocks — sorted by score`}
          </CardTitle>
          <Tabs value={horizon} onValueChange={(v) => setHorizon(v as TimeHorizon)}>
            <TabsList>
              <TabsTrigger value="short">Short-term</TabsTrigger>
              <TabsTrigger value="mid">Mid-term</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="px-4 pb-6 md:px-6 md:pb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead className="w-[140px]">Score</TableHead>
                <TableHead>RSI</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Stop</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && loadedCount === 0 ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : recommendations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    No live data yet. Tap refresh once market data loads.
                  </TableCell>
                </TableRow>
              ) : (
                recommendations.map((rec) => {
                  const stock = stocks.find((s) => s.symbol === rec.symbol);
                  return (
                    <TableRow key={rec.symbol}>
                      <TableCell>
                        <p className="font-semibold">{rec.symbol}</p>
                        <p className="text-sm text-muted-foreground">{rec.name}</p>
                      </TableCell>
                      <TableCell className="tabular-nums">${rec.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {stock && (
                          <PriceChange
                            change={stock.change}
                            changePercent={stock.changePercent}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <SignalBadge signal={rec.signal} />
                      </TableCell>
                      <TableCell>
                        <ScoreBar score={rec.score} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {rec.indicators.rsi.toFixed(0)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        ${rec.targetPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        ${rec.stopLoss.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Not financial advice. Scores are computed from live price history (RSI, MACD, moving
        averages).
      </p>
    </div>
  );
}
