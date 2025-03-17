import express from 'express';
import { authMiddleware } from '../middleware/auth-middleware';
import { getDailyAssetHistory } from '../controllers/history-controller';

const router = express.Router();


router.get('/daily-asset', authMiddleware, getDailyAssetHistory);


export default router;