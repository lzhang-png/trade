"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationCard } from "@/components/trading/recommendation-card";
import { PriceChange } from "@/components/trading/signal-badge";
import { useApp } from "@/lib/app-context";
import type { Recommendation, Stock } from "@/lib/types";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface DashboardViewProps {
  stocks: Stock[];
  shortTermPicks: Recommendation[];
  midTermPicks: Recommendation[];
}

export function DashboardView({
  stocks,
  shortTermPicks,
  midTermPicks,
}: DashboardViewProps) {
  const { portfolio, riskProfile } = useApp();

  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  const portfolioValue = portfolio.reduce((sum, pos) => {
    const stock = stocks.find((s) => s.symbol === pos.symbol);
    return sum + (stock ? stock.price * pos.shares : 0);
  }, 0);

  const portfolioCost = portfolio.reduce((sum, pos) => sum + pos.avgCost * pos.shares, 0);
  const portfolioPnL = portfolioValue - portfolioCost;
  const portfolioPnLPct = portfolioCost > 0 ? (portfolioPnL / portfolioCost) * 100 : 0;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your trading command center — {riskProfile.preferredHorizon === "short" ? "short-term" : "mid-term"} focus
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Portfolio Value"
          value={`$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={portfolio.length > 0 ? `${portfolio.length} positions` : "No positions yet"}
        />
        <StatCard
          icon={portfolioPnL >= 0 ? TrendingUp : TrendingDown}
          label="Total P&L"
          value={`${portfolioPnL >= 0 ? "+" : ""}$${portfolioPnL.toFixed(2)}`}
          sub={`${portfolioPnLPct >= 0 ? "+" : ""}${portfolioPnLPct.toFixed(2)}%`}
          positive={portfolioPnL >= 0}
        />
        <StatCard
          icon={Activity}
          label="Market Movers"
          value={`${gainers[0]?.symbol ?? "—"}`}
          sub={gainers[0] ? `+${gainers[0].changePercent.toFixed(2)}% today` : ""}
          positive
        />
        <StatCard
          icon={TrendingUp}
          label="Top Pick"
          value={shortTermPicks[0]?.symbol ?? "—"}
          sub={shortTermPicks[0] ? `Score: ${shortTermPicks[0].score}` : ""}
          positive
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Short-Term Picks (1–4 weeks)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {shortTermPicks.map((rec) => (
            <RecommendationCard key={rec.symbol} rec={rec} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Mid-Term Picks (1–6 months)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {midTermPicks.map((rec) => (
            <RecommendationCard key={`mid-${rec.symbol}`} rec={rec} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoversCard title="Top Gainers" stocks={gainers} positive />
        <MoversCard title="Top Losers" stocks={losers} positive={false} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  positive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sub && (
          <p
            className={`text-xs mt-1 ${
              positive === undefined
                ? "text-muted-foreground"
                : positive
                  ? "text-emerald-400"
                  : "text-red-400"
            }`}
          >
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MoversCard({
  title,
  stocks,
  positive,
}: {
  title: string;
  stocks: Stock[];
  positive: boolean;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{stock.symbol}</p>
              <p className="text-xs text-muted-foreground">{stock.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium tabular-nums">${stock.price.toFixed(2)}</p>
              <PriceChange change={stock.change} changePercent={stock.changePercent} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
