"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveDataBadge } from "@/components/trading/live-data-badge";
import { StockCard } from "@/components/stock-card";
import { rankStocks } from "@/lib/recommendation-engine";
import { useMarketData } from "@/lib/market-data-context";
import { STOCK_UNIVERSE } from "@/lib/market-data";
import type { TimeHorizon } from "@/lib/types";
import { TrendingUpIcon } from "lucide-react";

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border p-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-2 w-full" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export function RecommendationsView() {
  const { stocks, loading, live } = useMarketData();
  const [horizon, setHorizon] = useState<TimeHorizon>("mid");

  const recommendations = useMemo(
    () => rankStocks(stocks, horizon),
    [stocks, horizon]
  );

  const loadedCount = stocks.filter((s) => s.price > 0).length;
  const total = STOCK_UNIVERSE.length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <TrendingUpIcon className="size-7" />
            <h1 className="text-2xl font-semibold md:text-3xl">TradeWise</h1>
          </div>
          <p className="max-w-xl text-muted-foreground">
            {total} stocks ranked by live technical analysis — with fundamentals, analyst
            sentiment, and recent news on each card.
          </p>
          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading {loadedCount}/{total}…
            </p>
          )}
        </div>
        <LiveDataBadge />
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {recommendations.length > 0
            ? `${recommendations.length} recommendations — highest score first`
            : "Waiting for market data…"}
        </p>
        <Tabs value={horizon} onValueChange={(v) => setHorizon(v as TimeHorizon)}>
          <TabsList>
            <TabsTrigger value="short">Short-term</TabsTrigger>
            <TabsTrigger value="mid">Mid-term</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading && loadedCount === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : recommendations.length === 0 ? (
          <p className="col-span-full py-16 text-center text-muted-foreground">
            No live data yet. Tap refresh once market data loads.
          </p>
        ) : (
          recommendations.map((rec) => {
            const stock = stocks.find((s) => s.symbol === rec.symbol);
            if (!stock) return null;
            return <StockCard key={rec.symbol} stock={stock} rec={rec} />;
          })
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Not financial advice. Data from Finnhub — prices, fundamentals, news, and analyst trends.
      </p>
    </div>
  );
}
