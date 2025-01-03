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
  
  import { EditTx } from "./EditTx"  // <-- ここでimportする
  
  
  const API_URL = import.meta.env.VITE_API_URL
  
  export const TxHistory = () => {
    
  
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false) // 「+」で開くAddTx用
    const [transactions, setTransactions] = useState<TransactionData[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(0)
    const itemsPerPage = 10
  
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
      try {
        const response = await fetch(
          `${API_URL}/transactions?page=${currentPage}&limit=${itemsPerPage}`,
          { credentials: "include" }
        )
        const data = await response.json()
        setTransactions(data.transactions)
        setTotalPages(Math.ceil(data.total / itemsPerPage))
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
      }
    }, [currentPage, itemsPerPage])
  
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
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
                <TableHead className="w-[50px]"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-auto">
              {transactions.map((tx) => (
                <TableRow key={tx.transaction_id} className="border-b border-gray-700">
                  <TableCell className="font-medium text-gray-200">
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-200">
                    {tx.exchange}
                  </TableCell>
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
                  <TableCell className="font-medium text-gray-200 text-right">{tx.asset}</TableCell>
                  <TableCell className="text-right">
                    $
                    {Number(tx.price).toLocaleString(undefined, {
                        // priceが$10以下の場合、小数点4桁まで表示
                      minimumFractionDigits: Number(tx.price) < 10 ? 4 : 2,
                      maximumFractionDigits: Number(tx.price) < 10 ? 4 : 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">{Number(tx.amount)}</TableCell>
                  <TableCell className="text-right">${Number(tx.fee)}</TableCell>
                  <TableCell className="text-right">
                    $
                    {(
                      Number(tx.price) * Number(tx.amount)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-200">
                    {tx.blockchain}
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-200">
                    ¥{tx.exchange_rate}
                  </TableCell>
                  <TableCell>
                    <div className="w-[78px] overflow-hidden group">
                      <div
                        className="overflow-x-auto whitespace-nowrap text-gray-400 cursor-pointer group-hover:text-gray-200 transition-colors"
                        onClick={() => tx.tx_hash && handleCopy(tx.tx_hash)}
                        title="Click to copy"
                      >
                        {tx.tx_hash}
                      </div>
                    </div>
                  </TableCell>
                  {/* EditTx コンポーネントを呼び出し (モーダル+フォーム+削除) */}
                  <TableCell>
                    <EditTx
                      tx={tx}
                      fetchTransactions={fetchTransactions}
                    />
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
        </div>
      </div>
    )
  }