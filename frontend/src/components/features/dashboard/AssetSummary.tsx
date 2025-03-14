import { AssetSummaryProps } from "@/types/assets-types";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useState } from "react";

interface AssetSummaryItemProps {
    title: string;
    value: number;
    jpyValue: number;
    change?: number;
    changeCurrency?: JSX.Element;
    usdProfitLossAmount?: number;
    jpyProfitLossAmount?: number;
    alwaysGreen?: boolean
  }


  export const AssetSummary:React.FC<AssetSummaryProps> = ( { JPY, Assets } ) => {

    console.log(Assets[0])

    // 保有している通貨の現在価格を合算したドル表記の総資産額
    const totalUsdValue = Number(
      Assets.reduce((totalValue, asset) => totalValue + asset.totalValue, 0)
      .toFixed(2)
    );

    // 総資産額の日本円表記
    const totalJpyValue = Number(
      (totalUsdValue * JPY).toFixed(2)
    );

    // 保有通貨の原資(USD)
    const initialInvestment = Assets.reduce(
      (sum, asset) => sum + (asset.amount * asset.averageCost),
      0
    );

    // 平均取得単価から総資産変動率を算出
    const totalValueChangeRate = Number(
      (((totalUsdValue / initialInvestment) - 1) * 100).toFixed(2)
    );

    // 総資産の含み損益(USD)
    const usdProfitLossAmount = Number(
      Assets.reduce(
        (acc, asset) => acc + asset.profitLossAmount,
        0
      ).toFixed(1)
    );

    // 総資産の含み損益(JPY)
    const jpyProfitLossAmount = Number(
      (usdProfitLossAmount * JPY).toFixed(1)
    );

    

    // 24H前の通貨の価格データの合計
    const totalValue24hAgo = Assets.reduce((sum, coin) => {
      let rawStr = coin.change24h;  //string型

      if (!rawStr) {
        rawStr = "0";
      }

      // 余分なスペース除去
      rawStr = rawStr.trim(); 

      //末尾の "%" を除去
      rawStr = rawStr.replace("%", "");

      // 数値に変換
      const changeValue = parseFloat(rawStr); 

      if (isNaN(changeValue)) {
        // 万が一数値化できない場合: 何らかのエラー処理 or 0扱い
        console.warn("Invalid 24hChange format:", coin.change24h);
        return sum + (coin.amount * coin.currentPrice); // 0%扱い
      }

      //パーセントを小数に変換
      const decimalChange = changeValue / 100;

      //その通貨の24h前価格
      const price24h = coin.currentPrice / (1 + decimalChange);

      // 保有量×24h前価格=24h前評価額を合計
      return sum + (coin.amount * price24h);

    }, 0);

    // 24h含み損益(USD)
    const profitLoss24hUsd = totalUsdValue - totalValue24hAgo;
    // 24h含み損益(JPY)
    const jpyProfitLoss24h = (totalUsdValue - totalValue24hAgo) * JPY;


    // パーセント表示 (24h前評価額が0じゃない前提)
    const profitLoss24hPercent = totalValue24hAgo > 0
          ? Number(((profitLoss24hUsd / totalValue24hAgo) * 100).toFixed(1))
          : 0;


    // 確定損益(USD)
    const totalRealizedProfitLoss = Assets && Assets.length > 0 && Assets[0].totalRealizedProfitLoss !== undefined
            ? Number(Number(Assets[0].totalRealizedProfitLoss).toFixed(1))
            : 0;
    // 確定損益(JPY)
    const jpyTotalRealizedProfitLoss = totalRealizedProfitLoss * JPY


    console.log(typeof totalRealizedProfitLoss)

    
    
   
    return (
      <>
        <AssetSummaryItem 
          title="総資産"
          value={totalUsdValue}
          jpyValue={totalJpyValue}
          change={totalValueChangeRate}
          changeCurrency={<SwapHorizIcon/>}
          usdProfitLossAmount={usdProfitLossAmount}
          jpyProfitLossAmount={jpyProfitLossAmount}
        />
        <AssetSummaryItem 
          title="24H含み損益"
          value={profitLoss24hUsd}
          jpyValue={jpyProfitLoss24h}
          change={profitLoss24hPercent}
          changeCurrency={<SwapHorizIcon/>}
          
          
        />
        <AssetSummaryItem 
          title="年間確定損益"
          value={totalRealizedProfitLoss}
          jpyValue={jpyTotalRealizedProfitLoss}
          changeCurrency={<SwapHorizIcon/>}
          alwaysGreen={true}
        />
      </>
    )
  }
  

  
const AssetSummaryItem = ({ title, value, jpyValue, change, changeCurrency, usdProfitLossAmount, jpyProfitLossAmount, alwaysGreen }: AssetSummaryItemProps) => {
  const [usdToJpy, setUsdToJpy] = useState<boolean>(true)

  // dashboardのドル表記を円に切り替える関数
  const handleClick = () => {
    setUsdToJpy(!usdToJpy);
  }

  // 色クラスの決定
  const profitColorClass = alwaysGreen
      ? "text-green-300"
      : usdProfitLossAmount !== undefined
      ? usdProfitLossAmount >= 0
        ? "text-green-300"
        : "text-red-500"
      : value >= 0
      ? "text-green-300"
      : "text-red-500";



    return (
        <div className="flex flex-col justify-around h-[200px] 2xl:h-[230px] bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold 2xl:text-2xl text-white mb-2">{title}</h3>
            <h4 onClick={handleClick} className="text-xl p-1 text-white cursor-pointer transition duration-200 hover:bg-gray-700 rounded-full">{ changeCurrency }</h4>
          </div>
          <div
            className={`text-2xl font-bold mb-2 ${profitColorClass}`}
          >
            {usdToJpy ? (
                <>
                  ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {usdProfitLossAmount !== undefined && (
                    <> ($
                      {usdProfitLossAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    )</>
                  )}
                </>
              ) : (
                <>
                  ¥{jpyValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {jpyProfitLossAmount !== undefined && (
                    <> (¥
                      {jpyProfitLossAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    )</>
                  )}
                </>
              )}

          </div>

          {/* 損益がプラスであればgreen,マイナスであればレッド */}
          {change !== undefined && (
            <div className={`text-lg ${change >= 0 ? 'text-green-300' : 'text-red-500'}`}>
              {change >= 0 ? '△' : '▽'}{change}%
            </div>
          )}
        </div>
    )
  }
  
