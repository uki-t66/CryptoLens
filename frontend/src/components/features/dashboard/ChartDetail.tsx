import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"

interface ChartDetailProps {
    open: boolean
    onClose: () => void
}

export const ChartDetail = ({ open, onClose }: ChartDetailProps) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border border-gray-700 text-white max-w-[680px] rounded-lg shadow-lg">
                <div className="p-6">
                    <h1 className="text-2xl text-center font-bold mb-4 text-gray-100">総資産グラフに表示される情報</h1>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start">
                            <span className="text-blue-400 font-semibold mr-2">※</span>投資中のすべての銘柄（保有中銘柄）の評価額が反映されます。
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-400 font-semibold mr-2">※</span>売却時に総資産は減少します（銘柄を保有しなくなるため）。
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-400 font-semibold mr-2">※</span>売却時の損益は年間確定損益に反映されます。
                        </li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    )
}
