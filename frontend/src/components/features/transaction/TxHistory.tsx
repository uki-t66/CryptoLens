import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

import { useToast } from "@/hooks/use-toast";
import AddIcon from '@mui/icons-material/Add';
import { AddTx } from "./AddTx";
import { useEffect, useState } from "react";
import { TransactionData } from "@/types/transaction-types";

const API_URL = import.meta.env.VITE_API_URL;



export const TxHistory = () => {

    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<TransactionData[]>([]);

    // トランザクションハッシュをクリップボードにコピーする関数
    const handleCopy = async (hash: string) => {
        if (!hash) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No hash available to copy",
                duration: 2000,
            });
            return;
        }

        try {
            // クリップボードにコピー
            await navigator.clipboard.writeText(hash);
            
            // コピー成功時のトースト通知
            toast({
                title: "Copied!",
                description: "Transaction hash copied to clipboard",
                className: "bg-gray-800 border-gray-700 text-white",  // ダークモード用スタイリング
                duration: 2000,  // 2秒後に自動で消える
            });
        } catch {
            // コピー失敗時のトースト通知
            toast({
                variant: "destructive",  // エラー用スタイル
                title: "Failed to copy",
                description: "Please try again",
                duration: 2000,
            });
        }
    };


     // 保存されたトランザクションを取得
     const fetchTransactions = async () => {
        try {
            const response = await fetch(`${API_URL}/transactions`, {
                credentials: 'include'
            });
            const data = await response.json();
            setTransactions(data.transactions);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    // TxHistory.tsxがマウント時に実行
        useEffect(() => {
            fetchTransactions();
        }, []);


    return (
    
        <div className="mx-10 h-[88%] relative bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-auto mb-8">
                
            {/* Transactionを追加するボタン */}
            <div className="flex items-center justify-end">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-7 m-3 rounded-lg shadow-sm border border-gray-400 text-white hover:bg-gray-500 transition-all duration-200"
                >
                    <AddIcon/>
                </button>
            </div>

            {/* トランザクション履歴テーブル */}
            <div className="mx-4 h-full relative bg-gray-800 border-gray-700">
                <Table className="relative">
                    <TableCaption className="text-gray-400 mb-4">
                        Crypto Currency Transaction History
                    </TableCaption>
                    {/* スティッキーヘッダー */}
                    <TableHeader className="sticky top-0 bg-gray-800/95 supports-[backdrop-filter]:bg-gray-800/75 z-10">
                        <TableRow className="border-b border-gray-700 hover:bg-transparent">
                            <TableHead className="text-gray-200 font-medium">Date</TableHead>
                            <TableHead className="text-gray-200 font-medium">Exchange</TableHead>
                            <TableHead className="text-gray-200 font-medium">Type</TableHead>
                            <TableHead className="text-gray-200 font-medium">Asset</TableHead>
                            <TableHead className="text-gray-200 font-medium text-left">Price</TableHead>
                            <TableHead className="text-gray-200 font-medium text-left">Amount</TableHead>
                            <TableHead className="text-gray-200 font-medium text-left">Fee</TableHead>
                            <TableHead className="text-gray-200 font-medium text-left">Total</TableHead>
                            <TableHead className="text-gray-200 font-medium text-left">Chain</TableHead>
                            <TableHead className="text-gray-200 font-medium text-left">Rate</TableHead>
                            <TableHead className="text-gray-200 font-medium">Hash</TableHead>
                        </TableRow>
                    </TableHeader>
                    {/* トランザクションデータの表示 */}
                    <TableBody className="overflow-auto">
                        {transactions.map((tx) => (
                            <TableRow 
                                key={tx.transaction_id}
                                className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                            >
                                {/* 日付 */}
                                <TableCell className="font-medium text-gray-200">
                                    {new Date(tx.date).toLocaleDateString()}
                                </TableCell>
                                {/* 取引所 */}
                                <TableCell>{tx.exchange}</TableCell>
                                {/* 取引タイプ（Buy/Sellで色分け） */}
                                <TableCell className={
                                    tx.transaction_type === 'Buy' 
                                        ? 'text-green-400 font-medium' 
                                        : 'text-red-400 font-medium'
                                }>
                                    {tx.transaction_type}
                                </TableCell>
                                {/* 資産 */}
                                <TableCell className="font-medium text-gray-200">
                                    {tx.asset}
                                </TableCell>
                                {/* 価格（小数点以下の表示制御） */}
                                <TableCell className="text-left font-mono">
                                    ${Number(tx.price).toLocaleString(undefined, {
                                        minimumFractionDigits: Number(tx.price) < 10 ? 5 : 2,
                                        maximumFractionDigits: Number(tx.price) < 10 ? 5 : 2
                                    })}
                                </TableCell>
                                {/* 数量（小数点以下の表示制御） */}
                                <TableCell className="text-left font-mono">
                                    {Number(tx.amount).toLocaleString(undefined, {
                                        minimumFractionDigits: Number(tx.amount) < 10 ? 5 : 2,
                                        maximumFractionDigits: Number(tx.amount) < 10 ? 5 : 2
                                    })}
                                </TableCell>
                                {/* 手数料 */}
                                <TableCell className="text-left font-mono">
                                    ${Number(tx.fee).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </TableCell>
                                {/* 合計金額 */}
                                <TableCell className="text-left font-mono">
                                    ${(Number(tx.price) * Number(tx.amount)).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </TableCell>
                                {/* ブロックチェーン */}
                                <TableCell>{tx.blockchain}</TableCell>
                                {/* 為替レート */}
                                <TableCell className="text-left font-mono">
                                    ¥{tx.exchange_rate}
                                </TableCell>
                                {/* トランザクションハッシュ（長い文字列を省略表示） */}
                                <TableCell>
                                    <div className="w-[78px] overflow-hidden group relative">
                                        <div className="overflow-x-auto whitespace-nowrap text-gray-400 cursor-pointer group-hover:text-gray-200 transition-colors"
                                            onClick={() => tx.tx_hash && handleCopy(tx.tx_hash)}
                                            title="Click to copy"
                                        >
                                            {tx.tx_hash}
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* トランザクション追加モーダル */}
            <AddTx
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTransactions}
            />
        </div>
    )
}