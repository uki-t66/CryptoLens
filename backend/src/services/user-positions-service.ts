import { pool } from '../config/database';

export async function updateUserPositionsAndCalcProfit(
  userId: number,
  coinId: string,
  transactionType: string,
  amount: string,
  price: string,
  fee: string,
  extraValue?: number // ReverseSellの場合、削除されたコスト（removedCost）を渡す
): Promise<{ realizedProfitLoss: number | null, costRemoved: number | null }> {
  // 現在のポジションを取得
  const [rows] = await pool.execute(`
    SELECT total_amount, total_cost, average_cost
    FROM user_positions
    WHERE user_id = ? AND coin_id = ?
    LIMIT 1
  `, [userId, coinId]);

  let totalAmount = 0;
  let totalCost = 0;
  
  if ((rows as any[]).length > 0) {
    const pos = (rows as any[])[0];
    totalAmount = Number(pos.total_amount);
    totalCost = Number(pos.total_cost);
  }

  let realizedProfitLoss: number | null = null;
  let costRemoved: number | null = null;
  const numericAmount = Number(amount);
  const numericPrice  = Number(price);
  const numericFee    = Number(fee);

  if (transactionType === "ReverseBuy") {
    // ReverseBuy: 元のBuyの効果を打ち消す（数量とコストを減算）
    const cost = numericAmount * numericPrice - numericFee;
    totalAmount -= numericAmount;
    totalCost -= cost;
    realizedProfitLoss = 0;
  } else if (transactionType === "ReverseSell") {
    // ReverseSell: 元のSellで削除された数量とコストを元に戻す
    // extraValueに元のSell時に削除されたcostが渡される前提
    const removedCost = extraValue ? Number(extraValue) : 0;
    totalAmount += numericAmount;
    totalCost += removedCost;
    realizedProfitLoss = 0;
  } else if (transactionType === "Buy") {
    // Buy: 数量とコストを加算
    const newCost = numericAmount * numericPrice - numericFee;
    totalAmount += numericAmount;
    totalCost += newCost;
  } else if (transactionType === "Sell") {
    // Sell: 現在の平均単価を基に実現損益計算し、数量とコストを減算
    const currentAvg = totalAmount !== 0 ? (totalCost / totalAmount) : 0;
    realizedProfitLoss = (numericPrice - currentAvg) * numericAmount - numericFee;
    costRemoved = currentAvg * numericAmount;
    totalAmount -= numericAmount;
    totalCost -= costRemoved;
    if (totalAmount < 0) totalAmount = 0;
    if (totalCost < 0) totalCost = 0;
  }

  const newAvg = totalAmount === 0 ? 0 : (totalCost / totalAmount);

  await pool.execute(`
    INSERT INTO user_positions (user_id, coin_id, total_amount, total_cost, average_cost)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      total_amount = VALUES(total_amount),
      total_cost   = VALUES(total_cost),
      average_cost = VALUES(average_cost),
      updated_at   = CURRENT_TIMESTAMP
  `, [userId, coinId, totalAmount, totalCost, newAvg]);

  return { realizedProfitLoss, costRemoved };
}
