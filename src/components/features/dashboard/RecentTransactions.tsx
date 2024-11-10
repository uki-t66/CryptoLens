interface Transaction {
    id: string;
    date: string;
    type: 'buy' | 'sell' | 'transfer';
    coin: string;
    amount: string;
    price: string;
    status: 'completed' | 'pending' | 'failed';
  }
  
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-03-01 15:30',
      type: 'buy',
      coin: 'BTC',
      amount: '0.1',
      price: '¥650,000',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-03-01 14:20',
      type: 'sell',
      coin: 'ETH',
      amount: '2.5',
      price: '¥480,000',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-03-01 12:45',
      type: 'transfer',
      coin: 'USDT',
      amount: '1000',
      price: '¥150,000',
      status: 'pending'
    },
  ];
  
export const RecentTransactions = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">最近のトランザクション</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-gray-400 font-medium">日時</th>
                <th className="pb-3 text-gray-400 font-medium">タイプ</th>
                <th className="pb-3 text-gray-400 font-medium">コイン</th>
                <th className="pb-3 text-gray-400 font-medium">数量</th>
                <th className="pb-3 text-gray-400 font-medium">価格</th>
                <th className="pb-3 text-gray-400 font-medium">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-700">
                  <td className="py-4 text-gray-300">{tx.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${tx.type === 'buy' ? 'bg-emerald-400/10 text-emerald-400' :
                        tx.type === 'sell' ? 'bg-red-400/10 text-red-400' :
                        'bg-blue-400/10 text-blue-400'}`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-gray-300">{tx.coin}</td>
                  <td className="py-4 text-gray-300">{tx.amount}</td>
                  <td className="py-4 text-gray-300">{tx.price}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${tx.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                        tx.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                        'bg-red-400/10 text-red-400'}`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };