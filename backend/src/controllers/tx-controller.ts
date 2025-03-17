import { RequestHandler, Response } from 'express';
import { pool } from '../config/database';
import { TransactionRow,TotalCountRow, AssetBalance } from '../types/tx-types';
import { AuthRequest } from '../middleware/auth-middleware';
import { createTransactionService } from '../services/transaction-service';
import { RowDataPacket } from 'mysql2';


//  フロントエンドのAddTxからsubmitされたformをDBに保存する関数
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
  
      // フロントエンドから送られてきた取引データを取得
      const txData = req.body;
      console.log("Received transaction data:", txData);
  
      // 必須項目のバリデーション（最低限、取引タイプ、数量、coin_id は必要）
      if (!txData.transaction_type || !txData.amount || !txData.coin_id) {
        res.status(400).json({ error: '必須項目が不足しています。' });
        return;
      }
  
      // Sell 取引の場合、ユーザーが保有している数量以下かをチェック
      if (txData.transaction_type === 'Sell') {
        const sellAmount = Number(txData.amount);
  
        // ユーザーの保有数量を user_positions から取得
        const [rows] = await pool.execute(
          `SELECT total_amount FROM user_positions WHERE user_id = ? AND coin_id = ?`,
          [userId, txData.coin_id]
        );
        let currentHoldings = 0;
        if ((rows as any[]).length > 0) {
          currentHoldings = Number((rows as any[])[0].total_amount);
        }
        
        // 売却数量が現在の保有数量を超えていればエラーを返す
        if (sellAmount > currentHoldings) {
          res.status(400).json({ error: '売却数量が現在の保有数量を超えています。' });
          return;
        }
      }
  
      // ここで取引作成サービスを呼び出し、DB に登録する
      await createTransactionService(userId, txData);
  
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error in createTransaction:", error);
      res.status(500).json({ success: false });
    }
  };

