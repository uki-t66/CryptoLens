import { AssetSummary } from '../components/features/dashboard/AssetSummary'
import { AssetChart } from '../components/features/dashboard/AssetChart';
import { AssetDistribution } from '../components/features/dashboard/AssetDistribution';
import { Header } from '../components/layout/Header';
import { useAssetSummary } from '@/components/features/assetManagement/useAssetSummary';

export const Dashboard = () => {

  const { assets,totalRealizedProfitLoss, jpy, chartData } = useAssetSummary();

  // 「amount が 0 でない」資産だけを対象にする
  const filteredAssets = assets.filter((a) => a.amount !== 0);

    

    return (
      <div className='flex flex-col h-full'>
        
        {/* ページヘッダー */}
        <Header headerTitle={ "Dashboard" }/>

        {/* 総資産サマリー */}
        <div className="mx-10 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <AssetSummary JPY={jpy} Assets={filteredAssets} TRPL={totalRealizedProfitLoss} />
        </div>

         {/* グラフセクション */}
        <div className="mx-10 h-full flex gap-8 overflow-auto">
            <AssetChart data={chartData} />
            <AssetDistribution />
        </div>
      </div>
  );
};