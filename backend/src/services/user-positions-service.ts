import { pool } from '../config/database';

// user_positionsを更新し、必要に応じて損益を計算して返す
export async function updateUserPositionsAndCalcProfit(
  userId: number,
  coinId: string,
  transactionType: string,
  amount: string,
  price: string,
  fee: string
): Promise<number | null> {

  // user_positionsテーブルからuserの現在のpositionを取得
  const [rows] = await pool.execute(`
    SELECT total_amount, total_cost, average_cost
    FROM user_positions
    WHERE user_id = ? AND coin_id = ?
    LIMIT 1
  `, [userId, coinId]);

  let totalAmount = 0;
  let totalCost = 0;

    // user_positionを既に持っている場合の処理
  if ((rows as any[]).length > 0) {
    // userの該当coinのpositionデータ
    const userPosition = (rows as any[])[0];
    // userの現在の該当coinの総保有量
    totalAmount = Number(userPosition.total_amount);
    // userの現在の該当coinの総支出費
    totalCost = Number(userPosition.total_cost);
  }

    //確定損益
  let realizedProfitLoss: number | null = null;

    //Buyなら保有量を加算
  if (transactionType === "Buy") {
    
    const newCost = Number(amount) * Number(price) - Number(fee);

    // 更新されたtotalAmount
    totalAmount += Number(amount);
    // 更新されたtotalCost
    totalCost += newCost;
    
    

    // user_positionsテーブル該当coinのuserレコードをINSERT or UPDATE
    await pool.execute(`
      INSERT INTO user_positions (user_id, coin_id, total_amount, total_cost, average_cost)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        total_amount = VALUES(total_amount),
        total_cost   = VALUES(total_cost),
        average_cost = VALUES(average_cost),
        updated_at   = CURRENT_TIMESTAMP
    `, [
      userId,
      coinId,
      totalAmount,
      totalCost,
      totalAmount === 0 ? 0 : totalCost / totalAmount
    ]);

    

  } else if (transactionType === "Sell") { // Sell: 保有量を減算
    
    // まず現在の平均単価
    const currentAvg = totalAmount !== 0 ? totalCost / totalAmount : 0;
    
    // 売却益 ( price - currentAvg ) * amount
    realizedProfitLoss = (Number(price) - currentAvg) * Number(amount);
    // 取引時の手数料をマイナス(取引手数料は経費可)
    realizedProfitLoss -= Number(fee);

    // Sellだから保有量、コストを減らす
    totalAmount -= Number(amount);
    const costToRemove = currentAvg * Number(amount); // costから差し引く額
    totalCost -= costToRemove;
    if (totalAmount < 0) totalAmount = 0; // エラー処理
    if (totalCost < 0) totalCost = 0;     //エラー処理

    await pool.execute(`
      INSERT INTO user_positions (user_id, coin_id, total_amount, total_cost, average_cost)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        total_amount = VALUES(total_amount),
        total_cost   = VALUES(total_cost),
        average_cost = VALUES(average_cost),
        updated_at   = CURRENT_TIMESTAMP
    `, [
      userId,
      coinId,
      totalAmount,
      totalCost,
      totalAmount === 0 ? 0 : totalCost / totalAmount
    ]);
  }
  // 確定損益をreturn
  return realizedProfitLoss;
}
