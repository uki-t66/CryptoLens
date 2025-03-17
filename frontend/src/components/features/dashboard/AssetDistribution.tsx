import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from 'recharts';
import { useAssetSummary } from '../assetManagement/useAssetSummary';

// カラー配列（グラフの色）
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF5E78'];

export const AssetDistribution = () => {
  // Contextから assets を取得
  const { assets } = useAssetSummary();

  // 「amount が 0 でない」資産だけを対象にする
  const filteredAssets = assets.filter((a) => a.amount !== 0);

  // 総ポートフォリオ評価額
  const totalPortfolioValue = filteredAssets.reduce((acc, cur) => acc + cur.totalValue, 0);

  // 各銘柄のポートフォリオ内の割合（allocation）を計算（数値型に変換）
  const allocations = filteredAssets.map((asset) => ({
    name: asset.asset.toUpperCase(), // グラフに表示する銘柄名（BTC, ETH など）
    totalValue: asset.totalValue, // 通貨の合計価値
    allocation: totalPortfolioValue > 0 ? Number(((asset.totalValue / totalPortfolioValue) * 100).toFixed(2)) : 0, // 数値型に変換
    currentPrice: asset.currentPrice, // 現在の価格を追加
  }));


  // **カスタムツールチップ関数**
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 p-3 rounded-md border border-gray-700 text-white text-sm shadow-md">
          <p className="font-semibold text-lg">{data.name}</p>
          <p>評価額: <span className="font-semibold">${data.totalValue.toLocaleString()}</span></p>
          <p>割合: <span className="font-semibold">{data.allocation}%</span></p>
          <p>現在価格: <span className="font-semibold">${data.currentPrice.toLocaleString()}</span></p> {/* ✅ 追加 */}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-[35%] h-full bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="text-lg 2xl:text-2xl font-semibold text-white mb-4">資産配分</h2>
      <ResponsiveContainer width="100%" height="90%">
        {/* 円グラフ */}
        <PieChart>
          <Pie
            data={allocations}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="allocation"
            nameKey="name"
          >
            {allocations.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {/* グラフのセクションにカーソルを合わせた際に表示される内容を設定 */}
          <Tooltip content={<CustomTooltip />} />
          {/* 円グラフ下の通貨を設定 */}
          <Legend
            height={36}
            content={({ payload }) => (
              <ul className="flex justify-center gap-4 text-sm text-white">
                {payload?.map((entry) => (
                  <li key={`legend-${entry.value}`} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.value}
                  </li>
                ))}
              </ul>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
