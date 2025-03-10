import { pool } from '../config/database';


export async function insertRealizedProfitLoss(
    userId: number,
    coinId: string,
    transactionId: number,
    date: string,
    realizedProfit: number
) {
  await pool.execute(`
    INSERT INTO realized_profit_loss (
      user_id,
      coin_id,
      transaction_id,
      realized_profit_loss,
      date
    ) VALUES (?, ?, ?, ?, ?)
  `, [userId, coinId, transactionId, realizedProfit, date]);
}
