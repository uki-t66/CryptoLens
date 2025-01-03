import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreVerticalIcon, TrashIcon } from "lucide-react"

import { TransactionData } from "@/types/transaction-types"
import { toast } from "@/hooks/use-toast"

const API_URL = import.meta.env.VITE_API_URL

interface EditTxProps {
  tx: TransactionData
  fetchTransactions: () => void
}

/**
 * TxHistoryのテーブル行ごとに表示される「編集モーダル＋削除ボタン」をまとめたコンポーネント
 * @param {TransactionData} tx - 対象となる取引情報
 * @param {function} fetchTransactions - 取引履歴を再取得する関数
 */


export const EditTx = ({ tx, fetchTransactions }: EditTxProps) => {
    
  // ダイアログの開閉状態を管理
  const [open, setOpen] = useState(false)

  // フォーム入力用のステート
  const [price, setPrice] = useState(tx.price)
  const [amount, setAmount] = useState(tx.amount)
  const [fee, setFee] = useState(tx.fee)

  // 取引を更新するハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/transactions/${tx.transaction_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ price, amount, fee }),
      })

      if (response.ok) {
        // 更新成功 -> 一覧を再取得
        fetchTransactions()
        // モーダルを閉じる
        setOpen(false)
      } else {
        console.error("Failed to update transaction.")
      }
    } catch (error) {
      console.error("Error updating transaction:", error)
    }
  }

   // 取引削除ハンドラー
   const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
          method: "DELETE",
          credentials: "include",
        })
        if (response.ok) {
          fetchTransactions()
          toast({
            title: "Success",
            description: "Transaction deleted successfully",
            className: "bg-gray-800 border-gray-700 text-white",
          })
        }
      } catch (error) {
        console.error("Error deleting transaction:", error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* モーダルを開くトリガー */}
      <DialogTrigger asChild>
        <button onClick={() => setOpen(true)} className="group-hover:opacity-100">
          <MoreVerticalIcon className="h-4 w-4 text-gray-400" />
        </button>
      </DialogTrigger>

      {/* モーダルの中身 */}
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <h2 className="text-lg font-semibold mb-2">Edit Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice((e.target.value))}
              className="bg-gray-700 text-white border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount((e.target.value))}
              className="bg-gray-700 text-white border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="fee">Fee</Label>
            <Input
              id="fee"
              type="number"
              value={fee}
              onChange={(e) => setFee((e.target.value))}
              className="bg-gray-700 text-white border-gray-600"
            />
          </div>
          <div className="flex justify-end gap-2">
            {/* モーダルを閉じるだけのボタン */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-gray-300 text-black hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </form>

        {/* Deleteボタン */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              handleDelete(tx.transaction_id)
              // 削除後にモーダルを閉じたい場合は以下をアンコメント
              // setOpen(false)
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}