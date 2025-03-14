import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit2, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useRef } from 'react'
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import { useAssetSummary } from "../assetManagement/useAssetSummary"


const COINGECKO_API = import.meta.env.VITE_COINGECKO_API
const ExchangeRate_API = import.meta.env.VITE_ExchangeRate_API
const API_URL = import.meta.env.VITE_API_URL

// AddTxコンポーネント
export const AddTx = ({ 
  open, 
  onClose, 
  onSuccess 
}: { 
  open: boolean; 
  onClose: () => void
  onSuccess: () => Promise<void>;
}) => {

  // coingeckoからfetchした通貨データの型定義
  interface Coin {
    id: string;
    symbol: string;
    name: string;
    thumb: string;
  }

  const [searchTerm, setSearchTerm] = useState('')         
  const [suggestions, setSuggestions] = useState<Coin[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  const [exchangeRate, setExchangeRate] = useState("")
  const [transactionTypeData, setTransactionTypeData] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [fileName, setFileName] = useState<string | null>(null);
  const [coingeckoId, setCoingeckoId] = useState<string>("") //デフォルト空文字列
  const [isManualMode, setIsManualMode] = useState(false)

  const { fetchAssets } = useAssetSummary();

  // 添付可能なファイル
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "text/plain", // .txt
    "image/jpeg", // .jpg, .jpeg
    "image/png", // .png
  ];

  // --- イベントやロジック関数 ---
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    fetchExchangeRate(newDate)

    // AutoモードかつAssetが入力済みの場合実行
    if(!isManualMode){
      if (selectedCoin) {
        fetchHistoricalPrice(selectedCoin.id, newDate)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowSuggestions(true)

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => {
      searchCrypto(value)
    }, 400)
  }

  // Coingecko APIでコインを検索
  const searchCrypto = async (query: string) => {
    if (!query) {
      setSuggestions([])
      return
    }
    try {
      setIsLoading(true)
      const response = await fetch(`${COINGECKO_API}/search?query=${query}`)
      const data = await response.json()
      const coins: Coin[] = data.coins.slice(0, 5).map((coin: Coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        thumb: coin.thumb
      }))
      setSuggestions(coins)
    } catch (error) {
      console.error('データの取得に失敗:', error)
      toast.error('データの取得に失敗しました。しばらくしてから再試行してください。',{
        duration: 6000,
        position: 'top-right',
      });
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // 検索候補クリック時
  const handleSuggestionClick = (coin: Coin) => {
    setSearchTerm(coin.symbol)
    setSelectedCoin(coin)
    setCoingeckoId(coin.id)
    setSuggestions([])
    setShowSuggestions(false)

    // Autoモードかつ日付が選択されていたら実行
    if(!isManualMode){
      if (selectedDate) {
        fetchHistoricalPrice(coin.id, selectedDate)
      }
    }
  }

  // 過去日時のコイン価格を取得
  const fetchHistoricalPrice = async (coinId: string, date: string) => {
    try {
      setIsLoading(true)
      setIsManualMode(false) // Autoモードに戻す

      const [year, month, day] = date.split('-')
      const formattedDate = `${day}-${month}-${year}`
      const response = await fetch(
        `${COINGECKO_API}/coins/${coinId}/history?date=${formattedDate}`
      )
      const data = await response.json()

      if (data.market_data?.current_price?.usd) {
        const formattedPrice = Number(data.market_data.current_price.usd).toFixed(5)
        setPrice(formattedPrice)
      } else {
        toast.error('この日付の価格データは利用できません。手動入力(Manual mode)に切り替えます。',{
          duration: 9000,
          position: 'top-right',
        });
        setPrice('')
        setExchangeRate("")
        setIsManualMode(true)
      }
    } catch (error) {
      console.error('価格の取得に失敗:', error)
      toast.error('1年前の価格データは取得できません。手動入力に切り替えます。',{
        duration: 9000,
        position: 'top-right',
      });
      setPrice('')
      setIsManualMode(true)
    } finally {
      setIsLoading(false)
    }
  }

  // 為替レートを取得 (USD / JPY)
  const fetchExchangeRate = async (date: string) => {
    if (isManualMode) {
      return setExchangeRate("")
    }
    try {
      setIsLoading(true)
      const response = await fetch(
        `${ExchangeRate_API}/${date}?from=USD&to=JPY`
      )
      const data = await response.json()
      if (data.rates?.JPY) {
        const formattedRate = Number(data.rates.JPY).toFixed(2)
        setExchangeRate(formattedRate)
      } else {
        toast.error('この日付の為替レートがありません',{
          duration: 7000,
          position: 'top-right',
        });
        setExchangeRate("")
      }
    } catch (error) {
      console.error('為替レートの取得に失敗:', error)
      toast.error('為替レートの取得に失敗しました',{
        duration: 7000,
        position: 'top-right',
      });
      setExchangeRate("")
    } finally {
      setIsLoading(false)
    }
  }

  // 表示切替(Manual or Auto)
  const changeInputMode = () => {
    setIsManualMode(!isManualMode)
  }

  // アンマウント時のデバウンスキャンセル
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  // 画面外クリックで検索候補を閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.crypto-search-container')) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  // 添付したファイルが許可されているか確認して、画面に表示させる関数。  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (!allowedMimeTypes.includes(file.type)) {
        toast.error("許可されていないファイル形式です！",{
          duration: 7000,
          position: 'top-right',
        });
        event.target.value = ""; // ファイル選択をリセット
        setFileName(null);
        return;
      }

      setFileName(file.name);
    }
  };
  

  // バックエンドにformをsubmit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      // フォーム要素全体から FormData を作成
      const formData = new FormData(e.currentTarget)

      if(!coingeckoId){
        return toast.error('Asset欄検索候補から選択して入力してください。',{
          duration: 9000,
          position: 'top-center',
        });
      }

      formData.set("date", selectedDate)
      formData.set("transaction_type", transactionTypeData)
      formData.set("asset", searchTerm)
      formData.set("price", price)
      formData.set("exchange_rate", exchangeRate)
      formData.set("coin_id", coingeckoId)


      const file = formData.get("file")
      console.log(file)

      
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Transaction submission failed')
      }

      
      toast.success('Successfully submitted!',{
        duration: 6000,
        position: 'top-center',
      });


      // TxHistory更新
      await onSuccess()
      fetchAssets();
      onClose()

      // フォームリセット
      setSearchTerm('')
      setSelectedDate('')
      setSelectedCoin(null)
      setExchangeRate('')
      setTransactionTypeData('')
      setPrice('')
      setFileName(null)
      setCoingeckoId("")
      setIsManualMode(false)
    } catch (error) {
      console.error('Error submitting transaction:', error)
      toast.error('送信に失敗しました。入力値を確認し時間を空けて再度試してください。',{
        duration: 9000,
        position: 'top-right',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Add New Transaction</DialogTitle>
            <Button 
              size="sm"
              className={`bg-gray-800 mx-4 ${ isManualMode ? "text-green-400 hover:text-green-300" : "text-blue-400 hover:text-blue-300" }`}
              onClick={changeInputMode}
            >
              <RefreshCw className="w-5 h-5" />
              { isManualMode ? "Manual mode" : "Auto mode" }
            </Button>
          </div>
          <DialogDescription>
            ✅ Autoモード: Price入力前に必ず Date と Asset を入力。「Asset」を入力すると候補が表示されるので選択してください。
          </DialogDescription>
          <DialogDescription>
            ✅ Manualモード: 購入(売却)したAssetの正確な Price を入力してください。
          </DialogDescription>
          <DialogDescription>
            ✅ 両モードともAsset欄に表示される検索候補を選択して入力してください。
          </DialogDescription>
          <DialogDescription>
            ⚠️ Symbol は BTC などの略称です。正式名称（例: Bitcoin）ではなく、必ずティッカーシンボルを入力してください。
          </DialogDescription>
        </DialogHeader>
        
        {/* フォーム要素に onSubmit を付与し、handleSubmitで multipart/form-data を送る */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-4 gap-4">

            {/* Date (name="date" は後で上書きするが一応付けておく) */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white">Date</Label>
              <Input 
                type="date" 
                id="date"
                name="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="bg-gray-700 text-white border-gray-600" 
                style={{ WebkitAppearance: 'none', colorScheme: 'dark' }}
                required
              />
            </div>

            {/* Exchange */}
            <div className="space-y-2">
              <Label htmlFor="exchange" className="text-white">Exchange</Label>
              <Input 
                type="text" 
                id="exchange" 
                name="exchange"
                className="bg-gray-700 text-white border-gray-600"
                placeholder="Enter cryptocurrency exchange ..." 
                required
              />
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="txType" className="text-white">Transaction Type</Label>
              <Select onValueChange={setTransactionTypeData} required>
                <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                  <SelectItem value="Reward">Reward</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Asset( Symbol ) */}
            <div className="space-y-2">
              <Label htmlFor="asset" className="text-white">Asset ( Enter a Symbol )</Label>
              <div className="relative crypto-search-container">
                <Input
                  type="text"
                  id="asset"
                  name="asset"
                  value={searchTerm}
                  onChange={handleInputChange}
                  placeholder="Search cryptocurrency ..."
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
                {isLoading && (
                  <div className="absolute right-2 top-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto z-50">
                    {suggestions.map((coin) => (
                      <div
                        key={coin.id}
                        onClick={() => handleSuggestionClick(coin)}
                        className="flex items-center p-2 hover:bg-gray-600 cursor-pointer"
                      >
                        <img src={coin.thumb} alt={coin.name} className="w-6 h-6 mr-2" />
                        <div>
                          <div className="font-medium text-white">{coin.symbol}</div>
                          <div className="text-sm text-gray-300">{coin.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Price (name="price" にしておき、stateで制御) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 h-6">
                <Label htmlFor="price" className="text-white">Price</Label>
                <p className={`flex items-center gap-1 px-2 py-1 h-8 bg-gray-800 ${isManualMode ? 'text-green-400' : 'text-blue-400'}`}>
                  <Edit2 className="w-4 h-4" />
                  {isManualMode ? "Manual" : "Auto"}
                </p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <Input 
                  type="number" 
                  id="price"
                  name="price"
                  value={price}
                  readOnly={!isManualMode}
                  className={`pl-6 bg-gray-700 text-white border-gray-600 ${
                    isManualMode ? '' : ' cursor-not-allowed'
                  }`}
                  placeholder="0.00"
                  required
                  onChange={(e) => setPrice(e.target.value)}
                />
                {isLoading && (
                  <div className="absolute right-2 top-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white">Amount</Label>
              <Input 
                type="number" 
                id="amount"
                name="amount"
                className="bg-gray-700 text-white border-gray-600"
                step="any"
                required
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
                  name="fee"
                  className="pl-6 bg-gray-700 text-white border-gray-600"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Blockchain */}
            <div className="space-y-2">
              <Label htmlFor="blockchain" className="text-white">BlockChain</Label>
              <Input 
                type="text" 
                id="blockchain"
                name="blockchain"
                className=" bg-gray-700 text-white border-gray-600"
                placeholder="Enter BlockChain..." 
                required
              />
            </div>

            {/* USD / JPY */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 h-6">
                <Label htmlFor="exchangeRate" className="text-white">
                  USD / JPY
                </Label>
                <p className={`flex items-center gap-1 px-2 py-1 h-8 bg-gray-800 ${isManualMode ? 'text-green-400' : 'text-blue-400'}`}>
                  <Edit2 className="w-4 h-4" />
                  {isManualMode ? "Manual" : "Auto"}
                </p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">¥</span>
                <Input 
                  type="number"
                  id="exchangeRate"
                  name="exchangeRate"
                  value={exchangeRate}
                  className={`pl-6 bg-gray-700 text-white border-gray-600 ${ isManualMode ? "" : "cursor-not-allowed"}`}
                  placeholder="Enter Exchange Rate"
                  onChange={(e) => setExchangeRate(e.target.value)}
                  readOnly={!isManualMode}
                />
                {isLoading && (
                  <div className="absolute right-2 top-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* file */}
            <div className="space-y-2 col-span-3">
              <label htmlFor="file" className="text-white block">
                File related to Tx (Optional)
              </label>
              <div className="relative">
                <label
                  htmlFor="file"
                  className={`bg-gray-700 text-white px-4 rounded-md cursor-pointer border border-gray-600 hover:bg-gray-600 flex items-center h-10 ${
                    fileName ? "bg-green-500 hover:bg-green-400 border-green-600" : ""
                  }`}
                >
                  {fileName ? `✅ ${fileName}` : "ファイルを選択"}
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" //添付できる拡張子を指定
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Transaction ID (tx_hash) */}
            <div className="space-y-2 col-span-4">
              <Label htmlFor="tx_hash" className="text-white">Transaction ID (Optional)</Label>
              <Input 
                id="tx_hash"
                name="tx_hash"
                className="bg-gray-700 text-white border-gray-600"
                placeholder="Enter Transaction ID" 
              />
            </div>

            {/* Transaction Notes (tx_notes) */}
            <div className="space-y-2 col-span-4">
              <Label htmlFor="tx_notes" className="text-white">Transaction Notes (Optional)</Label>
              <Textarea
                id="tx_notes"
                name="tx_notes"
                className="bg-gray-700 text-white border-gray-600 w-full min-h-[100px]"
                placeholder="Enter any additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
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
  )
}