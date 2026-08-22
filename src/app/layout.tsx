import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/app-context";
import { AppSidebar, MobileHeader } from "@/components/layout/app-sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeWise — AI Trading Consultant",
  description:
    "Smart buy and sell recommendations for short and mid-term investing. Technical analysis, portfolio tracking, and AI-powered guidance.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <TooltipProvider>
          <AppProvider>
            <div className="flex min-h-screen flex-col md:flex-row">
              <AppSidebar />
              <div className="flex flex-1 flex-col min-w-0">
                <MobileHeader />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </div>
          </AppProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
