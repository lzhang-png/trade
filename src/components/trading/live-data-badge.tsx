"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarketData } from "@/lib/market-data-context";
import { RadioIcon, RefreshCwIcon, WifiOffIcon } from "lucide-react";

export function LiveDataBadge() {
  const { live, loading, error, updatedAt, refresh } = useMarketData();

  const timeLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex items-center gap-3">
      {live ? (
        <Badge variant="default" className="gap-2 px-3 py-1 text-sm">
          <RadioIcon className="animate-pulse" />
          Live · Finnhub
          {timeLabel && <span className="opacity-70">· {timeLabel}</span>}
        </Badge>
      ) : error ? (
        <Badge variant="destructive" className="gap-2 px-3 py-1 text-sm">
          <WifiOffIcon />
          Offline
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
          <WifiOffIcon />
          Demo data
        </Badge>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => void refresh()}
        disabled={loading}
        aria-label="Refresh market data"
      >
        <RefreshCwIcon className={loading ? "animate-spin" : undefined} />
      </Button>
    </div>
  );
}
