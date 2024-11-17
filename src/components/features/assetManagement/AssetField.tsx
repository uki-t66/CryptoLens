interface CoinData {
    id: number;
    coin: string;
    price: number; // 文字列化される可能性があるためunion型
    amount: number;
    ticker: string
    value?: number; // 計算後に値が追加される
  }

const data: CoinData[] = [
    {
        id: 1,
        coin: "Bitcoin", 
        price: 80000,
        amount: 1.5,
        ticker: "BTC"
    },
    {   
        id: 2,
        coin: "Ethereum",
        price: 5000,
        amount: 3,
        ticker: "ETH"
    },
]


export const AssetField = () => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700 mb-8">
            {/* columnヘッダー */}
            <div className="bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-600">
                <ul className="text-white grid grid-cols-6">
                    <li>Asset</li>
                    <li>Price</li>
                    <li>Amount</li>
                    <li>Total Value</li>
                    <li>Profit / Loss</li> {/* 日、月、年ごとにソート可能にする。下のliと連動。 */}
                    <li>24h Change</li>
                </ul>
            </div>
            {/* assetの詳細情報 */}
            <div className="text-white">
                <ul>
                    { data.map((item) => {
                        return(
                            <li key={item.id} className="grid grid-cols-6 p-6 ">
                                <div>
                                    { item.coin }
                                </div>
                                <div>
                                    { item.price }
                                </div>
                                <div>
                                    { item.amount } { item.ticker}
                                </div>
                                <div>
                                    { `$${item.price * item.amount}` }
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}