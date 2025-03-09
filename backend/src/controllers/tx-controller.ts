import { RequestHandler, Response } from 'express';
import { pool } from '../config/database';
import { TransactionRow,TotalCountRow, AssetBalance } from '../types/tx-types';
import { AuthRequest } from '../middleware/auth-middleware';
import { createTransactionService } from '../services/transaction-service';
import { RowDataPacket } from 'mysql2';


//  フロントエンドのAddTxからsubmitされたformをDBに保存する関数
export const createTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
      const userId = req.user?.id;
      if (!userId) {
          res.status(401).json({ message: 'Not authenticated' });
          return Promise.resolve();
      }

      // formの取引データ
      const txData = req.body;
      console.log(txData)
      
      await createTransactionService(userId, txData);

      res.status(201).json({ success: true });
    
      return Promise.resolve();

  } catch (error) {
      res.status(500).json({ success: false });
    
      return Promise.resolve();
  }
};

// フロントエンドに表示するtransactionレコードを取得する関数
export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // 総件数を取得（型を指定）
        const [totalRows] = await pool.execute<TotalCountRow[]>(
            'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
            [req.user?.id]
        );

        // トランザクションデータを取得
        const [transactions] = await pool.execute<RowDataPacket[]>(
            `SELECT * FROM transactions 
             WHERE user_id = ? 
             AND transaction_type IN ('Buy', 'Sell', 'Reward', 'Transfer') 
             ORDER BY date DESC 
             LIMIT ?, ?`,
            [req.user?.id, offset.toString(), limit.toString()]
        );

        res.json({
            transactions,
            total: totalRows[0].total
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// 削除エンドポイント
export const deleteTransaction = async (req: AuthRequest, res: Response):Promise<void> => {
    try {
      // パラメータ取得
      const { transactionId } = req.params;
      const userId = req.user?.id as number;
      console.log(`これはtransactionIdの${transactionId}`)
      console.log(`これはuserIdの${req.user?.id}`)
      
  
      // 取引情報を取得
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM transactions WHERE transaction_id=? AND user_id=?",
        [transactionId, userId]
      );
      if (rows.length === 0) {
        res.status(404).json({ error: "Transactionが見つかりません。" });
      }

     //削除するレコード
      const originalTx = rows[0] as TransactionRow;
      console.log(originalTx)
  
      //会計システムの取引方式で相殺する、取り消し用の逆トランザクション(レコード)を作成
      //    - Buyを取り消すなら 量=マイナス or type=Sell
      //    - Sellを取り消すなら 量=プラス or type=Buy という扱いもアリ
      const reversedTx:TransactionRow = {
        id: userId,
        date: new Date().toISOString().slice(0, 10), //削除するレコードを相殺する日付
        exchange: originalTx.exchange,
        transaction_type: "Reverse",
        asset: originalTx.asset,
        price: originalTx.price,
        amount: String(-Number(originalTx.amount)),    // 逆数量(負の数)
        fee: originalTx.fee ? String(-Number(originalTx.fee)) : String(0),
        blockchain: originalTx.blockchain,
        exchange_rate: originalTx.exchange_rate,
        file: originalTx.file,
        tx_hash: originalTx?.tx_hash,
        tx_notes: originalTx?.tx_notes,
        coin_id: originalTx.coin_id,
      };
      console.log(reversedTx)
  
      // 新規トランザクションとしてINSERT (createTransactionロジックを使ってレコード相殺)
      await createTransactionService(userId, reversedTx);
  
       res.json({ success: true });
    } catch (err) {
      console.error("Error reversing transaction:", err);
      res.status(500).json({ error: "Failed to reverse transaction" });
    }
  };
  

// 削除エンドポイント
// export const deleteTransaction = async (req: AuthRequest, res: Response) => {
//     try {
//         const { id } = req.params;
//         const userId = req.user?.id;

//         await pool.execute(
//             'DELETE FROM transactions WHERE transaction_id = ? AND user_id = ?',
//             [id, userId]
//         );

//         res.json({ success: true });
//     } catch (error) {
//         console.error('Error deleting transaction:', error);
//         res.status(500).json({ error: 'Failed to delete transaction' });
//     }
// };

// 更新エンドポイント
// export const updateTransaction = async (req: AuthRequest, res: Response) => {
//     try {
//         const { id } = req.params;
//         const userId = req.user?.id;
//         const transaction = req.body;

//         await pool.execute(
//             `UPDATE transactions 
//              SET price = ?, amount = ?, fee = ?
//              WHERE transaction_id = ? AND user_id = ?`,
//             [transaction.price, transaction.amount, transaction.fee, id, userId]
//         );

//         res.json({ success: true });
//     } catch (error) {
//         console.error('Error updating transaction:', error);
//         res.status(500).json({ error: 'Failed to update transaction' });
//     }
// };


// ユーザーの資産情報を返すエンドポイント
export const getAssetSummary = async (req: AuthRequest, res: Response): Promise<void> => {

    // コインゲッコーAPI
    const COINGECKO_API = process.env.COINGECKO_API;

  try {
    const userId = req.user?.id;
    if (!userId) {
       res.status(401).json({ message: 'Unauthorized' });
    }

    //user_positionsテーブルから保有通貨一覧 & 保有量 / 平均単価 を取得
    const [positions] = await pool.query(`
        SELECT coin_id, total_amount, average_cost
        FROM user_positions
        WHERE user_id=?
      `, [userId]);

    // positions が空なら空の配列を返す
    if ((positions as any[]).length === 0) {
        res.json({ summary: [] });
      }

    //CoinGeckoで保有している通貨の現在価格 & 24h変動率をまとめて取得
    //    例: coin_idの配列をカンマ区切りにして /simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true
    const coinIds = (positions as any[]).map((pos) => pos.coin_id).join(",");

    //保有通貨の現在価格、24時間の価格の変動率データをCoingeckoから取得
    const coingeckoUrl = `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;

    const response = await fetch(coingeckoUrl);
    const priceData = await response.json(); 
    console.log(priceData)
    // priceData[coin_id] = { usd: 12345, usd_24h_change: 2.34 }

     //レスポンス用の配列を構築
     const summary = (positions as any[]).map((pos) => {
        const coinId = pos.coin_id;
        const amount = Number(pos.total_amount) || 0;
        const avgCost = Number(pos.average_cost) || 0;
        
        // 現在価格 & 24h変動率
        const cg = priceData[coinId] || {};
        const currentPrice = cg.usd || 0; // USD
        const change24hValue = cg.usd_24h_change || 0; // 例: 2.34 => +2.34% と表示
  
        // 評価額
        const totalValue = amount * currentPrice;
  
        // 含み損益額
        const profitLossAmount = (currentPrice - avgCost) * amount;
        // 含み損益率
        let profitLossRate = "0.00%";
        if (avgCost !== 0) {
          profitLossRate = ((currentPrice - avgCost) / avgCost * 100).toFixed(2) + "%";
          if (profitLossAmount >= 0) {
            profitLossRate = "+" + profitLossRate;
          }
        }
  
        // 24h変動率
        let change24h = change24hValue.toFixed(2) + "%";
        if (change24hValue > 0) {
          change24h = "+" + change24h;
        }
  
        return {
          asset: coinId,                      // or symbol
          amount,
          averageCost: avgCost,
          currentPrice,
          totalValue,
          change24h,
          profitLossRate,
          profitLossAmount,
        };
      });
  
      // 5. レスポンス返却
       res.json({ summary });
    } catch (error) {
      console.error("Error in getAssetSummary:", error);
       res.status(500).json({ error: "Server Error" });
    }
  };