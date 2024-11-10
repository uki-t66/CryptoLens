import { AssetSummary } from '../components/features/dashboard/AssetSummary'
import { AssetChart } from '../components/features/dashboard/AssetChart';
import { AssetDistribution } from '../components/features/dashboard/AssetDistribution';
// import { RecentTransactions } from '../components/features/dashboard/RecentTransactions';

export const Dashboard = () => {
    return (
      <div className="p-8 h-full w-full bg-gray-900">
        {/* ページヘッダー */}
        <div className="mb-8 ">
          <h1 className="text-2xl font-bold text-white bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">Dashboard</h1>
        </div>
  
        {/* 総資産サマリー */}
        <div className="mb-8">
            <AssetSummary />
        </div>
  
         {/* グラフセクション */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <AssetChart />
        </div>
        <div className='col-span-1'>
          <AssetDistribution />
        </div>
      </div>
    </div>
  );
};