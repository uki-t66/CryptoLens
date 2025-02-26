import { pool } from '../config/database';
import { checkAndInsertCoinIfNeeded } from "./coin-master-service";
import { updateUserPositionsAndCalcProfit } from "./user-positions-service";
import { insertRealizedProfitLoss } from "./realized-profit-loss-service";
import { TransactionRow } from "../types/tx-types";


export async function createTransactionService(userId: number, txData: TransactionRow) {

  // txDataのcoin_idがcoin_masterテーブルに登録されているかどうかチェックし、なければ登録(INSERT)する関数
  const coinId = await checkAndInsertCoinIfNeeded(txData.coin_id, txData.asset);
  

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
    txData.transactionType,
    txData.asset,
    txData.price,
    txData.amount,
    txData.fee,
    txData.blockchain,
    txData.exchangeRate,
    txData.file || null,
    txData.tx_hash || null,
    txData.tx_notes || null,
    coinId
  ]);

  
  // transactionsテーブルで生成されたtransaction_id
  const transactionId = (result as any).insertId;

  // user_positionsの更新 (Buy or Sell に応じて処理)
  const realizedProfitLoss = await updateUserPositionsAndCalcProfit(
    userId,
    coinId,
    txData.transactionType,
    txData.amount,
    txData.price,
    txData.fee
  );


  // Sellなどで確定損益がある場合は realized_profit_lossテーブルにINSERT
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
