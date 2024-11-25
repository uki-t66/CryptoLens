export const Header = ({ headerTitle }:{ headerTitle: string }) => {
    return (
        <div className="mb-6 xl:mb-8">
             <h1 className="text-2xl xl:text-3xl font-bold text-white bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">{headerTitle }</h1>
        </div>
    )
}