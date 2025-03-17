import { pool } from '../config/database';
import { checkAndInsertCoinIfNeeded } from "./coin-master-service";
import { updateUserPositionsAndCalcProfit } from "./user-positions-service";
import { insertRealizedProfitLoss } from "./realized-profit-loss-service";
import { TransactionRow } from "../types/tx-types";

export async function createTransactionService(userId: number, txData: TransactionRow) {
  // coin_masterにcoin_idがなければCoinGecko APIから詳細情報を取得しINSERTする
  const coinId = await checkAndInsertCoinIfNeeded(txData.coin_id);
  
  // transactionsテーブルにINSERT
  const [result] = await pool.execute(`
    INSERT INTO transactions (
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
      file,
      tx_hash,
      tx_notes,
      coin_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    userId,
    txData.date,
    txData.exchange,
    txData.transaction_type,
    txData.asset,
    txData.price,
    txData.amount,
    txData.fee,
    txData.blockchain,
    txData.exchange_rate,
    txData.file || null,
    txData.tx_hash || null,
    txData.tx_notes || null,
    coinId
  ]);

  // 生成されたtransaction_idを取得
  const transactionId = (result as any).insertId;

  // user_positionsの更新＆実現損益計算
  // ※ ReverseSellの場合は、txData.removedCost（オプション）を渡せるようにしています
  const { realizedProfitLoss, costRemoved } = await updateUserPositionsAndCalcProfit(
    userId,
    coinId,
    txData.transaction_type,
    txData.amount,
    txData.price,
    txData.fee,
    (txData as any).removedCost
  );

  // Sellの場合、削除したコスト情報をtx_notesにJSONとして記録
  if (txData.transaction_type === "Sell" && costRemoved !== null) {
    let notesObj = {};
    if (txData.tx_notes) {
      try {
        notesObj = JSON.parse(txData.tx_notes);
      } catch (e) {
        notesObj = {};
      }
    }
    notesObj = { ...notesObj, removedCost: costRemoved };
    const updatedNotes = JSON.stringify(notesObj);
    await pool.execute(
      `UPDATE transactions SET tx_notes = ? WHERE transaction_id = ?`,
      [updatedNotes, transactionId]
    );
  }

  // 実現損益があればrealized_profit_lossテーブルへINSERT
  if (realizedProfitLoss !== null && realizedProfitLoss !== undefined) {
    await insertRealizedProfitLoss(
      userId,
      coinId,
      transactionId,
      txData.date,
      realizedProfitLoss
    );
  }
}
