import { getAllStocks } from "@/lib/market-data";
import { PortfolioView } from "@/components/portfolio/portfolio-view";

export default function PortfolioPage() {
  const stocks = getAllStocks();
  return <PortfolioView stocks={stocks} />;
}
