// src/components/AssetField.tsx
import { useAssetSummary } from "./useAssetSummary";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import toast from "react-hot-toast";

export const AssetField = () => {
  // Contextから assets を取得
  const { assets } = useAssetSummary();

  // 「amount が 0 でない」資産だけを対象にする
  const filteredAssets = assets.filter((a) => a.amount !== 0);

  // 総ポートフォリオ評価額
  const totalPortfolioValue = filteredAssets.reduce((acc, cur) => acc + cur.totalValue, 0);

  // 評価額の大きい順にソート
  const sortedAssets = [...filteredAssets].sort((a, b) => b.totalValue - a.totalValue);

  return (
    <div className="mx-10 h-[88%] relative bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-auto">
      <Table>
        <TableCaption>Crypto Currency Portfolio</TableCaption>
        <TableHeader className="sticky top-0 bg-gray-800">
          <TableRow className="pointer-events-none border-gray-700">
            <TableHead className="text-gray-200 font-medium">Rank</TableHead>
            <TableHead className="text-gray-200 font-medium">Asset</TableHead>
            <TableHead className="text-gray-200 font-medium">Price</TableHead>
            <TableHead className="text-gray-200 font-medium">24h Change</TableHead>
            <TableHead className="text-gray-200 font-medium">Amount</TableHead>
            <TableHead className="text-gray-200 font-medium">Value</TableHead>
            <TableHead className="text-gray-200 font-medium">Allocation</TableHead>
            <TableHead className="text-gray-200 font-medium">Avg. Cost</TableHead>
            <TableHead className="text-gray-200 font-medium">Profit / Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAssets.map((asset, idx) => {
            const rank = idx + 1;
            const allocation = totalPortfolioValue > 0
              ? ((asset.totalValue / totalPortfolioValue) * 100).toFixed(2)
              : "0.00";

            return (
              <TableRow key={asset.asset} className="border-gray-700">
                {/* Rank */}
                <TableCell>{rank}</TableCell>
                {/* Asset */}
                <TableCell>
                  <img src={asset.image} alt={asset.asset} width={24} height={24} className="inline-block mr-2" />
                  {asset.asset.toUpperCase()}
                </TableCell>
                <TableCell>${asset.currentPrice.toFixed(2)}</TableCell>
                <TableCell
                  className={
                    asset.change24h.startsWith("+") ? "text-green-500" : "text-red-500"
                  }
                >
                  {asset.change24h}
                </TableCell>
                <TableCell>{asset.amount}</TableCell>
                <TableCell>${asset.totalValue.toFixed(2)}</TableCell>
                <TableCell>{allocation}%</TableCell>
                <TableCell>${asset.averageCost.toFixed(2)}</TableCell>
                <TableCell
                  className={
                    asset.profitLossRate.startsWith("+") ? "text-green-500" : "text-red-500"
                  }
                >
                  {asset.profitLossRate} (${asset.profitLossAmount.toFixed(2)})
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
