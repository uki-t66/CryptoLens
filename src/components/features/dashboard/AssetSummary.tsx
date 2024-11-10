interface AssetSummaryItemProps {
    title: string;
    amount: string;
    change?: string;
    isPositive?: boolean;
  }
  
const AssetSummaryItem = ({ title, amount, change, isPositive }: AssetSummaryItemProps) => {
    return (
      <div className=" bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
        <h3 className="text-lg text-white mb-2">{title}</h3>
        <div className="text-2xl font-bold text-white mb-2">{amount}</div>
        {/* 損益がプラスであればgreen,マイナスであればレッド */}
        {change && (
          <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '△' : '▽'}{change}
          </div>
        )}
      </div>
    )
  }
  
export const AssetSummary = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AssetSummaryItem 
          title="総資産"
          amount="¥2,547,892"
          change="12.5%"
          isPositive={true}
        />
        <AssetSummaryItem 
          title="24h損益"
          amount="¥125,430"
          change="5.2%"
          isPositive={true}
        />
        <AssetSummaryItem 
          title="月間損益"
          amount="¥45,892"
          change="1.8%"
          isPositive={false}
        />
      </div>
    )
  }
  
