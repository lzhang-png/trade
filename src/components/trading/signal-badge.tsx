import type { Signal } from "@/lib/types";
import { cn } from "@/lib/utils";

const SIGNAL_STYLES: Record<Signal, string> = {
  strong_buy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  buy: "bg-green-500/15 text-green-400 border-green-500/30",
  hold: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  sell: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  strong_sell: "bg-red-500/15 text-red-400 border-red-500/30",
};

const SIGNAL_LABELS: Record<Signal, string> = {
  strong_buy: "Strong Buy",
  buy: "Buy",
  hold: "Hold",
  sell: "Sell",
  strong_sell: "Strong Sell",
};

export function SignalBadge({
  signal,
  className,
}: {
  signal: Signal;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        SIGNAL_STYLES[signal],
        className
      )}
    >
      {SIGNAL_LABELS[signal]}
    </span>
  );
}

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const color =
    score >= 60 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-8">{score}</span>
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
    <span
      className={cn(
        "text-sm font-medium tabular-nums",
        positive ? "text-emerald-400" : "text-red-400",
        className
      )}
    >
      {positive ? "+" : ""}
      {change.toFixed(2)} ({positive ? "+" : ""}
      {changePercent.toFixed(2)}%)
    </span>
  );
}
