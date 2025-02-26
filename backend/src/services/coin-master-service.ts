import { pool } from '../config/database';

// coin_idがcoin_masterに存在するか確認し、なければINSERTする関数
export async function checkAndInsertCoinIfNeeded(coinId: string, asset: string) {

    // coin_masterテーブルにcoinIdが存在するかチェック
    const [rows] = await pool.execute(
        `SELECT coin_id FROM coin_master WHERE coin_id = ?`,
        [coinId]
        );

    // 登録されていたら処理終了
    if((rows as any[]).length > 0){
        return coinId;
    } 
    // coin_masterテーブルにcoinIdが無ければ新たにcoinIdを登録
    else {

            // コインゲッコーAPI
            const COINGECKO_API = process.env.COINGECKO_API;
            // coinIdからcoinの詳細情報を取得
            const response = await fetch(`${COINGECKO_API}/coins/${coinId}`);

            if (!response.ok) {
            throw new Error("CoinGeckoからの詳細データの取得に失敗しました");
            }
            // Coingeckoから取得した詳細データ
            const data = await response.json();

            // 詳細データを元にcoin_masterテーブルにINSERT
            await pool.execute(`
                INSERT INTO coin_master (coin_id, symbol, name) VALUES (?, ?, ?)
            `, [coinId, data.symbol , data.name]);

            return coinId;
    }

}
