"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/lib/app-context";
import { MarketDataProvider } from "@/lib/market-data-context";
import { MarketDataSync } from "@/components/market-data-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <AppProvider>
          <MarketDataProvider>
            <MarketDataSync />
            {children}
            <Toaster richColors position="top-center" />
          </MarketDataProvider>
        </AppProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
