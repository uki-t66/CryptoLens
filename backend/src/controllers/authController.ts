import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';


// パスワードバリデーション関数
const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
};

// 新規登録
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // メールアドレスの重複チェック　//rowsのみ使用するため分割代入する
        const [existing] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (Array.isArray(existing) && existing.length > 0) {
            res.status(400).json({
                success: false,
                message: 'このメールアドレスは既に登録されています'
            });
            return;
        }

        // パスワードのバリデーション
        if (!validatePassword(password)) {
            res.status(400).json({
                success: false,
                message: 'パスワードは8文字以上で、大文字、小文字、数字、記号を含む必要があります'
            });
            return;
        }

        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);

        // ユーザーの作成
        const [result] = await pool.execute(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        const userId = (result as any).insertId;

        // JWTトークンの生成
        const token = jwt.sign(
            { id: userId, email },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        // HTTPOnly Cookieを使用
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24時間
        });
        
         // 成功レスポンスを送信
         res.status(201).json({
            success: true,
            message: '登録が完了しました'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: '登録に失敗しました'
        });
    }
};

// ログイン
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // ユーザーの検索
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const user = (users as any[])[0];

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが間違っています'
            });
            return;
        }

        // パスワードの検証
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが間違っています'
            });
            return;
        }

        // JWTトークンの生成
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        // HTTPOnly Cookieを使用
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24時間
        });

        res.json({
            success: true,
            message: 'ログインに成功しました',
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'ログインに失敗しました'
        });
    }
};


export const verifyAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.cookies.jwt;
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
        return;
      }
  
      // トークンの検証
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: number;
        email: string;
      };
  
      res.json({
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: '無効なトークンです'
      });
    }
  };