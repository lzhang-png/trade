"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  MessageSquare,
  Star,
  Settings,
  TrendingUp,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scanner/", label: "Scanner", icon: Search },
  { href: "/portfolio/", label: "Portfolio", icon: Briefcase },
  { href: "/consultant/", label: "AI Consultant", icon: MessageSquare },
  { href: "/watchlist/", label: "Watchlist", icon: Star },
  { href: "/settings/", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 p-4">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" || pathname === "" : pathname.startsWith(href.replace(/\/$/, ""));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
        <span className="text-sm font-bold">TradeWise</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle className="flex items-center gap-2 text-left">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              TradeWise
            </SheetTitle>
          </SheetHeader>
          <NavLinks onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card shrink-0">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">TradeWise</p>
          <p className="text-[10px] text-muted-foreground">Trading Consultant</p>
        </div>
      </div>
      <NavLinks />
      <div className="border-t border-border p-4">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Not financial advice. For educational purposes only.
        </p>
      </div>
    </aside>
  );
}
