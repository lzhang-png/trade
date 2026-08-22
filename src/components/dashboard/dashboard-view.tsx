"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecommendationCard } from "@/components/trading/recommendation-card";
import { PriceChange } from "@/components/trading/signal-badge";
import { PageHeader } from "@/components/layout/page-header";
import { useApp } from "@/lib/app-context";
import type { Recommendation, Stock } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

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
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description={`Your trading command center — ${riskProfile.preferredHorizon === "short" ? "short-term" : "mid-term"} focus`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          value={gainers[0]?.symbol ?? "—"}
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

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary" />
          <h2 className="text-lg font-semibold">Short-Term Picks (1–4 weeks)</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {shortTermPicks.map((rec) => (
            <RecommendationCard key={rec.symbol} rec={rec} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Activity className="text-primary" />
          <h2 className="text-lg font-semibold">Mid-Term Picks (1–6 months)</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {midTermPicks.map((rec) => (
            <RecommendationCard key={`mid-${rec.symbol}`} rec={rec} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <MoversCard title="Top Gainers" stocks={gainers} icon={ArrowUpRight} />
        <MoversCard title="Top Losers" stocks={losers} icon={ArrowDownRight} />
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
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <Icon className="text-muted-foreground" />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {sub && (
        <CardContent className="pt-0">
          <Badge
            variant={
              positive === undefined
                ? "outline"
                : positive
                  ? "default"
                  : "destructive"
            }
          >
            {sub}
          </Badge>
        </CardContent>
      )}
    </Card>
  );
}

function MoversCard({
  title,
  stocks,
  icon: Icon,
}: {
  title: string;
  stocks: Stock[];
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{stock.symbol}</p>
              <p className="text-xs text-muted-foreground">{stock.name}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-medium tabular-nums">${stock.price.toFixed(2)}</p>
              <PriceChange change={stock.change} changePercent={stock.changePercent} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
