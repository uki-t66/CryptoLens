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
import { useState, useEffect, useRef } from 'react';

const COINGECKO_API = import.meta.env.VITE_COINGECKO_API;


// AddTxコンポーネント
export const AddTx = ({ open, onClose }: { open: boolean; onClose: () => void }) => {

  const [searchTerm, setSearchTerm] = useState(''); // 検索入力値
  const [suggestions, setSuggestions] = useState<Coin[]>([]); // 検索候補
  const [isLoading, setIsLoading] = useState(false); // ローディング状態
  const [showSuggestions, setShowSuggestions] = useState(false); // 候補表示制御
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null); // デバウンス用のタイマー参照
  const [selectedDate, setSelectedDate] = useState<string>(''); // Inputで選択された日付
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null); //Inputで選択されたSymbol
  const [price, setPrice] = useState<string>(''); // COINGECKOから取得した価格

  // fetchしたデータの型定義
  interface Coin {
    id: string;
    symbol: string;
    name: string;
    thumb: string;
  }
  

  // TransactionフォームのAsset(Symbol)の入力値をcoingecko_apiを使用して検索し、通貨名を統一させる
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

  // formのAsset(Symbol)インプット欄入力時に実行される関数
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 入力された値を取得
    const value = e.target.value;

    // 入力フィールドの表示を更新
    setSearchTerm(value);
    // 検索候補の表示を有効化
    setShowSuggestions(true);

    // すでにタイマーが設定されている場合はキャンセル(メモリリークを防止するため)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // 新しいタイマーを設定（300ミリ秒後に検索実行）(デバウンスを導入)
    debounceTimeout.current = setTimeout(() => {
      searchCrypto(value);
    }, 300);
  };

  // 検索候補クリック時のハンドラー
  const handleSuggestionClick = (coin: Coin) => {
      // 入力フィールドに選択された通貨のシンボルをセット
      setSearchTerm(coin.symbol);
      // 選択されたコインを保存
      setSelectedCoin(coin);
      // 検索候補リストをクリア
      setSuggestions([]);
      // 検索候補の表示を無効化
      setShowSuggestions(false);

      // 日付が選択済みの場合、価格を取得
      if (selectedDate) {
        fetchHistoricalPrice(coin.id, selectedDate);
      };
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
      // クリックイベントのハンドラー関数
      const handleClickOutside = (e: MouseEvent) => {
          // クリックされた要素が検索ボックスの外かどうかをチェック
          if (!(e.target as Element).closest('.crypto-search-container')) {
              // 外側をクリックした場合は候補表示を閉じる
              setShowSuggestions(false);
          }
      };

      // イベントリスナーの登録
      document.addEventListener('mousedown', handleClickOutside);
      // コンポーネントのクリーンアップ時にイベントリスナーを削除
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);


  // COINGECKOから指定された日付の通貨価格を取得する関数
const fetchHistoricalPrice = async (coinId: string, date: string) => {
  try {
    // ローディング開始
    setIsLoading(true);

    // 日付のフォーマットを変換 (YYYY-MM-DD → DD-MM-YYYY)
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    // COINGECKO APIにリクエスト
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/history?date=${formattedDate}`
    );
    const data = await response.json();

    // レスポンスから価格を取得して状態を更新
    if (data.market_data?.current_price?.usd) {
      // 小数点第二位までを価格表示する
      const formattedPrice = Number(data.market_data.current_price.usd).toFixed(2);
      setPrice(formattedPrice);
    } else {
      alert('この日付の価格データは利用できません。');
      setPrice('');
    }
  } catch (error) {
    console.error('価格の取得に失敗:', error);
    alert('価格の取得に失敗しました。しばらくしてから再試行してください。');
    setPrice('');
  } finally {
    setIsLoading(false);
  }
};

// 日付入力時のハンドラー
const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newDate = e.target.value;
  setSelectedDate(newDate);

   // アセットが選択済みの場合、価格を取得
   if (selectedCoin) {  // suggestionsではなくselectedCoinを使用
    fetchHistoricalPrice(selectedCoin.id, newDate);
    }
};

  // フォーム送信時のハンドラー
  const handleSubmit = (e: React.FormEvent) => {
    // フォームのデフォルトの送信動作を防止
    e.preventDefault();
    // モーダルを閉じる
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
              />
            </div>


            {/* Exchange */}
            <div className="space-y-2">
              <Label htmlFor="exchange" className="text-white">Exchange</Label>
              <div className="relative">
                <Input 
                  type="text" 
                  id="exchange" 
                  className=" bg-gray-700 text-white border-gray-600"
                  placeholder="Enter cryptocurrency exchange ..." 
                />
              </div>
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
                />
                
                {/* 通貨検索(fetch)完了まで表示されるロード画面 */}
                {isLoading && (
                  <div className="absolute right-2 top-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* fetchしたデータを検索候補に表示する */}
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
              <Label htmlFor="price" className="text-white">Price ( Enter Date and Asset )</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <Input 
                  type="number" 
                  id="price"
                  value={price}
                  readOnly  // 読み取り専用
                  
                  className="pl-6 bg-gray-700 text-white border-gray-600 cursor-not-allowed"
                  placeholder="0.00"
                />
                {/* 価格取得中のローディング表示 */}
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