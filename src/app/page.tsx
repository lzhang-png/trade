import { getAllStocks } from "@/lib/market-data";
import { rankStocks } from "@/lib/recommendation-engine";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  const stocks = getAllStocks();
  const shortTermPicks = rankStocks(stocks, "short").slice(0, 4);
  const midTermPicks = rankStocks(stocks, "mid").slice(0, 4);

  return (
    <DashboardView
      stocks={stocks}
      shortTermPicks={shortTermPicks}
      midTermPicks={midTermPicks}
    />
  );
}
