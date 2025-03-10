import express from 'express';
import multer from "multer";
import { createTransaction, getTransactions, deleteTransaction, getAssetSummary } from '../controllers/tx-controller';
import { authMiddleware } from '../middleware/auth-middleware';

const router = express.Router();
const upload = multer();

router.post('/', authMiddleware, upload.none(), createTransaction);
router.get('/', authMiddleware, getTransactions);
router.get('/summary', authMiddleware, getAssetSummary);
router.delete('/:transactionId', authMiddleware, deleteTransaction); 
// router.put('/:id', authMiddleware, updateTransaction);

export default router;