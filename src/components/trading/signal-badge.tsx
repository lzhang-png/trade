import type { Signal } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

const SIGNAL_LABELS: Record<Signal, string> = {
  strong_buy: "Strong Buy",
  buy: "Buy",
  hold: "Hold",
  sell: "Sell",
  strong_sell: "Strong Sell",
};

const SIGNAL_VARIANTS: Record<
  Signal,
  "default" | "secondary" | "outline" | "destructive"
> = {
  strong_buy: "default",
  buy: "default",
  hold: "secondary",
  sell: "destructive",
  strong_sell: "destructive",
};

export function SignalBadge({
  signal,
  className,
}: {
  signal: Signal;
  className?: string;
}) {
  return (
    <Badge variant={SIGNAL_VARIANTS[signal]} className={className}>
      {SIGNAL_LABELS[signal]}
    </Badge>
  );
}

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress value={score} className="h-2 flex-1" />
      <span className="w-10 text-sm font-mono text-muted-foreground">{score}</span>
    </div>
  );
}

export function PriceChange({
  change,
  changePercent,
  className,
}: {
  change: number;
  changePercent: number;
  className?: string;
}) {
  const positive = change >= 0;
  return (
    <Badge
      variant={positive ? "default" : "destructive"}
      className={cn("tabular-nums", className)}
    >
      {positive ? (
        <ArrowUpIcon data-icon="inline-start" />
      ) : (
        <ArrowDownIcon data-icon="inline-start" />
      )}
      {positive ? "+" : ""}
      {change.toFixed(2)} ({positive ? "+" : ""}
      {changePercent.toFixed(2)}%)
    </Badge>
  );
}
