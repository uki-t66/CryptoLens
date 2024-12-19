import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();  // Routerのインスタンスを作成

router.post('/register', register);
router.post('/login', login);

export default router;