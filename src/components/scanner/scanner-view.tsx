"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SignalBadge, ScoreBar, PriceChange } from "@/components/trading/signal-badge";
import { PageHeader } from "@/components/layout/page-header";
import { LiveDataBadge } from "@/components/trading/live-data-badge";
import { rankStocks } from "@/lib/recommendation-engine";
import { useApp } from "@/lib/app-context";
import { useMarketData } from "@/lib/market-data-context";
import type { TimeHorizon } from "@/lib/types";
import { SearchIcon, ScanSearchIcon } from "lucide-react";

const SIGNAL_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Signals" },
  { value: "strong_buy", label: "Strong Buy" },
  { value: "buy", label: "Buy" },
  { value: "hold", label: "Hold" },
  { value: "sell", label: "Sell" },
  { value: "strong_sell", label: "Strong Sell" },
];

export function ScannerView() {
  const { riskProfile } = useApp();
  const { stocks } = useMarketData();
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
      if (
        query &&
        !rec.symbol.toLowerCase().includes(query.toLowerCase()) &&
        !rec.name.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (signalFilter !== "all" && rec.signal !== signalFilter) return false;
      if (sector !== "all" && stock?.sector !== sector) return false;
      return true;
    });
  }, [recommendations, stocks, query, signalFilter, sector]);

  const sectors = [...new Set(stocks.map((s) => s.sector))];

  return (
    <div className="page-container">
      <PageHeader
        icon={ScanSearchIcon}
        title="Market Scanner"
        description={`Scan ${stocks.length} assets for buy and sell opportunities`}
        action={<LiveDataBadge />}
      />

      <Card className="shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-6">
            <InputGroup className="min-w-[200px] flex-1">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search symbol or name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
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
                <SelectGroup>
                  {SIGNAL_FILTERS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {filtered.length} Results — sorted by conviction score
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
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
                    <p className="font-semibold">{rec.symbol}</p>
                      <p className="text-sm text-muted-foreground">{rec.name}</p>
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
                  <TableCell className="tabular-nums">{rec.indicators.rsi.toFixed(0)}</TableCell>
                  <TableCell className="tabular-nums">${rec.targetPrice.toFixed(2)}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
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
