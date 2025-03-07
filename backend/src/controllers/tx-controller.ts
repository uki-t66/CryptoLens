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
        transactionType: "Reverse",
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
  // try {
  //   const userId = req.user?.id;
  //   if (!userId) {
  //      res.status(401).json({ message: 'Unauthorized' });
  //   }

  //   // 1. ユーザーの資産(合計購入量、合計購入金額)を取得。「transaction_type = 'BUY'」のみを対象とする。
  //   const [rows] = await pool.execute<AssetBalance[]>(
  //     `
  //     SELECT 
  //       asset,
  //       SUM(amount) AS totalAmount,
  //       SUM(price * amount) AS totalCost -- BUYのみの合計金額
  //     FROM transactions
  //     WHERE user_id = ?
  //       AND transaction_type = 'BUY'
  //     GROUP BY asset
  //     `,
  //     [userId]
  //   );


  //   // 2. CoinGecko で使用するために、各assetに対応する"CoinGecko上のID"を検索します。
  //   //    - 本来であれば、DBに「coinGeckoId」を紐付けておくのがおすすめです。
  //   //    - ここではフロントエンドの例と同じように "search?query=シンボル" で簡易に対応します。
    
  //   // CoinGecko APIのベースURL。環境変数などに定義している想定。
  //   const COINGECKO_API = process.env.COINGECKO_API
  //   const coinGeckoIds: Array<string | null> = await Promise.all(
  //     rows.map(async (item: any) => {
  //       const searchRes = await fetch(`${COINGECKO_API}/search?query=${item.asset}`);
  //       if (!searchRes.ok) {
  //         console.error(`CoinGecko search failed for asset: ${item.asset}`);
  //         return null;
  //       }
  //       const searchData = await searchRes.json();
    
  //       // コインシンボルがマッチするものを1つ探す
  //       const found = searchData.coins.find(
  //         (coin: { symbol: string }) => coin.symbol.toLowerCase() === item.asset.toLowerCase()
  //       );
  //       return found ? found.id : null;
  //     })
  //   );
  //   console.log(coinGeckoIds.length)

  //   // 無効なIDを除外してカンマ区切りに
  //   const validIds = coinGeckoIds.filter(Boolean).join(',');
  //   if (!validIds) {
  //     // 何も有効なIDが見つからなかった場合
  //     const responseData = rows.map((item: any) => {
  //       return {
  //         asset: item.asset,
  //         amount: Number(item.totalAmount),
  //         averageCost: item.totalCost / item.totalAmount, // 平均取得単価
  //         currentPrice: 0,
  //         totalValue: 0,
  //         change24h: '0%',
  //         profitLossRate: '0%',
  //         profitLossAmount: 0,
  //       };
  //     });
  //      res.json({ summary: responseData });
  //   }
  //   console.log(`使えるIDは${validIds}`)

  //   // CoinGecko APIから一度に価格データを取得 (現在価格 + 24h変化率)
  //   const priceRes = await fetch(`${COINGECKO_API}/simple/price?ids=${validIds}&vs_currencies=usd&include_24hr_change=true`);

  //   if (!priceRes.ok) {
  //     throw new Error('Failed to fetch price data from CoinGecko');
  //   }
  //   const pricesData = await priceRes.json();
  //   console.log(pricesData)

  //   // 取得したデータを組み合わせてレスポンス用のオブジェクトを作成
  //   const summaryData = rows.map((item: any, index: number) => {
  //     const assetSymbol = item.asset;
  //     const totalAmount = Number(item.totalAmount) || 0;
  //     const totalCost = Number(item.totalCost) || 0;
  //     const averageCost = totalAmount > 0 ? totalCost / totalAmount : 0;

  //     const coinId = coinGeckoIds[index];
  //     if (!coinId) {
  //       // CoinGecko IDが取れなかったものは価格情報なし
  //       return {
  //         asset: assetSymbol,
  //         amount: totalAmount,
  //         averageCost,
  //         currentPrice: 0,
  //         totalValue: 0,
  //         change24h: '0%',
  //         profitLossRate: '0%',
  //         profitLossAmount: 0,
  //       };
  //     }

  //     // CoinGeckoからのデータを参照
  //     const coinInfo = pricesData[coinId];
  //     const currentPrice = coinInfo?.usd ?? 0; 
  //     const usd24hChange = coinInfo?.usd_24h_change ?? 0; // 例: +2.5 であれば +2.5%

  //     // 保有総額(評価額)
  //     const totalValue = currentPrice * totalAmount;

  //     // 含み損益 (単純計算: (現在価格 - 平均取得単価) × 保有数量 )
  //     const profitLossAmount = (currentPrice - averageCost) * totalAmount;

  //     // 含み損益率 ( ( 現在価格 - 平均取得単価 ) ÷ 平均取得単価 ) × 100
  //     const profitLossRate = averageCost > 0
  //       ? (profitLossAmount / (averageCost * totalAmount)) * 100
  //       : 0;

  //     // 24hの変化率はCoinGeckoが「前日比(%)」の値を返している想定
  //     // 例: usd_24h_change: 2.5 -> +2.5%
  //     const change24h = `${usd24hChange >= 0 ? '+' : ''}${usd24hChange.toFixed(2)}%`;

  //     return {
  //       asset: assetSymbol,
  //       amount: totalAmount,
  //       averageCost,
  //       currentPrice,
  //       totalValue,
  //       change24h,
  //       // 含み損益率と含み損益額
  //       profitLossRate: `${profitLossRate >= 0 ? '+' : ''}${profitLossRate.toFixed(2)}%`,
  //       profitLossAmount: Number(profitLossAmount.toFixed(2)),
  //     };
  //   });

  //   // フロントエンドが受け取る JSON
  //   res.json({ summary: summaryData });
  // } catch (error) {
  //   console.error('Error fetching asset summary:', error);
  //   res.status(500).json({ message: 'Failed to fetch asset summary' });
  // }
};