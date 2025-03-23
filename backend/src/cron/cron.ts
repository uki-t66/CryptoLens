import cron from 'node-cron';
import { pool } from '../config/database';





/**
 * 毎日0時に user_positions × CoinGecko でユーザごとの総資産を計算し、
 * asset_history に保存する。
 */
export function scheduleDailyAssetHistory() {
  cron.schedule('0 0 * * *', async () => {
    console.log("=== Daily asset_history cron started ===");
    try {
      // 1) user_positions × coin_master 全員分を取得
      //    user_positionsには (user_id, coin_id, total_amount, total_cost, average_cost...)
      //    coin_masterには symbolなどがあるが、ここで coin_master.coin_id は
      //    CoinGeckoの ID としてマッピングしていることを前提とする
      const [positions] = await pool.query(`
        SELECT up.user_id,
               up.coin_id,         -- 例: "bitcoin"
               up.total_amount,
               cm.symbol,
               cm.coin_id AS gecko_id  -- coin_master の coin_id が geckoのIDの場合
        FROM user_positions up
        JOIN coin_master cm ON up.coin_id = cm.coin_id
      `);

      if ((positions as any[]).length === 0) {
        console.log("No user_positions found. Nothing to do.");
        return;
      }

      // 2) CoinGecko用に全coin_idを集める (重複除去)
      //    例: ["bitcoin","ethereum","solana",...]
      const uniqueCoinIds = Array.from(
        new Set((positions as any[]).map((p) => p.gecko_id))
      );

      // 3) CoinGecko API呼び出し(まとめて)
      const coinIdsParam = uniqueCoinIds.join(",");
      const COINGECKO_API = process.env.COINGECKO_API || "https://api.coingecko.com/api/v3";
      const url = `${COINGECKO_API}/simple/price?ids=${coinIdsParam}&vs_currencies=usd&include_24hr_change=false`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CoinGecko fetch failed: ${response.statusText}`);
      }
      const priceData = await response.json();
      // priceData: { bitcoin:{ usd: 25000 }, ethereum:{ usd:1800 }, ... }

      // 4) ユーザごとに totalValue を合計
      //   ここで "usd" → 円換算する場合はさらに為替レートを呼ぶか
      //   日本円価格を coin_masterに備えているならそこから取得など実装次第
      interface UserValueMap {
        [userId: number]: number; // 累積総資産(USD or 円)
      }

      const userValueMap: UserValueMap = {};

      for (const pos of positions as any[]) {
        const userId = pos.user_id;
        const geckoId = pos.gecko_id;   // coin_master.coin_id => "bitcoin" など
        const amount  = Number(pos.total_amount) || 0;

        // CoinGeckoでの現在価格(USD)
        const coinInfo = priceData[geckoId] || {};
        const currentPrice = coinInfo.usd || 0;

        // そのコインの保有総額
        const subValue = amount * currentPrice;

        if (!userValueMap[userId]) {
          userValueMap[userId] = 0;
        }
        userValueMap[userId] += subValue;
      }

      // もし円換算したいなら、別途為替レートを呼び出して userValueMap[userId] *= 円レート;

      // 5) asset_history にアップサート
      //   各ユーザごとにINSERT
      for (const [userIdStr, totalVal] of Object.entries(userValueMap)) {
        const userId = Number(userIdStr);
        // 例: totalValをDECIMAL(20,2)に丸める
        const roundedVal = Math.round(totalVal * 100)/100;

        await pool.execute(`
          INSERT INTO asset_history (user_id, date, total_value)
          VALUES (?, CURDATE(), ?)
          ON DUPLICATE KEY UPDATE
            total_value = VALUES(total_value),
            created_at = CURRENT_TIMESTAMP
        `, [userId, roundedVal]);
      }

      console.log("=== Daily asset_history cron finished ===");
      console.log(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    } catch (error) {
      console.error("Daily asset_history cron error:", error);
    }
  },{
    timezone: 'Asia/Tokyo'
  });
}
