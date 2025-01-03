import { Response } from 'express';
import { pool } from '../config/database';
import { TransactionRow,TotalCountRow } from '../types/tx-types';
import { AuthRequest } from '../middleware/auth-middleware';

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

      const transaction: TransactionRow = req.body;
      
      await pool.execute(
        `INSERT INTO transactions (
            user_id,
            date, 
            exchange, 
            transaction_type, 
            asset, 
            price, 
            amount, 
            fee, 
            blockchain, 
            exchange_rate, 
            tx_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            userId,
            transaction.date,
            transaction.exchange,
            transaction.transactionType,
            transaction.asset,
            transaction.price,
            transaction.amount,
            transaction.fee,
            transaction.blockchain,
            transaction.exchangeRate,
            transaction.tx_hash || null
        ]
    );

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
        const [transactions] = await pool.execute<TransactionRow[]>(
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
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        await pool.execute(
            'DELETE FROM transactions WHERE transaction_id = ? AND user_id = ?',
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
};

// 更新エンドポイント
export const updateTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const transaction = req.body;

        await pool.execute(
            `UPDATE transactions 
             SET price = ?, amount = ?, fee = ?
             WHERE transaction_id = ? AND user_id = ?`,
            [transaction.price, transaction.amount, transaction.fee, id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
};