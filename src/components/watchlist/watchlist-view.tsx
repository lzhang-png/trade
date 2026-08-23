"use client";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SignalBadge, PriceChange } from "@/components/trading/signal-badge";
import { PageHeader } from "@/components/layout/page-header";
import { LiveDataBadge } from "@/components/trading/live-data-badge";
import { generateRecommendation } from "@/lib/recommendation-engine";
import { useApp } from "@/lib/app-context";
import { useMarketData } from "@/lib/market-data-context";
import { StarIcon, Trash2Icon } from "lucide-react";

export function WatchlistView() {
  const { watchlist, removeFromWatchlist, riskProfile } = useApp();
  const { stocks } = useMarketData();

  const items = watchlist
    .map((item) => {
      const stock = stocks.find((s) => s.symbol === item.symbol);
      if (!stock) return null;
      const rec = generateRecommendation(stock, riskProfile.preferredHorizon, riskProfile);
      return { item, stock, rec };
    })
    .filter(Boolean);

  return (
    <div className="page-container">
      <PageHeader
        icon={StarIcon}
        title="Watchlist"
        description="Monitor stocks you're considering — add from the Dashboard or Scanner"
        action={<LiveDataBadge />}
      />

      {items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <StarIcon />
            </EmptyMedia>
            <EmptyTitle>Your watchlist is empty</EmptyTitle>
            <EmptyDescription>
              Click &quot;Watchlist&quot; on any recommendation card to start tracking stocks.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{items.length} Watched Stocks</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Stop Loss</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(
                  (entry) =>
                    entry && (
                      <TableRow key={entry.item.symbol}>
                        <TableCell>
                          <p className="font-semibold">{entry.stock.symbol}</p>
                          <p className="text-sm text-muted-foreground">{entry.stock.name}</p>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          ${entry.stock.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <PriceChange
                            change={entry.stock.change}
                            changePercent={entry.stock.changePercent}
                          />
                        </TableCell>
                        <TableCell>
                          <SignalBadge signal={entry.rec.signal} />
                        </TableCell>
                        <TableCell className="tabular-nums">${entry.rec.targetPrice.toFixed(2)}</TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">
                          ${entry.rec.stopLoss.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(entry.item.addedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              removeFromWatchlist(entry.item.symbol);
                              toast.info(`${entry.item.symbol} removed from watchlist`);
                            }}
                          >
                            <Trash2Icon />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
