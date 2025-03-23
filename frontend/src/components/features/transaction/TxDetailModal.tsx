import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "lucide-react"

import { TransactionData } from "@/types/transaction-types"
import { toast } from "@/hooks/use-toast"

const API_URL = import.meta.env.VITE_API_URL

interface TxDetailProps {
  isOpen: boolean
  onClose: () => void
  transaction: TransactionData
  fetchTransactions: () => void
}

/**
 * 取引の詳細を表示しつつ、編集と削除が行えるモーダルコンポーネント
 */
export const TxDetailModal = ({
  isOpen,
  onClose,
  transaction,
  fetchTransactions,
}: TxDetailProps) => {

  // 削除処理(物理的にレコード削除ではなく論理削除(ソフトデリートを採用),会計システムの取引方式を採用。 物理的に削除してしまうとテーブル間の整合性が崩れてしまうため。)
  const handleDelete = async (transactionId: number) => {
    if (confirm("この取引を削除してもよろしいですか？")) {
      try {
        const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
          method: "DELETE",
          credentials: "include",
        })
        if (response.ok) {
          fetchTransactions()
          // モーダルを閉じたい場合は下記を有効化
          onClose()
          toast({
            title: "Success",
            description: "Transaction deleted successfully",
            className: "bg-gray-800 border-gray-700 text-white",
          })
        } else {
          console.error("Failed to delete transaction.")
        }
      } catch (error) {
        console.error("Error deleting transaction:", error)
      }
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Dialogが閉じるタイミング (open=false) で onClose() を呼び出す
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-[780px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Transaction Detail</DialogTitle>
          <DialogDescription>
            取引履歴の詳細閲覧と取引履歴を削除することができます。
          </DialogDescription>
        </DialogHeader>

        {/* 取引の詳細表示*/}
        <div className="mt-4 space-y-2 text-sm">
          <p>
            <strong>Date:</strong>{" "}
            {new Date(transaction.date).toLocaleString()}
          </p>
          <p>
            <strong>Exchange:</strong> {transaction.exchange}
          </p>
          <p>
            <strong>Type:</strong> {transaction.transaction_type}
          </p>
          <p>
            <strong>Asset:</strong> {transaction.asset}
          </p>
          <p>
            <strong>Price:</strong> {transaction.price}
          </p>
          <p>
            <strong>Amount:</strong> {transaction.amount}
          </p>
          <p>
            <strong>Fee:</strong> {transaction.fee}
          </p>
          <p>
            <strong>Blockchain:</strong> {transaction.blockchain}
          </p>
          <p>
            <strong>Hash:</strong> {transaction.tx_hash}
          </p>
        </div>

        {/* 編集フォーム (Price, Amount, Feeなど) */}
        <form className="space-y-4 mt-6">
          <div className="flex justify-end gap-2">
            {/* キャンセルボタン */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </Button>
            {/* 削除ボタン */}
            <Button
            onClick={() => handleDelete(transaction.transaction_id)}
            className="bg-red-600 text-white hover:bg-red-700"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete this transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}