import express from 'express';
import { createTransaction, getTransactions, deleteTransaction, updateTransaction } from '../controllers/tx-controller';
import { authMiddleware } from '../middleware/auth-middleware';

const router = express.Router();

router.post('/', authMiddleware, createTransaction);
router.get('/', authMiddleware, getTransactions);
router.delete('/:id', authMiddleware, deleteTransaction); 
router.put('/:id', authMiddleware, updateTransaction);

export default router;