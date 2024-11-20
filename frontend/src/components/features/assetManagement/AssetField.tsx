import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"



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
        // Table の上にdivを配置し、高さとrelativeを設定し、それに'overflow-auto'クラスを追加し固定.
        <div className="h-5/6 relative bg-gray-800 px-6 rounded-lg shadow-sm border border-gray-700 overflow-auto">
            <Table>
                <TableCaption>Crypto Currency Portfolio.</TableCaption>
                {/* sticky追加でasset数が多い場合に対応 */}
                <TableHeader className="sticky top-0 bg-gray-800">
                    <TableRow className="pointer-events-none">
                    <TableHead>Asset</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>24h Change</TableHead> {/* day,month,yearでソート可能にする。Profit / Lossと連動。 */}
                    <TableHead>Profit / Loss</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                    <TableCell>BTC</TableCell>
                    <TableCell>$80,000</TableCell>
                    <TableCell>3</TableCell>
                    <TableCell>$240,000</TableCell>
                    <TableCell className="text-green-500">+ $1200</TableCell>
                    <TableCell className="text-green-500">△10.5%</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}