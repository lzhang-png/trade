import { getAllStocks } from "@/lib/market-data";
import { WatchlistView } from "@/components/watchlist/watchlist-view";

export default function WatchlistPage() {
  const stocks = getAllStocks();
  return <WatchlistView stocks={stocks} />;
}
