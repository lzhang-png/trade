"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { SignalBadge } from "@/components/trading/signal-badge";
import { generatePortfolioAdvice } from "@/lib/recommendation-engine";
import { useApp } from "@/lib/app-context";
import type { Stock, TimeHorizon } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

export function PortfolioView({ stocks }: { stocks: Stock[] }) {
  const { portfolio, addPosition, removePosition } = useApp();
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [horizon, setHorizon] = useState<TimeHorizon>("mid");

  const positions = portfolio.map((pos) => {
    const stock = stocks.find((s) => s.symbol === pos.symbol);
    if (!stock) return null;
    const advice = generatePortfolioAdvice(pos, stock, pos.horizon);
    return { position: pos, stock, advice };
  }).filter(Boolean);

  const totalValue = positions.reduce(
    (sum, p) => sum! + p!.stock.price * p!.position.shares,
    0
  ) ?? 0;
  const totalCost = positions.reduce(
    (sum, p) => sum! + p!.position.avgCost * p!.position.shares,
    0
  ) ?? 0;
  const totalPnL = totalValue - totalCost;

  function handleAdd() {
    const stock = stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (!stock || !shares || !avgCost) return;
    addPosition({
      symbol: stock.symbol,
      name: stock.name,
      shares: parseFloat(shares),
      avgCost: parseFloat(avgCost),
      purchaseDate: new Date().toISOString().split("T")[0],
      horizon,
    });
    setOpen(false);
    setSymbol("");
    setShares("");
    setAvgCost("");
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track positions and get sell/hold recommendations
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Position</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Symbol</Label>
                <Input
                  placeholder="e.g. AAPL"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Shares</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Avg Cost ($)</Label>
                  <Input
                    type="number"
                    placeholder="150.00"
                    value={avgCost}
                    onChange={(e) => setAvgCost(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Time Horizon</Label>
                <Select value={horizon} onValueChange={(v) => setHorizon(v as TimeHorizon)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short-term (1–4 weeks)</SelectItem>
                    <SelectItem value="mid">Mid-term (1–6 months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Add to Portfolio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold tabular-nums">${totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-bold tabular-nums">${totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Unrealized P&L</p>
            <p className={`text-2xl font-bold tabular-nums ${totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {positions.length === 0 ? (
        <Card className="border-border/60 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No positions yet. Add your first trade to get personalized sell advice.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Holdings & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Avg Cost</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Advice</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((p) => p && (
                  <TableRow key={p.position.id}>
                    <TableCell>
                      <p className="font-semibold">{p.position.symbol}</p>
                      <p className="text-xs text-muted-foreground">{p.position.name}</p>
                    </TableCell>
                    <TableCell>{p.position.shares}</TableCell>
                    <TableCell className="tabular-nums">${p.position.avgCost.toFixed(2)}</TableCell>
                    <TableCell className="tabular-nums">${p.stock.price.toFixed(2)}</TableCell>
                    <TableCell className={`tabular-nums ${p.advice.gainLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {p.advice.gainLoss >= 0 ? "+" : ""}${p.advice.gainLoss.toFixed(2)}
                      <span className="text-xs ml-1">
                        ({p.advice.gainLossPercent >= 0 ? "+" : ""}{p.advice.gainLossPercent.toFixed(1)}%)
                      </span>
                    </TableCell>
                    <TableCell>
                      <SignalBadge signal={p.advice.signal} />
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-xs text-muted-foreground truncate">
                        {p.advice.reasons[0] ?? p.advice.risks[0] ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePosition(p.position.id)}
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
