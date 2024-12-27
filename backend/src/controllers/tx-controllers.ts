import { Response } from 'express';
import { pool } from '../config/database';
import { TransactionForm } from '../types/tx-types';
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

      const transaction: TransactionForm = req.body;
      
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
            transaction.transactionId || null
        ]
    );

      res.status(201).json({ success: true });
      return Promise.resolve();

  } catch (error) {
      res.status(500).json({ success: false });
      return Promise.resolve();
  }
};

// ユーザーごとにDBに保存した取引履歴(transaction)を取得(検索)する関数
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
      const userId = req.user?.id;
      const [transactions] = await pool.execute(
          'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
          [userId]
      );
      res.json({ transactions });
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};