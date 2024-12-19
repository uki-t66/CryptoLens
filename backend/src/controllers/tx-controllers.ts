import { Request, Response } from 'express';
import { pool } from '../config/database';
import { TransactionForm } from '../types/tx-types';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const transaction: TransactionForm = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO transactions (
        date, 
        exchange, 
        transaction_type, 
        asset, 
        price, 
        amount, 
        fee, 
        blockchain, 
        exchange_rate, 
        transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};