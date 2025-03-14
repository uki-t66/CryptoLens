export interface Asset {
    asset: string;
    image: string;
    amount: number;
    averageCost: number;
    currentPrice: number;
    totalValue: number;
    change24h: string; 
    profitLossRate: string;
    profitLossAmount: number;
    totalRealizedProfitLoss: string;
  }
  
export interface AssetSummaryProps {
    JPY: number;  
    Assets: Asset[]; 
}
  