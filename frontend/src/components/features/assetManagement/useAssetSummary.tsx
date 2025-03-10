import { useContext } from 'react';
import { AssetSummaryContext } from '../../../context/AssetSummaryContext';

// カスタムフック
export const useAssetSummary = () => {
  const context = useContext(AssetSummaryContext);
  if (!context) {
    throw new Error('useAssetSummary must be used within an AssetSummaryProvider');
  }
  return context;
};