// フロントエンドに表示するtransactionレコードを取得する関数
export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
  
      // 総件数を取得
      const [totalRows] = await pool.execute<TotalCountRow[]>(
        // deleted_at IS NULL も含めて件数を数えたい場合はここでも条件追加
        `SELECT COUNT(*) as total 
         FROM transactions 
         WHERE user_id = ? 
         AND transaction_type IN ('Buy', 'Sell', 'Reward', 'Transfer')
         AND deleted_at IS NULL`,
        [req.user?.id]
      );
  
      // トランザクションデータを取得
      const [transactions] = await pool.execute<RowDataPacket[]>(
        `SELECT *
         FROM transactions
         WHERE user_id = ?
           AND transaction_type IN ('Buy', 'Sell', 'Reward', 'Transfer')
           AND deleted_at IS NULL
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
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { transactionId } = req.params;
      const userId = req.user?.id as number;
      
      // 対象取引の取得
      const [rows] = await pool.execute(
        "SELECT * FROM transactions WHERE transaction_id=? AND user_id=?",
        [transactionId, userId]
      );
      if ((rows as any[]).length === 0) {
        res.status(404).json({ error: "Transactionが見つかりません。" });
        return;
      }
  
      const originalTx = (rows as any[])[0] as TransactionRow;
  
      let reverseType: string;
      if (originalTx.transaction_type === "Buy") {
        reverseType = "ReverseBuy";
      } else if (originalTx.transaction_type === "Sell") {
        reverseType = "ReverseSell";
      } else {
        reverseType = "Reverse";
      }
  
      // ReverseSellの場合、元取引のtx_notesからremovedCostを取得
      let removedCost: number | undefined;
      if (originalTx.transaction_type === "Sell" && originalTx.tx_notes) {
        try {
          const notesObj = JSON.parse(String(originalTx.tx_notes));
          removedCost = notesObj.removedCost;
        } catch (e) {
          removedCost = undefined;
        }
      }
  
      // 逆仕訳レコードの生成（removedCost をプロパティとして追加）
      const reversedTx: TransactionRow & { removedCost?: number } = {
        id: userId,
        date: new Date().toISOString().slice(0, 10),
        exchange: originalTx.exchange,
        transaction_type: reverseType,
        asset: originalTx.asset,
        price: originalTx.price,  
        amount: originalTx.amount, // 逆仕訳の場合、元の数量をそのまま利用
        fee: originalTx.fee,
        blockchain: originalTx.blockchain,
        exchange_rate: originalTx.exchange_rate,
        file: originalTx.file,
        tx_hash: originalTx.tx_hash,
        // tx_notes には removedCost の情報を JSON 形式で記録
        tx_notes: removedCost !== undefined ? JSON.stringify({ removedCost }) : originalTx.tx_notes,
        coin_id: originalTx.coin_id,
        removedCost: removedCost  // extraValue として渡す
      };
  
      // 逆仕訳レコードを新たにINSERT（user_positions 更新も内部で実施）
      await createTransactionService(userId, reversedTx);

      // Sell取り消しの場合、対応するrealized_profit_lossレコードを削除する
     if (originalTx.transaction_type === "Sell") {
        await pool.execute(
        `DELETE FROM realized_profit_loss WHERE transaction_id = ? AND user_id = ?`,
        [transactionId, userId]
        );
     }
  
      // 元の取引を論理削除
      await pool.execute(
        `UPDATE transactions
         SET deleted_at = NOW()
         WHERE transaction_id = ? AND user_id = ?`,
        [transactionId, userId]
      );
  
      res.json({ success: true });
    } catch (err) {
      console.error("Error reversing transaction:", err);
      res.status(500).json({ error: "Failed to reverse transaction" });
    }
  };
  

  //ユーザーのDashboard情報を返すエンドポイント
  export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
    try {

        // 認証されたUserId
        const userId = req.user?.id;
         if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
      }
        
    } catch (error) {
        
    }
  }
  


// ユーザーの資産情報を返すエンドポイント
export const getAssetSummary = async (req: AuthRequest, res: Response): Promise<void> => {
    // Coingecko APIのURLベース
    const COINGECKO_API = process.env.COINGECKO_API;
  
    try {
      // 認証されたUserId
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return; // レスポンス送信後に早期終了
      }
  
      // user_positionsとcoin_masterをJOINして、必要なデータを取得
      const [positions] = await pool.query(
        `
        SELECT 
          up.coin_id, 
          up.total_amount, 
          up.average_cost, 
          cm.symbol AS coin_symbol,
          cm.image AS coin_image
        FROM user_positions up
        JOIN coin_master cm ON up.coin_id = cm.coin_id
        WHERE up.user_id = ?
      `,
        [userId]
      );
  
      // 確定損益データの取得
      const [rows] = (await pool.query(
        `
        SELECT SUM(realized_profit_loss) AS total_realized_profit_loss
        FROM realized_profit_loss
        WHERE user_id = ?
      `,
        [userId]
      )) as [RowDataPacket[], any];
  
      const totalRealizedProfitLoss = rows[0].total_realized_profit_loss;
      console.log(totalRealizedProfitLoss)
  
      // 取得結果が空の場合は、早期に空の配列を返す
      if ((positions as any[]).length === 0) {
        res.json({ summary: [] });
        return;
      }
  
      // CoinGeckoで現在価格と24h変動率を取得
      const coinIds = (positions as any[]).map((pos) => pos.coin_id).join(",");
      const coingeckoUrl = `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
  
      const response = await fetch(coingeckoUrl);
      if (!response.ok) {
        res.status(404).json({
          error: "資産情報を取得できませんでした。時間をおいてブラウザを更新してください。",
        });
        return;
      }
      const priceData = await response.json();
  
      // レスポンス用の配列を構築
      const summary = (positions as any[]).map((pos) => {
        const coinId = pos.coin_id;
        const coinSymbol = pos.coin_symbol;
        const coinImage = pos.coin_image;
        const amount = Number(pos.total_amount) || 0;
        const avgCost = Number(pos.average_cost) || 0;
        const cg = priceData[coinId] || {};
        const currentPrice = cg.usd || 0;
        const change24hValue = cg.usd_24h_change || 0;
        const totalValue = amount * currentPrice;
        const profitLossAmount = (currentPrice - avgCost) * amount;
        let profitLossRate = "0.00%";
        if (avgCost !== 0) {
          profitLossRate = ((currentPrice - avgCost) / avgCost * 100).toFixed(2) + "%";
          if (profitLossAmount >= 0) {
            profitLossRate = "+" + profitLossRate;
          }
        }
        let change24h = change24hValue.toFixed(2) + "%";
        if (change24hValue > 0) {
          change24h = "+" + change24h;
        }

        return {
          asset: coinSymbol,
          image: coinImage,
          amount,
          averageCost: avgCost,
          currentPrice,
          totalValue,
          change24h,
          profitLossRate,
          profitLossAmount,
        };
      });
  
      res.json({
        summary,
        totalRealizedProfitLoss: totalRealizedProfitLoss || 0
      });
    } catch (error) {
      console.error("Error in getAssetSummary:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };
  
  