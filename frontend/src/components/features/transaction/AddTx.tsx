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
import { Edit2, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useRef } from 'react';

const COINGECKO_API = import.meta.env.VITE_COINGECKO_API;
const ExchangeRate_API = import.meta.env.VITE_ExchangeRate_API;
const API_URL = import.meta.env.VITE_API_URL;

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

  // fetchしたデータの型定義
  interface Coin {
    id: string;
    symbol: string;
    name: string;
    thumb: string;
  }
  
  // submitするformのdataの型定義
  interface TransactionForm {
    date: string;
    exchange: string;
    transactionType: string;
    asset: string;
    price: string;
    amount: string;
    fee: string;
    blockchain: string;
    exchangeRate: string;
    tx_hash?: string;
    coin_id?: string
  }


  const [searchTerm, setSearchTerm] = useState('');         // 検索入力値
  const [suggestions, setSuggestions] = useState<Coin[]>([]); // 検索候補
  const [isLoading, setIsLoading] = useState(false);        // ローディング状態
  const [showSuggestions, setShowSuggestions] = useState(false); // 候補表示制御
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);   // デバウンス用のタイマー参照

  const [selectedDate, setSelectedDate] = useState<string>('');  // Inputで選択された日付
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null); // 選択されたSymbol

  const [exchangeRate, setExchangeRate] = useState("");  // USD/JPYのレート
  const [transactionTypeData, setTransactionTypeData] = useState<string>(''); //選択したTxType
  const [price, setPrice] = useState<string>('');        // COINGECKOから取得した価格
  const [coingeckoId, setCoingeckoId] = useState<string>(""); //COINGECKOのcoin.idを格納

  // 価格を手動入力できるかどうかを管理するstate
  const [isManualMode, setIsManualMode] = useState(false);

  
  // コイン検索 (Coingecko)
  const searchCrypto = async (query: string | number) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      // 検索時のローディング開始
      setIsLoading(true);

      const response = await fetch(
        `${COINGECKO_API}/search?query=${query}`
      );
      const data = await response.json();

      // data(res)のインデックス0~4の配列をcoinsに格納
      const coins: Coin[] = data.coins.slice(0, 5).map((coin: Coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        thumb: coin.thumb
      }));

      // 検索候補になるデータをsetSuggestionsで管理
      setSuggestions(coins);
    } catch (error) {
      console.error('データの取得に失敗:', error);
      alert('データの取得に失敗しました。しばらくしてから再試行してください。');
      setSuggestions([]);
    } finally {
      // 検索のローディング終了
      setIsLoading(false);
    }
  };

  
  // Coin 検索Input 変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);

    // すでにタイマーが設定されている場合はキャンセル
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // 300ミリ秒後に検索を実行 (デバウンス)
    debounceTimeout.current = setTimeout(() => {
      searchCrypto(value);
    }, 300);
  };

  
  // 検索候補クリック時
  const handleSuggestionClick = (coin: Coin) => {
    setSearchTerm(coin.symbol);
    setSelectedCoin(coin);
    setCoingeckoId(coin.id);
    setSuggestions([]);
    setShowSuggestions(false);

    // 日付が選択済みなら価格を取得
    if (selectedDate) {
      fetchHistoricalPrice(coingeckoId, selectedDate);
    }
  };

  
  // コンポーネントのクリーンアップ
  useEffect(() => {
    // コンポーネントのアンマウント時に実行
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  
  // 検索ボックス外のクリック検知
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.crypto-search-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // inputの自動、手動入力を切り替える関数
  const changeInputMode = () => {
    setIsManualMode(!isManualMode);
  }

  
  // COINGECKOから指定された日付の通貨価格を取得する関数
  const fetchHistoricalPrice = async (coinId: string, date: string) => {
    try {
  

      // ローディング開始
      setIsLoading(true);
      setIsManualMode(false); // API取得モードに戻す(Auto mode)

      // 日付のフォーマット(YYYY-MM-DD → DD-MM-YYYY)
      const [year, month, day] = date.split('-');
      const formattedDate = `${day}-${month}-${year}`;

      // Coingecko API へリクエスト
      const response = await fetch(
        `${COINGECKO_API}/coins/${coinId}/history?date=${formattedDate}`
      );
      const data = await response.json();

      // レスポンスから価格を取得して状態を更新
      if (data.market_data?.current_price?.usd) {
        const formattedPrice = Number(data.market_data.current_price.usd).toFixed(5);
        setPrice(formattedPrice);
      } else {
        alert('この日付の価格データは利用できません。手動で入力してください。');
        setPrice('');
        setExchangeRate("");
        setIsManualMode(true); // 手動で価格を入力できるようにする
      }
    } catch (error) {
      console.error('価格の取得に失敗:', error);
      alert('この日付の価格データは利用できません。1年以上前のデータは "Manual mode" で入力してください。');
      setPrice('');
      setIsManualMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  
  // 日付入力ハンドラ
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);

    // 為替レートを取得
    fetchExchangeRate(newDate);

    // アセットが選択済みの場合のみ価格を取得
    if (selectedCoin) {
      fetchHistoricalPrice(selectedCoin.id, newDate);
    }
  };


  // 為替レートを取得
  const fetchExchangeRate = async (date: string) => {

    if(isManualMode){
      return setExchangeRate("");
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${ExchangeRate_API}/${date}?from=USD&to=JPY`
      );
      const data = await response.json();

      if (data.rates?.JPY) {
        const formattedRate = Number(data.rates.JPY).toFixed(2);
        setExchangeRate(formattedRate);
      } else {
        alert('この日付の為替レートデータは利用できません。');
        setExchangeRate("");
      }
    } catch (error) {
      console.error('為替レートの取得に失敗:', error);
      alert('為替レートの取得に失敗しました。');
      setExchangeRate("");
    } finally {
      setIsLoading(false);
    }
  };

  
  // フォーム送信時のハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // フォームデータの作成
      const formData: TransactionForm = {
        date: selectedDate,
        exchange: (e.target as HTMLFormElement).exchange.value,
        transactionType: transactionTypeData,
        asset: searchTerm,
        price: price,
        amount: (e.target as HTMLFormElement).amount.value,
        fee: (e.target as HTMLFormElement).fee.value,
        blockchain: (e.target as HTMLFormElement).blockchain.value,
        exchangeRate: exchangeRate,
        tx_hash: (e.target as HTMLFormElement).tx_hash.value || undefined,
        coin_id: coingeckoId || undefined
      };

      // POSTリクエストの送信
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // JWT cookieを自動送信
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Transaction submission failed');
      }

      const result = await response.json();
      console.log('Transaction submitted:', result);
      alert('Transaction added successfully!');

      // TxHistoryのfetchTransactionsが実行される
      await onSuccess();
      onClose();

      setSearchTerm('');
      setSelectedDate('');
      setSelectedCoin(null);
      setExchangeRate('');
      setTransactionTypeData('');
      setPrice('');
      setIsManualMode(false);


    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Add New Transaction</DialogTitle>
            <Button 
              size="sm"
              className={`bg-gray-800 mx-4 ${ isManualMode ? "text-green-400 hover:text-green-300"  : "text-blue-400 hover:text-blue-300"} `}
              onClick={changeInputMode}
            >
              <RefreshCw className="w-5 h-5" />
              { isManualMode ? 
                <span>Manual mode</span> : <span>Auto mode</span>}
            </Button>
          </div>
          <DialogDescription>
            ※Please enter Date, Asset first before entering Price
          </DialogDescription>
          <DialogDescription>
            ※When you enter “Asset,” a list of suggested Assets will be output, and you can click on any of the suggested Assets to complete the entry.
          </DialogDescription>
          <DialogDescription>
            ※When entering Asset, if the currency does not appear in the Asset search suggestions, enter the symbol (ticker) for the crypto currency in capital letters for Asset. And enter the price in Manual mode.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white">Date</Label>
              <Input 
                type="date" 
                id="date"
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
              <div className="relative">
                <Input 
                  type="text" 
                  id="exchange" 
                  className="bg-gray-700 text-white border-gray-600"
                  placeholder="Enter cryptocurrency exchange ..." 
                  required
                />
              </div>
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

            {/* Asset( Symbol )*/}
            <div className="space-y-2">
              <Label htmlFor="asset" className="text-white">Asset ( Enter a Symbol )</Label>
              <div className="relative crypto-search-container">
                <Input
                  type="text"
                  id="asset"
                  value={searchTerm}
                  onChange={handleInputChange}
                  placeholder="Search cryptocurrency ..."
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
                
                {/* 通貨検索(fetch)中のスピナー */}
                {isLoading && (
                  <div className="absolute right-2 top-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* fetchしたデータを検索候補に表示 */}
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

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 h-6">
                <Label htmlFor="price" className="text-white">Price</Label>
                <p
                    className={`flex items-center gap-1 px-2 py-1 h-8 bg-gray-800 ${isManualMode ? 'text-green-400' : 'text-blue-400'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                    {
                      isManualMode ? 
                        <span>Manual</span> : <span>Auto</span>
                    }
                </p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <Input 
                  type="number" 
                  id="price"
                  value={price}
                  // ★ isPriceEditable が false の場合に readOnly
                  readOnly={!isManualMode}
                  className={`pl-6 bg-gray-700 text-white border-gray-600 ${
                    isManualMode ? '' : ' cursor-not-allowed'
                  }`}
                  placeholder="0.00"
                  // 手動入力できるようになったら必須にする(お好みで)
                  required
                  onChange={(e) => setPrice(e.target.value)} 
                />
                {/* 価格取得中のスピナー */}
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
                  className="pl-6 bg-gray-700 text-white border-gray-600" 
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Blockchain */}
            <div className="space-y-2">
              <Label htmlFor="blockchain" className="text-white">BlockChain</Label>
              <div className="relative">
                <Input 
                  type="text" 
                  id="blockchain" 
                  className=" bg-gray-700 text-white border-gray-600"
                  placeholder="Enter BlockChain..." 
                  required
                />
              </div>
            </div>

            {/* USD / JPY */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 h-6">
                <Label htmlFor="exchange-rate" className="text-white">
                  USD / JPY
                </Label>
                <p
                  className={`flex items-center gap-1 px-2 py-1 h-8 bg-gray-800 ${isManualMode ? 'text-green-400' : 'text-blue-400'}`}
                >
                  <Edit2 className="w-4 h-4" />
                  {
                    isManualMode ? 
                      <span>Manual</span> : <span>Auto</span>
                  }
                </p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">¥</span>
                <Input 
                  type="number"
                  id="exchange-rate"
                  value={exchangeRate || ''}
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

            {/* Transaction ID */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="tx_hash" className="text-white">Transaction ID (Optional)</Label>
              <Input 
                id="tx_hash" 
                className="bg-gray-700 text-white border-gray-600" 
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
  );
};