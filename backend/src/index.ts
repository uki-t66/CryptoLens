import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルートハンドラー
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to CryptoLens API' });
});

// 基本的なAPIエンドポイント
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// エラーハンドリング
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// サーバーの起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// エラー処理のためのイベントリスナー
process.on('unhandledRejection', (err: Error) => {
  console.log('Unhandled Rejection:', err.message);
  process.exit(1);
});

export default app;