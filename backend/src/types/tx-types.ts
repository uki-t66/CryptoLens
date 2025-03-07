import { RowDataPacket, ResultSetHeader } from 'mysql2';

// フロントエンドのAddTxからsubmitされるformの型
export interface TransactionRow {
    id: number;
    date: string;
    exchange: string;
    transactionType: string;
    asset: string;
    price: string;
    amount: string;
    fee: string;
    blockchain: string;
    exchange_rate: string;
    file?: File;
    tx_hash?: string;
    tx_notes?: Text;
    coin_id: string;
  }


// 総件数取得用のインターフェース
export interface TotalCountRow extends RowDataPacket {
  total: number;
}

// 資産残高を表す型
export interface AssetBalance extends RowDataPacket {
  asset: string;          // 資産のシンボル（例：'BTC'）
  totalAmount: number;    // 合計保有量
  totalCost: number;      // 合計購入金額
}

// CoinGecko APIのレスポンス型も定義
export interface CoinGeckoSearchResult {
  coins: Array<{
    id: string;
    symbol: string;
    name: string;
    market_cap_rank: number;
  }>;
}