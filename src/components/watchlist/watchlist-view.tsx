"use client";

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
import { SignalBadge, PriceChange } from "@/components/trading/signal-badge";
import { generateRecommendation } from "@/lib/recommendation-engine";
import { useApp } from "@/lib/app-context";
import type { Stock } from "@/lib/types";
import { Star, Trash2 } from "lucide-react";

export function WatchlistView({ stocks }: { stocks: Stock[] }) {
  const { watchlist, removeFromWatchlist, riskProfile } = useApp();

  const items = watchlist.map((item) => {
    const stock = stocks.find((s) => s.symbol === item.symbol);
    if (!stock) return null;
    const rec = generateRecommendation(stock, riskProfile.preferredHorizon, riskProfile);
    return { item, stock, rec };
  }).filter(Boolean);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor stocks you&apos;re considering — add from the Dashboard or Scanner
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="border-border/60 border-dashed">
          <CardContent className="py-16 text-center">
            <Star className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Your watchlist is empty. Click &quot;Watchlist&quot; on any recommendation card to add stocks.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
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
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((entry) => entry && (
                  <TableRow key={entry.item.symbol}>
                    <TableCell>
                      <p className="font-semibold">{entry.stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{entry.stock.name}</p>
                    </TableCell>
                    <TableCell className="tabular-nums">${entry.stock.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <PriceChange change={entry.stock.change} changePercent={entry.stock.changePercent} />
                    </TableCell>
                    <TableCell>
                      <SignalBadge signal={entry.rec.signal} />
                    </TableCell>
                    <TableCell className="tabular-nums text-emerald-400">
                      ${entry.rec.targetPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="tabular-nums text-red-400">
                      ${entry.rec.stopLoss.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(entry.item.addedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromWatchlist(entry.item.symbol)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
