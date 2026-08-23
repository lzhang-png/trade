"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { WatchlistSync } from "@/components/watchlist-sync";
import { MarketDataProvider } from "@/lib/market-data-context";
import { WatchlistProvider } from "@/lib/watchlist-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <WatchlistProvider>
        <MarketDataProvider>
          <WatchlistSync />
          {children}
          <Toaster richColors position="top-center" />
        </MarketDataProvider>
      </WatchlistProvider>
    </ThemeProvider>
  );
}
