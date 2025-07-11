# CryptoLens
URL: ~~`https://www.cryptolens.jp`~~ (現在非公開)  

仮想通貨の取引を記録するWebアプリケーションです。  


![Image](https://github.com/user-attachments/assets/a5167762-ba81-4e4f-bd3d-af1353f1ea26)  


### ゲストログイン情報
メールアドレス  
```
guestUser@gmail.com
```
パスワード  
```  
GuestUserPassword$&8
```
## プロジェクト概要  
### 特徴　　
確定申告や損益計算、税務調査時に必要となる取引所やDEXでの仮想通貨取引を帳簿することをメイン機能とするフルスタックWebアプリケーションです。レスポンシブデザインには対応していません。CoinGeckoのパブリックAPIとの連携により、指定した日時の仮想通貨の時価を取得できます。その時価を元にトップ画面ではユーザーのドル、円両方の表記で総資産額をはじめ、その推移の様子や含み損益、自身のポートフォリオ割合を確認することができます。また、売却時の取引を帳簿することで、その仮想通貨の確定損益を算出することができます。  
### 開発の背景  
仮想通貨の取引をすると必ず損益算出をするために取引を記録しなければなりません。そしてDEXなどの取引も日頃から行なっていると、基本的にはブロックチェーンエクスプローラー(以下「ブロックチェーン」と称する。)上から取引履歴を確認しなければならず、それを帳簿することはかなり大変になります。というのもブロックチェーン上では必ずしもBuy,Sellの取引履歴のみあるのではなく、自身の資産を動かした履歴やプロジェクトから仮想通貨をもらった履歴など、様々なブロックチェーン上の活動履歴があります。これら履歴から損益を手動で計算するとどうしても数字が合わないことがあったため、誰でもしっかり通貨を買ったことや売ったこと、移動させたこと、報酬としていただいたことをこまめに帳簿さえすれば、損益は自動で算出してくれるWebアプリケーションがあればと思ったことをきっかけに「CryptoLens」というWebアプリケーションを作成しようと思いました。  
### 主要機能  
* ユーザー登録(バリデーションチェックあり)
* ログイン機能(JWT認証(cookie管理))
* ログアウト機能(JWTをcookieから削除)
* 取引履歴を帳簿する機能(DBに保存)
* 帳簿した取引履歴を削除する機能
* ページネーション機能
* 通貨ごとの現在価格や平均取得単価、損益額、損益率確認機能
* 総資産額や総資産推移の確認機能
* 日本時間23時にグラフに表示する総資産額を自動更新する機能
* 総資産の24時間含み損益確認機能
* 年間の確定損益確認機能
* 保有通貨のポートフォリオ割合、評価額の確認機能
* ダッシュボード画面のドル、円両方の表記に対応
* CoinGeckoのパブリックAPI使用
* CRUD機能

### デモ動画  
[![Image](https://github.com/user-attachments/assets/52d83c8f-0e45-4399-8315-fa8bb6ff3118)](https://github.com/user-attachments/assets/a0adb086-af5c-4b81-95c3-e6bce64beafb)  
### メイン機能操作方法  
取引履歴の記録からデータが動的に画面に表示されるまでの一連の流れを紹介します。  

①　サイドバーのTransactionページへ移動。Transactionページ内の ＋ マークをクリック。  

![Image](https://github.com/uki-t66/CryptoLens/blob/main/images/Image1.png?raw=true)

②　formが開いたら、注意事項に沿ってformを埋めていきます。optional項目のform欄は入力必須ではありません。なるべく正確な取引を記録するためManualモードでの記録をおすすめしています。両モードとも必ずAssetフォーム欄に通貨名を入力したら、検索候補に表示される入力予定の通貨を選択してformを埋めてください。  

![Image](https://github.com/uki-t66/CryptoLens/blob/main/images/Image2.png?raw=true)

③　formを入力してsubmitすると「SUI」という通貨の取引履歴が記録されます。記録したレコードをクリックすると詳細ページが開き、取引記録を削除することもできます。また、レコードに表示されているTxHashはクリップボードへコピーでき、即座にブロックチェーンエクスプローラーでTxHashを利用することもできます。

![Image](https://github.com/uki-t66/CryptoLens/blob/main/images/Image3.png?raw=true)

④　③の説明で添付した画像には、「SUI」は ＄4918.54 の価格で記録されていて、その価格でユーザーは通貨を購入したことになります。そして④の画像には「SUI」は ＄4720 の現在価格で表示されています。 Profit / Loss には ＄-198.54 と表示され、この価格が現在の含み損額になります。Transactionページの記録したデータは変化しませんが、Assetページの現在価格や含み損益率・額は動的に変化する仕様になっています。  
 
![Image](https://github.com/uki-t66/CryptoLens/blob/main/images/Image4.png?raw=true)  

⑤　取引を記録したことにより、Dashboardの総資産や24H含み損益、資産配分の円グラフも動的に変化します。総資産推移のグラフは日本時間23時にcron.scheduleによって自動で更新されます。　　

### 記録前  
![Image](https://github.com/uki-t66/CryptoLens/blob/main/images/Image5.png?raw=true)  
### 記録後  
年間確定損益は購入した通貨を売却して初めて、画面上に確定損益として記録されます。購入しただけでは記録されません。
![Image](https://github.com/uki-t66/CryptoLens/blob/main/images/Image6.png?raw=true)  

## 技術.システム構成  
### フロントエンド  
* HTML
* CSS
* Tailwind CSS 3.4.14
* TypeScript 5.6.2
*  React 18.3.1
*  Vite 5.4.10
*  MUI 6.1.6
*  Recharts 2.13.3
*  shadcn/ui
*  Vercel
### バックエンド
* TypeScript 5.7.2
* Node.js 20.16.0
* Express 4.21.2
### インフラ
* AWS
  * VPC
  * EC2
    * Ubuntu
    * Nginx
    * MySQL
### その他
* Git
* GitHub
* GitHub Actions CI/CD

## テーブル構成  
![Image](https://github.com/user-attachments/assets/5dd6412b-e772-4298-9a41-c259785c139a)  

## 開発フロー  
基本的にはGitflowを参考に開発しました。本番環境をmainブランチとして、開発用ブランチのdevelopブランチを切って開発していました。一通り開発を終えた後の流れを下記に記します。  

① commit  
② push  
③ PR  
④ developブランチへマージ  
⑤ ローカルdevelopブランチ更新( git pull )  
⑥ developブランチを切る  
⑦ 開発  

このようなサイクルで開発し、本番環境にデプロイする際にdevelopブランチをmainブランチへマージする形になります。  
現在は、フロントエンドをVercelへデプロイし、バックエンドをAWS EC2にデプロイしています。Vercel、EC2両方ともGitHub Actionsなどを使用してCI/CD環境を構築しているため、mainブランチへマージ、もしくはpushすることで自動デプロイされることになっています。  

## 今後の追加予定機能  
* 新規登録時の有効なメールアドレスかの確認機能
* CSV出力
* NFT損益計算機能
* ウォレット接続時にウォレットの履歴から取引を記録できる機能
* パスワード、メールアドレス変更機能
