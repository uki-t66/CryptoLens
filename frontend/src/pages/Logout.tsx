import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom";

interface LogoutProps {
  open: boolean
  onClose: () => void
}

const API_URL = import.meta.env.VITE_API_URL;


export const Logout = ({ open, onClose }: LogoutProps) => {
    const navigate = useNavigate();

    // 例: handleLogout
    const handleLogout = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to logout');
        }

        navigate('/login');
        await onClose();
      } catch (error) {
        console.error('Logout error:', error);
        // エラーハンドリング
      }
    };


  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-[480px]">
        <div className="p-4">
          <h1 className="text-xl text-center font-bold">ログアウトしてよろしいですか？</h1>
          <div className="m-4 flex justify-center gap-2">
            <Button
                onClick={onClose}
                variant="outline"
                className="bg-gray-200 text-gray-700 m-4 hover:bg-gray-300"
              >
                Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 text-white m-4 hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
