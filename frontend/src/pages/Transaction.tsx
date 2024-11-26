import { TxHistory } from "@/components/features/transaction/TxHistory"
import { Header } from "@/components/layout/Header"

export const Transaction = () => {
    return (
        <>
            <Header headerTitle="Transaction"/>
            <TxHistory/>
        </>
    )
}