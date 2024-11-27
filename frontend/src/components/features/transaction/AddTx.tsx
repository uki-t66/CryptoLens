import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


// AddTxコンポーネント
export const AddTx = ({ open, onClose }: { open: boolean; onClose: () => void }) => {

  const handleSubmit = (e: React.FormEvent) => {
    // フォームのデフォルトの送信動作を防ぐ
    e.preventDefault();
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Transaction</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date & Time */}
            <div className="space-y-2">
              <Label htmlFor="datetime" className="text-white">Date & Time</Label>
              <Input 
                type="datetime-local" 
                id="datetime" 
                className="bg-gray-700 text-white border-gray-600" 
              />
            </div>

            {/* Exchange */}
            <div className="space-y-2">
              <Label htmlFor="exchange" className="text-white">Exchange</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binance">Binance</SelectItem>
                  <SelectItem value="coinbase">Coinbase</SelectItem>
                  <SelectItem value="kraken">Kraken</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="txType" className="text-white">Transaction Type</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="reward">Reward</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Asset */}
            <div className="space-y-2">
              <Label htmlFor="asset" className="text-white">Asset</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="btc">BTC</SelectItem>
                  <SelectItem value="eth">ETH</SelectItem>
                  <SelectItem value="sol">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-white">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <Input 
                  type="number" 
                  id="price" 
                  className="pl-6 bg-gray-700 text-white border-gray-600" 
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white">Amount</Label>
              <Input 
                type="number" 
                id="amount" 
                className="bg-gray-700 text-white border-gray-600" 
              />
            </div>

            {/* Fee */}
            <div className="space-y-2">
              <Label htmlFor="fee" className="text-white">Fee ( Tx fee or Transfer fee )</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <Input 
                  type="number" 
                  id="fee" 
                  className="pl-6 bg-gray-700 text-white border-gray-600" 
                />
              </div>
            </div>

            {/* Blockchain */}
            <div className="space-y-2">
              <Label htmlFor="blockchain" className="text-white">Blockchain</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                  <SelectValue placeholder="Select blockchain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitcoin">Bitcoin</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction ID */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="txid" className="text-white">Transaction ID (Optional)</Label>
              <Input 
                id="txid" 
                className="bg-gray-700 text-white border-gray-600" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-gray-700 text-white hover:bg-gray-600 hover:text-gray-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};