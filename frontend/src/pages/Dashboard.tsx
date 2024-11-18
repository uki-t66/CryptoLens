import { AssetSummary } from '../components/features/dashboard/AssetSummary'
import { AssetChart } from '../components/features/dashboard/AssetChart';
import { AssetDistribution } from '../components/features/dashboard/AssetDistribution';
import { Header } from '../components/layout/Header';

export const Dashboard = () => {
    return (
      <div className='flex flex-col'>
        {/* ページヘッダー */}
        <Header headerTitle={ "Dashboard" }/>
        {/* 総資産サマリー */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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