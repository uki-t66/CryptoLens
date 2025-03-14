import { Router } from 'express';
import { register, login, verifyAuth, logout } from '../controllers/auth-controller';

const router = Router();  // Routerのインスタンスを作成

router.post('/register', register);
router.post('/login', login);
router.post("/logout",logout)
router.get('/verify', verifyAuth);

export default router;