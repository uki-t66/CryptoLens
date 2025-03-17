import { ChartData } from '@/context/AssetSummaryContext';
import { Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDetail } from './ChartDetail';
import { useState } from 'react';



export const AssetChart: React.FC<ChartData[]>  = ({ ChartData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
      setIsOpen(!isOpen);
  }


  

  return (
    <div className="w-[72%] h-full bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <div className='flex'>
        <h2 className="text-lg 2xl:text-2xl font-semibold text-white mb-1 mr-4">総資産推移</h2>
        <h2 className='text-white cursor-pointer'>
          <Info className=' hover:text-gray-400 cursor-pointer transition-colors duration-300' size={25} onClick={handleClick}/>
          <ChartDetail open={isOpen} onClose={() => setIsOpen(!isOpen)}/>
        </h2>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={ChartData}>
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
            tickFormatter={(date) => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`; // "MM/DD" 表示
            }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', dx: -2 }}
            tickFormatter={(value) => {
              if (value >= 1_000_000_000) {
                return `$${(value / 1_000_000_000).toFixed(1)}B`;
              } else if (value >= 1_000_000) {
                return `$${(value / 1_000_000).toFixed(1)}M`;
              } else if (value >= 1_000) {
                return `$${(value / 10000).toFixed(1)}k`;
              }
              return `$${value.toLocaleString()}`;
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#f3f4f6'
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '総資産']}
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