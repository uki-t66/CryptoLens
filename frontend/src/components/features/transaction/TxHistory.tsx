import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/components/ui/table"

import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious 
    } from "@/components/ui/pagination"


import { useToast } from "@/hooks/use-toast";
import AddIcon from '@mui/icons-material/Add';
import { AddTx } from "./AddTx";
import { useCallback, useEffect, useState } from "react";
import { TransactionData } from "@/types/transaction-types";

const API_URL = import.meta.env.VITE_API_URL;



export const TxHistory = () => {

    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const itemsPerPage = 10; // 1ページあたりの表示件数

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
            })
            ;
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
     const fetchTransactions = useCallback(async () => {
        try {
             // itemsPerPageを使用してAPIリクエスト
            const response = await fetch(`${API_URL}/transactions?page=${currentPage}&limit=${itemsPerPage}`, {
                credentials: 'include'
            });
            const data = await response.json();
            setTransactions(data.transactions);
            // 総ページ数を設定
            setTotalPages(Math.ceil(data.total / itemsPerPage));
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    }, [currentPage, itemsPerPage]); // currentPage と itemsPerPage を依存配列に追加

    // TxHistory.tsxがマウント時に実行
        useEffect(() => {
            fetchTransactions();
        }, [fetchTransactions]);


    return (
    
        <div className="mx-10 h-[88%] mb-8 bg-gray-800 rounded-lg shadow-sm border border-gray-700 flex flex-col">
      
            {/* sticky top-0 & z-10 で上部固定する部分 */}
            <div className="sticky top-0 z-10 bg-gray-800 border-gray-700">
                {/* ページネーションの行 */}
                <div className="flex items-center py-4">
                    {/* ページネーションを中央に配置 */}
                    <div className="flex-1 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                        {/* 前のページ */}
                        <PaginationItem
                            className={currentPage === 1 ? "text-transparent" : "text-white"}
                        >
                            <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) {
                                setCurrentPage((prev) => prev - 1);
                                }
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
        
                        {/* ページ番号 */}
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(i + 1);
                                }}
                                className={currentPage !== i + 1 ? 'text-white' : ''} 
                                isActive={currentPage === i + 1}
                            >
                                {i + 1}
                            </PaginationLink>
                            </PaginationItem>
                        ))}
        
                        {/* 次のページ */}
                        <PaginationItem>
                            <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) {
                                setCurrentPage((prev) => prev + 1);
                                }
                            }}
                            className={`text-white ${
                                currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                            }`}
                            />
                        </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                    </div>
        
                    {/* ボタンを右端に配置 */}
                    <button
                    onClick={() => setIsModalOpen(true)}
                    className="mx-4 px-7 rounded-lg shadow-sm border border-gray-400 text-white hover:bg-gray-500 transition-all duration-200"
                    >
                        <AddIcon />
                    </button>
                </div>
            </div>
  
            {/* トランザクション履歴テーブル */}
            <div className="mx-4 relative bg-gray-800 border-gray-700 overflow-x-auto">
                <Table className="table-fixed w-full">
                    <TableCaption className="text-gray-400 mb-4">
                        Crypto Currency Transaction History
                    </TableCaption>
                    {/* スティッキーヘッダー */}
                    <TableHeader className="sticky top-0 bg-gray-800">
                        <TableRow className="border-b border-gray-700 hover:bg-transparent">
                        <TableHead className="text-gray-200 font-medium">Date</TableHead>
                           <TableHead className="text-gray-200 font-medium">Exchange</TableHead>
                           <TableHead className="text-gray-200 font-medium">Type</TableHead>
                           <TableHead className="text-gray-200 font-medium">Asset</TableHead>
                           <TableHead className="text-gray-200 font-medium text-right">Price</TableHead>
                           <TableHead className="text-gray-200 font-medium text-right">Amount</TableHead>
                           <TableHead className="text-gray-200 font-medium text-right">Fee</TableHead>
                           <TableHead className="text-gray-200 font-medium text-right">Total</TableHead>
                           <TableHead className="text-gray-200 font-medium text-right">Chain</TableHead>
                           <TableHead className="text-gray-200 font-medium text-right">Rate</TableHead>
                           <TableHead className="text-gray-200 font-medium">Hash</TableHead>
                        </TableRow>
                    </TableHeader>
                    {/* トランザクションデータの表示 */}
                    <TableBody className="overflow-auto">
                        {transactions.map((tx) => (
                            <TableRow 
                                key={tx.transaction_id}
                                className="border-b border-gray-700"
                            >
                                {/* 日付 */}
                                <TableCell className="font-medium text-gray-200">
                                    {new Date(tx.date).toLocaleDateString()}
                                </TableCell>
                                {/* 取引所 */}
                                <TableCell>{tx.exchange}</TableCell>
                                {/* 取引タイプ（Buy/Sellで色分け） */}
                                <TableCell className={`
                                    ${tx.transaction_type === 'Buy' && 'text-green-400'}
                                    ${tx.transaction_type === 'Transfer' && 'text-blue-400'}
                                    ${(tx.transaction_type === 'Sell' || tx.transaction_type === 'Reward') && 'text-red-400'}
                                    font-medium
                                `}>
                                    {tx.transaction_type}
                                </TableCell>
                                {/* 資産 */}
                                <TableCell className="font-medium text-gray-200">
                                    {tx.asset}
                                </TableCell>
                                {/* 価格（小数点以下の表示制御） */}
                                <TableCell className="text-right">
                                    ${Number(tx.price).toLocaleString(undefined, {
                                        minimumFractionDigits: Number(tx.price) < 10 ? 5 : 2,
                                        maximumFractionDigits: Number(tx.price) < 10 ? 5 : 2
                                    })}
                                </TableCell>
                                {/* 数量（小数点以下の表示制御） */}
                                <TableCell className="text-right">
                                    {Number(tx.amount).toLocaleString(undefined, {
                                        minimumFractionDigits: Number(tx.amount) < 10 ? 5 : 2,
                                        maximumFractionDigits: Number(tx.amount) < 10 ? 5 : 2
                                    })}
                                </TableCell>
                                {/* 手数料 */}
                                <TableCell className="text-right">
                                    ${Number(tx.fee).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </TableCell>
                                {/* 合計金額 */}
                                <TableCell className="text-right">
                                    ${(Number(tx.price) * Number(tx.amount)).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </TableCell>
                                {/* ブロックチェーン */}
                                <TableCell className="text-right">{tx.blockchain}</TableCell>
                                {/* 為替レート */}
                                <TableCell className="text-right">
                                    ¥{tx.exchange_rate}
                                </TableCell>
                                {/* トランザクションハッシュ（長い文字列を省略表示） */}
                                <TableCell>
                                    <div className="w-[78px] overflow-hidden group">
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