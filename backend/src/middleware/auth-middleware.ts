import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        // cookieにあるjwtをtokenに格納
        const token = req.cookies.jwt;
        
        if (!token) {
            res.status(401).json({
                success: false,
                message: '認証トークンが必要です'
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: number;
            email: string;
        };

        req.user = decoded;
        console.log(req.user)
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: '無効なトークンです'
        });
    }
};