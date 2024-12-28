import { RowDataPacket, ResultSetHeader } from 'mysql2';

// フロントエンドのAddTxからsubmitされるformの型
export interface TransactionRow extends RowDataPacket {
    id: number;
    date: string;
    exchange: string;
    transactionType: string;
    asset: string;
    price: string;
    amount: string;
    fee: string;
    blockchain: string;
    exchangeRate: string;
    tx_hash?: string;
  }


// 総件数取得用のインターフェース
export interface TotalCountRow extends RowDataPacket {
  total: number;
}
