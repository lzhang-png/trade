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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scanner", label: "Scanner", icon: Search },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/consultant", label: "AI Consultant", icon: MessageSquare },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">TradeWise</p>
          <p className="text-[10px] text-muted-foreground">Trading Consultant</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
      <div className="border-t border-border p-4">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Not financial advice. For educational purposes only. Always do your own research.
        </p>
      </div>
    </aside>
  );
}
