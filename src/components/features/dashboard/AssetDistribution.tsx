import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'BTC', value: 1500000, color: '#3b82f6' },
  { name: 'ETH', value: 800000, color: '#34d399' },
  { name: 'USDT', value: 500000, color: '#f59e0b' },
  { name: 'その他', value: 200000, color: '#ec4899' },
];

export const AssetDistribution = () => {
  return (
    <div className="w-full h-[400px] bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4">資産配分</h2>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              // 他の要素のkeyと衝突させないためにcell-というプレフィックスをつける
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#FFFFFF'
            }}
            itemStyle={{ color: '#ffffff' }}
            formatter={(value: number, name: string) => [`¥${value.toLocaleString()}`, name]}
          />
          <Legend 
            height={36}
            content={({ payload }) => (
              <ul className="flex justify-center gap-4 text-sm text-white">
                {payload?.map((entry, index) => (
                  <li key={`legend-${index}`} className="flex items-center gap-2">
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