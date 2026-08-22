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
  Info,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scanner/", label: "Scanner", icon: Search },
  { href: "/portfolio/", label: "Portfolio", icon: Briefcase },
  { href: "/consultant/", label: "AI Consultant", icon: MessageSquare },
  { href: "/watchlist/", label: "Watchlist", icon: Star },
  { href: "/settings/", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname === "";
  return pathname.startsWith(href.replace(/\/$/, ""));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <TrendingUp />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">TradeWise</span>
                    <span className="text-xs text-muted-foreground">Trading Consultant</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isActive(pathname, href)} tooltip={label}>
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <Alert>
            <Info />
            <AlertDescription className="text-xs">
              Not financial advice. For educational purposes only.
            </AlertDescription>
          </Alert>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 md:hidden">
            <TrendingUp className="text-primary" />
            <span className="text-sm font-semibold">TradeWise</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
