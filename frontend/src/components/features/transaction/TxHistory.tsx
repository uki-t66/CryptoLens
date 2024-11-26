import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

import AddIcon from '@mui/icons-material/Add';



export const TxHistory = () => {
    return (
        <>
            <div className="mx-10 h-[88%] relative bg-gray-800 px-6 rounded-lg shadow-sm border border-gray-700 overflow-auto mb-8">
                
                {/* Transactionを追加するボタン */}
                <div className="flex items-center justify-end">
                    <button className="px-7 m-3 rounded-lg shadow-sm border border-gray-400 text-white hover:bg-gray-500 transition-all duration-200">
                        <AddIcon/>
                    </button>
                </div>

                <Table>
                    <TableCaption>Crypto Currency Transaction.</TableCaption>
                    {/* sticky追加でasset数が多くスクロールする場合に対応 */}
                    <TableHeader className="sticky top-0 bg-gray-800">
                        <TableRow className="pointer-events-none">
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Exchange</TableHead>
                        <TableHead>Tx Type</TableHead> {/* Buy or Sell or Staking or Reward(Sell枠) or Transfer */}
                        <TableHead>Asset</TableHead>
                        <TableHead>Price</TableHead> {/* usd or jpy 表記 */}
                        <TableHead>Amount</TableHead>
                        <TableHead>Fee</TableHead> {/* 取引手数料、送金手数料、gasFee */}
                        <TableHead>Total</TableHead>
                        <TableHead>BlockChain</TableHead>
                        <TableHead>TXID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                        <TableCell>2024-11-10</TableCell>
                        <TableCell>Binance</TableCell>
                        <TableCell className="text-green-500">Buy</TableCell>
                        <TableCell>SOL</TableCell>
                        <TableCell>$210</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>$10</TableCell>
                        <TableCell>$640</TableCell>
                        <TableCell>solana</TableCell>
                        <TableCell className="max-w-52 overflow-x-auto border border-gray-700">5gse3jBpgwzW9V2qzcY6WTWUbLEcmzVJYkb8vL8FRwKD1Wo8mbs8bheP1WhTvsdeHyam7XiTX6TVKJ1sy8CdVUcEiii</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableBody>
                        <TableRow>
                        <TableCell>2024-11-10</TableCell>
                        <TableCell>Binance</TableCell>
                        <TableCell className="text-green-500">Buy</TableCell>
                        <TableCell>SOL</TableCell>
                        <TableCell>$210</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>$10</TableCell>
                        <TableCell>$640</TableCell>
                        <TableCell>solana</TableCell>
                        <TableCell className="max-w-52 overflow-x-auto border border-gray-700">5gse3jBpgwzW9V2qzcY6WTWUbLEcmzVJYkb8vL8FRwKD1Wo8mbs8bheP1WhTvsdeHyam7XiTX6TVKJ1sy8CdVUcEiii</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div> 
        </>
    )
}