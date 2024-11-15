import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetChartData {
  date: string;
  value: number;
}

const data: AssetChartData[] = [
  { date: '6/1', value: 2400000 },
  { date: '6/2', value: 2500000 },
  { date: '6/3', value: 2300000 },
  { date: '6/4', value: 2800000 },
  { date: '6/5', value: 2700000 },
  { date: '6/6', value: 3100000 },
  { date: '6/7', value: 3300000 },
];

export const AssetChart = () => {
  return (
    <div className="w-full h-[350px] 2xl:h-[500px] bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4">資産推移</h2>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', dy: 10 }} 
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', dx : -2 }}
            tickFormatter={(value) => `¥${(value/10000).toLocaleString()}万`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#f3f4f6'
            }}
            formatter={(value: number) => [`¥${value.toLocaleString()}`, '資産額']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            fill="url(#colorValue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
