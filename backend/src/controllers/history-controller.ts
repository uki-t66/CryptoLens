import { Request, Response } from 'express';
import { pool } from '../config/database';

// ユーザごとの asset_history を取得して返すAPI
export const getDailyAssetHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    // 認証ミドルウェアで user をセットしている想定
    const userId = (req as any).user?.id;
    if (!userId) {
       res.status(401).json({ error: 'Unauthorized' });
    }

    console.log("どうもー")

    // asset_historyからユーザの全期間 or 直近30日などを取得
    // 例: 直近30日にしたいなら WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    const [rows] = await pool.query(`
      SELECT date, total_value
      FROM asset_history
      WHERE user_id = ?
      ORDER BY date ASC
    `, [userId]);


    
    // rows: [ { date:'2025-06-01', total_value:2400000 }, ... ]
    // フロントで使いやすい形 { date, value } に変換
    const data = (rows as any[]).map(r => ({
      date: r.date.toISOString().split("T")[0],
      value: Number(r.total_value)
    }));

    console.log(data[0].date)


    res.json({ data });
  } catch (error) {
    console.error("getDailyAssetHistory error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
