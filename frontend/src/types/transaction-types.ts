export interface TransactionData {  
    transaction_id: number;
    user_id: number;
    date: string;
    exchange: string;
    transaction_type: string;
    asset: string;
    price: string;
    amount: string;
    fee: string;
    blockchain: string;
    exchange_rate: string;
    tx_hash: string | null;
}