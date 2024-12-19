export interface TransactionForm {
    date: string;
    exchange: string;
    transactionType: string;
    asset: string;
    price: string;
    amount: string;
    fee: string;
    blockchain: string;
    exchangeRate: string;
    transactionId?: string;
  }