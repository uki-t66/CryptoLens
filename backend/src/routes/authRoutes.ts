import { Router } from 'express';
import { register, login, verifyAuth } from '../controllers/authController';

const router = Router();  // Routerのインスタンスを作成

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyAuth);

export default router;