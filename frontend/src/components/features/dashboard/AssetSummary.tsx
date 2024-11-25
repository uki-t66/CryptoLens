interface AssetSummaryItemProps {
    title: string;
    amount: string;
    change?: string;
    isPositive?: boolean;
  }
  
const AssetSummaryItem = ({ title, amount, change, isPositive }: AssetSummaryItemProps) => {
    return (
        <div className="flex flex-col justify-around my-2 h-[200px] 2xl:h-[230px] bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
          <h3 className="text-xl font-semibold 2xl:text-2xl text-white mb-2">{title}</h3>
          <div className="text-2xl font-bold text-white mb-2">{amount}</div>
          {/* 損益がプラスであればgreen,マイナスであればレッド */}
          {change && (
            <div className={`text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '△' : '▽'}{change}
            </div>
          )}
        </div>
    )
  }
  
export const AssetSummary = () => {
    return (
      <>
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
      </>
    )
  }
  
