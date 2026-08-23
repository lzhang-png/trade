"use client";

import { ThemeProvider } from "next-themes";
import { MarketDataProvider } from "@/lib/market-data-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <MarketDataProvider>{children}</MarketDataProvider>
    </ThemeProvider>
  );
}
