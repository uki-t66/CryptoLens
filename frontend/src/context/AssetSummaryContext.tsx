import { Asset } from '@/types/assets-types';
import React, { createContext, useState } from 'react';
import toast from "react-hot-toast";

const ExchangeRate_API = import.meta.env.VITE_ExchangeRate_API;
const API_URL = import.meta.env.VITE_API_URL;

export interface ChartData {
  date: string;
  value: number;
}

// Contextが持つ値の型
interface AssetSummaryContextValue {
  assets: Asset[];
  totalRealizedProfitLoss: number;
  fetchAssets: () => void;
  fetchJpy: () => void;
  fetchDailyAsset: () => void;
  clearAssets: () => void;
  jpy: number;
  chartData: ChartData[];
}

// Contextの作成
export const AssetSummaryContext = createContext<AssetSummaryContextValue | undefined>(undefined);

// Providerコンポーネント
export const AssetSummaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalRealizedProfitLoss, setTotalRealizedProfitLoss] = useState(0);
  const [jpy, setJpy] = useState<number>(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);


  // userの資産情報を取得
  const fetchAssets = async () => {
    return toast.promise(
      (async () => {
        const response = await fetch(`${API_URL}/transactions/summary`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }

        const data = await response.json();
        setAssets(data.summary || []);
        setTotalRealizedProfitLoss(Number(data.totalRealizedProfitLoss));
      })(),
      {
        loading: "資産データを取得中...",
        success: "資産データを取得しました！",
        error: "資産データの取得に失敗しました。",
      },
      { duration: 7000 }
    );
  };

  //為替データ取得
  const fetchJpy = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    try {
      const response = await fetch(`${ExchangeRate_API}/${formattedDate}?from=USD&to=JPY`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setJpy(data.rates.JPY);
    } catch (error) {
      console.error("為替データの取得に失敗しました:", error);
    }
  };

  //rechartの折れ線グラフに表示する総資産データを取得
  const fetchDailyAsset = async () => {
    try {
      const res = await fetch(`${API_URL}/history/daily-asset`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to fetch daily asset history");

      const result = await res.json();
      setChartData(result.data || []);
    } catch (error) {
      console.error("資産履歴の取得に失敗しました:", error);
    }
  };


  //データをクリアする関数（ログアウト時などに使用）
  const clearAssets = () => {
    setAssets([]);
    setJpy(0);
    setTotalRealizedProfitLoss(0);
    setChartData([]);
  };

  return (
    <AssetSummaryContext.Provider value={{ assets, totalRealizedProfitLoss, fetchAssets, fetchJpy, fetchDailyAsset, clearAssets, jpy, chartData }}>
      {children}
    </AssetSummaryContext.Provider>
  );
};
