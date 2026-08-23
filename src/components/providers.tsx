"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/lib/app-context";
import { MarketDataProvider } from "@/lib/market-data-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <AppProvider>
          <MarketDataProvider>
            {children}
            <Toaster richColors position="top-center" />
          </MarketDataProvider>
        </AppProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
