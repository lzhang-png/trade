"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/lib/app-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <AppProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AppProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
