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
    <SidebarProvider className="text-base">
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="h-auto py-3">
                <Link href="/">
                  <div className="flex size-9 items-center justify-center rounded-lg border bg-background">
                    <TrendingUp />
                  </div>
                  <div className="flex flex-col gap-1 leading-none">
                    <span className="text-base font-semibold">TradeWise</span>
                    <span className="text-sm text-muted-foreground">Trading Consultant</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup className="py-2">
            <SidebarGroupLabel className="px-3 text-sm">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {NAV.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, href)}
                      tooltip={label}
                      className="h-10 px-3 text-base"
                    >
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

        <SidebarFooter className="p-4">
          <Alert className="py-3">
            <Info />
            <AlertDescription className="text-sm leading-relaxed">
              Not financial advice. For educational purposes only.
            </AlertDescription>
          </Alert>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2 md:hidden">
            <TrendingUp />
            <span className="text-base font-semibold">TradeWise</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
