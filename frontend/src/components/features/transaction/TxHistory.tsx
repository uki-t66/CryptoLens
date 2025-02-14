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
  import { toast } from "@/hooks/use-toast"
  import AddIcon from "@mui/icons-material/Add"
  import { AddTx } from "./AddTx"
  import { useCallback, useEffect, useState } from "react"
  import { TransactionData } from "@/types/transaction-types"
  import { TxDetailModal } from "./TxDetailModal"
  import { toast as hotToast } from "react-hot-toast"
  
  
  const API_URL = import.meta.env.VITE_API_URL
  
  export const TxHistory = () => {
    
  
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false) // 「+」で開くAddTx用
    const [transactions, setTransactions] = useState<TransactionData[]>([]) //fetchしたtxデータ

    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(0)
    const itemsPerPage = 10

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null)


    const formatCryptoPrice = (price: number): number => {
      const value = Number(price);
    
      if (value < 0.01) {
        return Number(value.toFixed(8));      // 0.00001234
      } else if (value < 1) {
        return Number(value.toFixed(6));      // 0.123456
      } else if (value < 100) {
        return Number(value.toFixed(4));      // 12.3456
      } else  {
        return Number(value.toFixed(3));      // 123.453
      }
    };


    // Tableのレコードクリック時に発火する関数
    const handleRowClick = (tx: TransactionData) => {
      setSelectedTransaction(tx)
      setIsDetailModalOpen(true)
    }
  
    // クリップボードへコピー
    const handleCopy = async (hash: string) => {
      if (!hash) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No hash available to copy",
          duration: 2000,
        })
        return
      }
      try {
        await navigator.clipboard.writeText(hash)
        toast({
          title: "Copied!",
          description: "Transaction hash copied to clipboard",
          className: "bg-gray-800 border-gray-700 text-white",
          duration: 2000,
        })
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to copy",
          description: "Please try again",
          duration: 2000,
        })
      }
    }

   
  
    // 取引履歴を取得
    const fetchTransactions = useCallback(async () => {
       hotToast.promise(
        (async () => {
          const response = await fetch(
            `${API_URL}/transactions?page=${currentPage}&limit=${itemsPerPage}`,
            { credentials: "include" }
          );
    
          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }
    
          const data = await response.json();
          setTransactions(data.transactions);
          setTotalPages(Math.ceil(data.total / itemsPerPage));
          window.dispatchEvent(new Event("transactionsChanged"));
        })(),
        {
          loading: '取引履歴を取得中...',
          success: <b>取引履歴を更新しました。</b>,
          error: <b>取引履歴の取得に失敗しました。</b>,
        }
      );
    }, [currentPage, itemsPerPage]);
  
    useEffect(() => {
      fetchTransactions()
    }, [fetchTransactions])
  
  
    return (
      <div className="mx-10 h-[88%] mb-8 bg-gray-800 rounded-lg shadow-sm border border-gray-700 flex flex-col">
        {/* ページネーション部分 */}
        <div className="sticky top-0 z-10 bg-gray-800 border-gray-700">
          <div className="flex items-center py-4">
            <div className="flex-1 flex justify-center">
              <Pagination>
                <PaginationContent>
                  {/* Previous */}
                  <PaginationItem
                    className={currentPage === 1 ? "text-transparent" : "text-white"}
                  >
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) {
                          setCurrentPage((prev) => prev - 1)
                        }
                      }}
                      className={`text-white
                          ${currentPage === 1 ? "pointer-events-none opacity-50" : ""
                        }`}
                    />
                  </PaginationItem>
  
                  {/* ページ番号 */}
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(i + 1)
                        }}
                        className={currentPage !== i + 1 ? "text-white" : ""}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
  
                  {/* Next */}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) {
                          setCurrentPage((prev) => prev + 1)
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
  
            {/* 「+」ボタン -> AddTxを開く */}
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
            <TableHeader className="sticky top-0 bg-gray-800">
              <TableRow className="border-b border-gray-700 hover:bg-transparent">
                <TableHead className="text-gray-200 font-medium w-[110px]">Date</TableHead>
                <TableHead className="text-gray-200 font-medium text-right w-[100px]">
                  Exchange
                </TableHead>
                <TableHead className="text-gray-200 font-medium text-right w-[90px]">Type</TableHead>
                <TableHead className="text-gray-200 font-medium text-right w-[70px]">Asset</TableHead>
                <TableHead className="text-gray-200 font-medium text-right w-[120px]">Price</TableHead>
                <TableHead className="text-gray-200 font-medium text-right w-[100px]">Amount</TableHead>
                <TableHead className="text-gray-200 font-medium text-right w-[60px]">Fee</TableHead>
                <TableHead className="text-gray-200 font-medium text-right w-[140px]">Total</TableHead>
                <TableHead className="text-gray-200 font-medium text-right w-[100px]">Chain</TableHead>
                <TableHead className="text-gray-200 font-medium text-right w-[100px]">USD/JPY</TableHead>
                <TableHead className="text-gray-200 font-medium w-[100px]">Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-auto">
              {transactions.map((tx) => (
                <TableRow 
                  key={tx.transaction_id}
                  className="border-b border-gray-700 cursor-pointer hover:bg-gray-900 transition-colors"
                  onClick={() => handleRowClick(tx)}
                >
                  {/* 日付 */}
                  <TableCell className="font-medium text-gray-200">
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>

                  {/* 取引所 */}
                  <TableCell className="text-right font-medium text-gray-200">
                    {tx.exchange}
                  </TableCell>

                  {/* 取引種類 */}
                  <TableCell
                    className={`
                      ${tx.transaction_type === "Buy" && "text-green-400"}
                      ${tx.transaction_type === "Transfer" && "text-blue-400"}
                      ${(tx.transaction_type === "Sell" || tx.transaction_type === "Reward") && "text-red-400"}
                      text-right
                    `}
                  >
                    {tx.transaction_type}
                  </TableCell>

                  {/* 通貨 */}
                  <TableCell className="font-medium text-gray-200 text-right">{tx.asset}</TableCell>

                  {/* 通貨価格 */}
                  <TableCell className="text-right">
                    ${ formatCryptoPrice(Number(tx.price))}
                  </TableCell>

                  {/* 数量 */}
                  <TableCell className="text-right">{Number(tx.amount)}</TableCell>

                  {/* 手数料 */}
                  <TableCell className="text-right">${Number(tx.fee)}</TableCell>

                  {/* 合計 */}
                  <TableCell className="text-right">
                    $
                    { formatCryptoPrice(Number(tx.price) * Number(tx.amount) - Number(tx.fee)).toLocaleString() }
                  </TableCell>

                  {/* BlockCain */}
                  <TableCell className="text-right font-medium text-gray-200">
                    {tx.blockchain}
                  </TableCell>

                  {/* 為替 */}
                  <TableCell className="text-right font-medium text-gray-200">
                    ¥{tx.exchange_rate}
                  </TableCell>

                  {/* Tx_hash */}
                  <TableCell>
                    <div className="overflow-hidden group">
                      <div
                        className="overflow-x-auto whitespace-nowrap text-gray-400 cursor-pointer group-hover:text-gray-200 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (tx.tx_hash) {
                            handleCopy(tx.tx_hash)
                          }
                        }}
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
  
          {/* 「+」ボタンで開く新規追加モーダル */}
          <AddTx
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchTransactions}
          />

          {/* 詳細モーダル (TxDetailModal) */}
          {selectedTransaction && (
            <TxDetailModal
              isOpen={isDetailModalOpen}
              onClose={() => setIsDetailModalOpen(false)}
              transaction={selectedTransaction}
              fetchTransactions={fetchTransactions}
            />
          )}
        </div>
      </div>
    )
  }