import { getAllStocks } from "@/lib/market-data";
import { ScannerView } from "@/components/scanner/scanner-view";

export default function ScannerPage() {
  const stocks = getAllStocks();
  return <ScannerView stocks={stocks} />;
}
