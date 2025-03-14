import { Asset } from '@/types/assets-types';
import React, { createContext, useState, useEffect } from 'react'
import toast from "react-hot-toast"

const ExchangeRate_API = import.meta.env.VITE_ExchangeRate_API
const API_URL = import.meta.env.VITE_API_URL


// Contextが持つ値の型
interface AssetSummaryContextValue {
  assets: Asset[];
  fetchAssets: () => void;
  jpy: number;
}

// Contextの作成
export const AssetSummaryContext = createContext<AssetSummaryContextValue | undefined>(undefined);


// Providerコンポーネント
export const AssetSummaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [jpy, setJpy] = useState<number>(0);

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

  const fetchJpy = async() => {

    const today = new Date();
    // YYYY-MM-DD 形式に変換
    const formattedDate = today.toISOString().split("T")[0];
  
    try {
      const response = await fetch(`${ExchangeRate_API}/${formattedDate}?from=USD&to=JPY`)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      setJpy(data.rates.JPY);
  
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  
  }

  

  // 初回マウント時に fetch
  useEffect(() => {
    fetchAssets();
    fetchJpy();
  }, []);

  return (
    <AssetSummaryContext.Provider value={{ assets, fetchAssets, jpy }}>
      {children}
    </AssetSummaryContext.Provider>
  );
};
