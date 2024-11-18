import { AssetField } from "../components/features/assetManagement/AssetField"
import { AssetForm } from "../components/features/assetManagement/AssetForm"
import { Header } from "../components/layout/Header"


export const Asset = () => {
    return(
        <>
            <Header headerTitle="Asset-Management"/>
            <AssetField/>
            <AssetForm/>
        </>
    )
}