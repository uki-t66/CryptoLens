import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";


interface Asset {
  asset: string;           // 通貨シンボル (例: BTC, ETH)
  amount: number;          // 保有量
  averageCost: number;     // 平均取得単価
  currentPrice: number;    // 現在の価格
  totalValue: number;      // 評価額
  change24h: string;       // 24hの変動率 (例: "+2.34%")
  profitLossRate: string;  // 含み損益率 (例: "+3.33%")
  profitLossAmount: number;// 含み損益額 (例: 2500)
}

const API_URL = import.meta.env.VITE_API_URL;

export const AssetField = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  const fetchAssets = async () => {
    try {
      // バックエンドから資産サマリを取得
      const response = await fetch(`${API_URL}/transactions/summary`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        toast.error('資産データの取得に失敗しました。',{
          duration: 5000,
          position: 'top-center',
        });
      }

      const data = await response.json();

      // ここでは一旦そのままセットし、ソートやポートフォリオ比率計算はあとで行う
      setAssets(data.summary);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  useEffect(() => {
    console.log("レンダリングされました")

    fetchAssets();

    // カスタムイベントをリッスン。TxHistoryが更新されたらAssetFieldも更新させるため。
    const handleTransactionsChanged = () => {
      fetchAssets();
    };
    window.addEventListener("transactionsChanged", handleTransactionsChanged);

    return () => {
      window.removeEventListener("transactionsChanged", handleTransactionsChanged);
    };
  }, []);

  // -----------------------------
  // 追加: 「総ポートフォリオ評価額」を計算
  // -----------------------------
  const totalPortfolioValue = assets.reduce((acc, cur) => acc + cur.totalValue, 0);

  // -----------------------------
  // 追加: 評価額の大きい順にソートして Rank を振る
  // -----------------------------
  const sortedAssets = [...assets].sort((a, b) => b.totalValue - a.totalValue);

  // これで最も評価額の大きい資産が先頭になる (Rank1)

  return (
    <div className="mx-10 h-[88%] relative bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-auto">
      <Table>
        <TableCaption>Crypto Currency Portfolio</TableCaption>
        {/* テーブルヘッダ */}
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
            // Rankはソート後のindex + 1
            const rank = idx + 1;
            // Allocationは (各資産の評価額 / 総評価額) × 100 (小数点以下2桁に丸め)
            const allocation =
              totalPortfolioValue > 0
                ? ((asset.totalValue / totalPortfolioValue) * 100).toFixed(2)
                : "0.00";

            return (
              <TableRow key={asset.asset} className="border-gray-700">
                {/* Rank */}
                <TableCell>{rank}</TableCell>

                {/* Asset シンボル */}
                <TableCell>{asset.asset}</TableCell>

                {/* 現在価格 */}
                <TableCell>${asset.currentPrice.toFixed(2)}</TableCell>

                {/* 24h変動率 */}
                <TableCell
                  className={
                    asset.change24h.startsWith("+") ? "text-green-500" : "text-red-500"
                  }
                >
                  {asset.change24h}
                </TableCell>

                {/* 保有数量 */}
                <TableCell>{asset.amount}</TableCell>

                {/* 評価額 */}
                <TableCell>${asset.totalValue.toFixed(2)}</TableCell>

                {/* Allocation (％表示) */}
                <TableCell>{allocation}%</TableCell>

                {/* 平均取得単価 */}
                <TableCell>${asset.averageCost.toFixed(2)}</TableCell>

                {/* Profit/Loss (率 + 金額) */}
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