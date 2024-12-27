import express from 'express';
import { createTransaction, getTransactions } from '../controllers/tx-controllers';
import { authMiddleware } from '../middleware/auth-middleware';

const router = express.Router();

router.post('/', authMiddleware, createTransaction);
router.get('/', authMiddleware, getTransactions);

export default router;