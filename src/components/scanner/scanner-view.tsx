"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SignalBadge, ScoreBar, PriceChange } from "@/components/trading/signal-badge";
import { rankStocks } from "@/lib/recommendation-engine";
import { useApp } from "@/lib/app-context";
import type { Signal, Stock, TimeHorizon } from "@/lib/types";
import { Search } from "lucide-react";

const SIGNAL_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Signals" },
  { value: "strong_buy", label: "Strong Buy" },
  { value: "buy", label: "Buy" },
  { value: "hold", label: "Hold" },
  { value: "sell", label: "Sell" },
  { value: "strong_sell", label: "Strong Sell" },
];

export function ScannerView({ stocks }: { stocks: Stock[] }) {
  const { riskProfile } = useApp();
  const [query, setQuery] = useState("");
  const [horizon, setHorizon] = useState<TimeHorizon>(riskProfile.preferredHorizon);
  const [signalFilter, setSignalFilter] = useState("all");
  const [sector, setSector] = useState("all");

  const recommendations = useMemo(
    () => rankStocks(stocks, horizon, riskProfile),
    [stocks, horizon, riskProfile]
  );

  const filtered = useMemo(() => {
    return recommendations.filter((rec) => {
      const stock = stocks.find((s) => s.symbol === rec.symbol);
      if (query && !rec.symbol.toLowerCase().includes(query.toLowerCase()) &&
          !rec.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (signalFilter !== "all" && rec.signal !== signalFilter) return false;
      if (sector !== "all" && stock?.sector !== sector) return false;
      return true;
    });
  }, [recommendations, stocks, query, signalFilter, sector]);

  const sectors = [...new Set(stocks.map((s) => s.sector))];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Scan {stocks.length} assets for buy and sell opportunities
        </p>
      </div>

      <Card className="border-border/60">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search symbol or name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={horizon} onValueChange={(v) => setHorizon(v as TimeHorizon)}>
              <TabsList>
                <TabsTrigger value="short">Short-term</TabsTrigger>
                <TabsTrigger value="mid">Mid-term</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={signalFilter} onValueChange={setSignalFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIGNAL_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} Results — sorted by conviction score
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                <TableHead>Stop Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rec) => (
                <TableRow key={rec.symbol}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{rec.symbol}</p>
                      <p className="text-xs text-muted-foreground">{rec.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">${rec.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {(() => {
                      const s = stocks.find((x) => x.symbol === rec.symbol);
                      return s ? (
                        <PriceChange change={s.change} changePercent={s.changePercent} />
                      ) : null;
                    })()}
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
                  <TableCell className="tabular-nums text-emerald-400">
                    ${rec.targetPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="tabular-nums text-red-400">
                    ${rec.stopLoss.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
