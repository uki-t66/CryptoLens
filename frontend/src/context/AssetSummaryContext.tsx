import React, { createContext, useState, useEffect } from 'react'
import toast from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL

interface Asset {
    asset: string;           // 通貨シンボル (例: BTC, ETH)
    image: string;           //Symbolのイメージ画像
    amount: number;          // 保有量
    averageCost: number;     // 平均取得単価
    currentPrice: number;    // 現在の価格
    totalValue: number;      // 評価額 (amount * currentPrice)
    change24h: string;       // 24hの変動率 (例: "+2.34%")
    profitLossRate: string;  // 含み損益率 (例: "+3.33%")
    profitLossAmount: number;// 含み損益額 (例: 2500)
  }

// Contextが持つ値の型
interface AssetSummaryContextValue {
  assets: Asset[];
  fetchAssets: () => void;
}

// Contextの作成
export const AssetSummaryContext = createContext<AssetSummaryContextValue | undefined>(undefined);

// Providerコンポーネント
export const AssetSummaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);

  // データ取得関数
  const fetchAssets = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/summary`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json(); // エラーメッセージを取得
        toast.error(errorData.error, {
          duration: 10000,
          position: "top-center",
        });
        return;
      }

      const data = await response.json();
      // data.summary が [ { asset: ..., amount:..., ...}, ... ] の配列を想定
      console.log(data.summary)
      setAssets(data.summary || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error('サーバーエラーが発生しました',{
        duration: 5000,
        position: 'top-center',
      });
    }
  };

  // 初回マウント時に fetch
  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <AssetSummaryContext.Provider value={{ assets, fetchAssets }}>
      {children}
    </AssetSummaryContext.Provider>
  );
};
