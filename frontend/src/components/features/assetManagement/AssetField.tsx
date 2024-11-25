import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"


export const AssetField = () => {
    return (
        // Table の親にdivを配置し、高さとrelativeを設定し、それに'overflow-auto'クラスを追加してスクロールを可能にさせ固定.
        <div className="mx-10 h-[88%] relative bg-gray-800 px-6 rounded-lg shadow-sm border border-gray-700 overflow-auto">
            <Table>
                <TableCaption>Crypto Currency Portfolio.</TableCaption>
                {/* sticky追加でasset数が多くスクロールする場合に対応 */}
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