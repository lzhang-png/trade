"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LiveDataBadge } from "@/components/trading/live-data-badge";
import { StockSearch } from "@/components/stock-search";
import { StockCard } from "@/components/stock-card";
import { rankStocks } from "@/lib/recommendation-engine";
import { useMarketData } from "@/lib/market-data-context";
import { useWatchlist } from "@/lib/watchlist-context";
import { STOCK_UNIVERSE, UNIVERSE_CRITERIA } from "@/lib/market-data";
import type { TimeHorizon } from "@/lib/types";
import { StarIcon, TrendingUpIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

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
    </div>
  );
}

export function RecommendationsView() {
  const { stocks, loading, live, enriching } = useMarketData();
  const { watchlist, remove } = useWatchlist();
  const [horizon, setHorizon] = useState<TimeHorizon>("mid");
  const [view, setView] = useState<"featured" | "watchlist">("featured");

  const featuredSymbols = new Set(STOCK_UNIVERSE.map((s) => s.symbol));

  const featuredStocks = useMemo(
    () => stocks.filter((s) => featuredSymbols.has(s.symbol)),
    [stocks, featuredSymbols]
  );

  const watchlistStocks = useMemo(
    () =>
      watchlist
        .map((w) => stocks.find((s) => s.symbol === w.symbol))
        .filter((s): s is NonNullable<typeof s> => Boolean(s && s.price > 0)),
    [watchlist, stocks]
  );

  const featuredRecs = useMemo(
    () => rankStocks(featuredStocks, horizon),
    [featuredStocks, horizon]
  );

  const watchlistRecs = useMemo(
    () => rankStocks(watchlistStocks, horizon),
    [watchlistStocks, horizon]
  );

  const activeRecs = view === "watchlist" ? watchlistRecs : featuredRecs;

  const loadedFeatured = featuredStocks.filter((s) => s.price > 0).length;
  const totalFeatured = STOCK_UNIVERSE.length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <TrendingUpIcon className="size-7" />
            <h1 className="text-2xl font-semibold md:text-3xl">TradeWise</h1>
          </div>
          <p className="max-w-xl text-muted-foreground">
            Search any US stock or ETF, build your watchlist, and get live technical
            scores with fundamentals and news.
          </p>
          {loading && view === "featured" && (
            <p className="text-sm text-muted-foreground">
              Loading featured prices {loadedFeatured}/{totalFeatured}…
            </p>
          )}
          {!loading && enriching && (
            <p className="text-sm text-muted-foreground">Loading card details…</p>
          )}
        </div>
        <LiveDataBadge />
      </header>

      <StockSearch />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as "featured" | "watchlist")}>
          <TabsList>
            <TabsTrigger value="featured">Featured ({totalFeatured})</TabsTrigger>
            <TabsTrigger value="watchlist">
              <StarIcon data-icon="inline-start" className="size-4" />
              Watchlist ({watchlist.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={horizon} onValueChange={(v) => setHorizon(v as TimeHorizon)}>
          <TabsList>
            <TabsTrigger value="short">Short-term</TabsTrigger>
            <TabsTrigger value="mid">Mid-term</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "featured" && (
        <details className="rounded-lg border bg-muted/20 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">
            How are the featured {totalFeatured} stocks selected?
          </summary>
          <div className="mt-3 text-muted-foreground">
            <p className="mb-2">{UNIVERSE_CRITERIA.summary}</p>
            <ul className="list-inside list-disc space-y-1">
              {UNIVERSE_CRITERIA.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {view === "watchlist" && watchlist.length === 0 && (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center">
          <StarIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">Your watchlist is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the search bar above to find any US stock or ETF and tap Add.
          </p>
        </div>
      )}

      {view === "watchlist" && watchlist.length > 0 && watchlistRecs.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Loading watchlist data…
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {view === "featured" && loading && loadedFeatured === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : activeRecs.length === 0 && view === "featured" ? (
          <p className="col-span-full py-16 text-center text-muted-foreground">
            No live data yet. Tap refresh once market data loads.
          </p>
        ) : (
          activeRecs.map((rec) => {
            const stock = stocks.find((s) => s.symbol === rec.symbol);
            if (!stock) return null;
            return (
              <div key={rec.symbol} className="relative">
                {view === "watchlist" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-3 top-3 z-10"
                    onClick={() => {
                      remove(rec.symbol);
                      toast.info(`Removed ${rec.symbol} from watchlist`);
                    }}
                    aria-label={`Remove ${rec.symbol} from watchlist`}
                  >
                    <Trash2Icon />
                  </Button>
                )}
                <StockCard
                  stock={stock}
                  rec={rec}
                  showWatchlistAction={view === "featured"}
                />
              </div>
            );
          })
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Not financial advice. Search powered by Finnhub — covers US-listed stocks and ETFs.
      </p>
    </div>
  );
}
