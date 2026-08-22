"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SignalBadge } from "@/components/trading/signal-badge";
import { PageHeader } from "@/components/layout/page-header";
import { generatePortfolioAdvice } from "@/lib/recommendation-engine";
import { useApp } from "@/lib/app-context";
import type { Stock, TimeHorizon } from "@/lib/types";
import {
  BriefcaseIcon,
  PlusIcon,
  Trash2Icon,
  HashIcon,
  DollarSignIcon,
} from "lucide-react";

export function PortfolioView({ stocks }: { stocks: Stock[] }) {
  const { portfolio, addPosition, removePosition } = useApp();
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [horizon, setHorizon] = useState<TimeHorizon>("mid");

  const positions = portfolio
    .map((pos) => {
      const stock = stocks.find((s) => s.symbol === pos.symbol);
      if (!stock) return null;
      const advice = generatePortfolioAdvice(pos, stock, pos.horizon);
      return { position: pos, stock, advice };
    })
    .filter(Boolean);

  const totalValue =
    positions.reduce((sum, p) => sum! + p!.stock.price * p!.position.shares, 0) ?? 0;
  const totalCost =
    positions.reduce((sum, p) => sum! + p!.position.avgCost * p!.position.shares, 0) ?? 0;
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
    toast.success(`${stock.symbol} added to portfolio`);
    setOpen(false);
    setSymbol("");
    setShares("");
    setAvgCost("");
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <PageHeader
        icon={BriefcaseIcon}
        title="Portfolio"
        description="Track positions and get sell/hold recommendations"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon data-icon="inline-start" />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Position</DialogTitle>
                <DialogDescription>
                  Enter your trade details to track performance and get sell advice.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="symbol">Symbol</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <HashIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="symbol"
                      placeholder="e.g. AAPL"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                    />
                  </InputGroup>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="shares">Shares</FieldLabel>
                    <InputGroupInput
                      id="shares"
                      type="number"
                      placeholder="10"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="avgCost">Avg Cost ($)</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <DollarSignIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="avgCost"
                        type="number"
                        placeholder="150.00"
                        value={avgCost}
                        onChange={(e) => setAvgCost(e.target.value)}
                      />
                    </InputGroup>
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Time Horizon</FieldLabel>
                  <Select value={horizon} onValueChange={(v) => setHorizon(v as TimeHorizon)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short-term (1–4 weeks)</SelectItem>
                      <SelectItem value="mid">Mid-term (1–6 months)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button onClick={handleAdd} className="w-full sm:w-auto">
                  <PlusIcon data-icon="inline-start" />
                  Add to Portfolio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">${totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">${totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold tabular-nums ${totalPnL >= 0 ? "text-primary" : "text-destructive"}`}
            >
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {positions.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BriefcaseIcon />
            </EmptyMedia>
            <EmptyTitle>No positions yet</EmptyTitle>
            <EmptyDescription>
              Add your first trade to get personalized sell and hold recommendations.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Add Position
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Card>
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
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map(
                  (p) =>
                    p && (
                      <TableRow key={p.position.id}>
                        <TableCell>
                          <p className="font-semibold">{p.position.symbol}</p>
                          <p className="text-xs text-muted-foreground">{p.position.name}</p>
                        </TableCell>
                        <TableCell>{p.position.shares}</TableCell>
                        <TableCell className="tabular-nums">
                          ${p.position.avgCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="tabular-nums">${p.stock.price.toFixed(2)}</TableCell>
                        <TableCell
                          className={`tabular-nums ${p.advice.gainLoss >= 0 ? "text-primary" : "text-destructive"}`}
                        >
                          {p.advice.gainLoss >= 0 ? "+" : ""}${p.advice.gainLoss.toFixed(2)}
                          <span className="ml-1 text-xs">
                            ({p.advice.gainLossPercent >= 0 ? "+" : ""}
                            {p.advice.gainLossPercent.toFixed(1)}%)
                          </span>
                        </TableCell>
                        <TableCell>
                          <SignalBadge signal={p.advice.signal} />
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate text-xs text-muted-foreground">
                            {p.advice.reasons[0] ?? p.advice.risks[0] ?? "—"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              removePosition(p.position.id);
                              toast.info(`${p.position.symbol} removed from portfolio`);
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
