"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarketData } from "@/lib/market-data-context";
import { RadioIcon, RefreshCwIcon, WifiOffIcon } from "lucide-react";

export function LiveDataBadge() {
  const { live, loading, enriching, error, updatedAt, refresh } = useMarketData();

  const timeLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex items-center gap-3">
      {loading && !live ? (
        <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
          <RefreshCwIcon className="animate-spin" />
          Loading market data…
        </Badge>
      ) : live ? (
        <Badge variant="default" className="gap-2 px-3 py-1 text-sm">
          <RadioIcon className={enriching ? undefined : "animate-pulse"} />
          {enriching ? "Live · loading details" : "Live data"}
          {timeLabel && <span className="opacity-70">· {timeLabel}</span>}
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-2 px-3 py-1 text-sm">
          <WifiOffIcon />
          {error ?? "Offline"}
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
