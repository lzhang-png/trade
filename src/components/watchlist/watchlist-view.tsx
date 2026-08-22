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
import { generateRecommendation } from "@/lib/recommendation-engine";
import { useApp } from "@/lib/app-context";
import type { Stock } from "@/lib/types";
import { StarIcon, Trash2Icon } from "lucide-react";

export function WatchlistView({ stocks }: { stocks: Stock[] }) {
  const { watchlist, removeFromWatchlist, riskProfile } = useApp();

  const items = watchlist
    .map((item) => {
      const stock = stocks.find((s) => s.symbol === item.symbol);
      if (!stock) return null;
      const rec = generateRecommendation(stock, riskProfile.preferredHorizon, riskProfile);
      return { item, stock, rec };
    })
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <PageHeader
        icon={StarIcon}
        title="Watchlist"
        description="Monitor stocks you're considering — add from the Dashboard or Scanner"
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{items.length} Watched Stocks</CardTitle>
          </CardHeader>
          <CardContent>
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
                          <p className="text-xs text-muted-foreground">{entry.stock.name}</p>
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
                        <TableCell className="tabular-nums text-primary">
                          ${entry.rec.targetPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="tabular-nums text-destructive">
                          ${entry.rec.stopLoss.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
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
