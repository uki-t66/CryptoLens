import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Asset } from './pages/Asset';
import { Transaction } from './pages/Transaction';
import { useState } from 'react';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { AuthGuard } from './components/features/auth/AuthGuard';
import { Toaster } from './components/ui/toaster';

const App = () => {
  // sidebarの開閉の挙動を制御
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  return (
    <>
      <Routes>
          {/* 認証不要のルート */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        
        {/* 認証が必要なルート */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <div className="fixed flex w-full h-full">
                <nav className={`bg-gray-800 border border-gray-700 transition-all duration-350 ${isSidebarOpen ? 'w-56' : 'w-16'}`}>
                  <Sidebar 
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                  />
                </nav>
                <main className="flex-grow pb-10">
                  <Dashboard />
                </main>
              </div>
            </AuthGuard>
          }
        />
        <Route
          path="/asset"
          element={
            <AuthGuard>
              <div className="fixed flex w-full h-full">
                <nav className={`bg-gray-800 border border-gray-700 transition-all duration-350 ${isSidebarOpen ? 'w-56' : 'w-16'}`}>
                  <Sidebar 
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                  />
                </nav>
                <main className="flex-grow pb-10">
                  <Asset />
                </main>
              </div>
            </AuthGuard>
          }
        />
        <Route
          path="/transaction"
          element={
            <AuthGuard>
              <div className="fixed flex w-full h-full">
                <nav className={`bg-gray-800 border border-gray-700 shrink-0 transition-[width] duration-350 ${isSidebarOpen ? 'w-56' : 'w-16'}`}>
                  <Sidebar 
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                  />
                </nav>
                <main className="flex-grow pb-10">
                  <Transaction />
                </main>
              </div>
            </AuthGuard>
          }
        />
        <Route
          path="/setting"
          element={
            <AuthGuard>
              <div className="fixed flex w-full h-full">
                <nav className={`bg-gray-800 border border-gray-700 shrink-0 transition-[width] duration-350 ${isSidebarOpen ? 'w-56' : 'w-16'}`}>
                  <Sidebar 
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                  />
                </nav>
                <main className="flex-grow pb-10">
                  <Transaction />
                </main>
              </div>
            </AuthGuard>
          }
        />
        {/* デフォルトでログインページにリダイレクト */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />  {/*クリップボードコピー*/}
    </>
  );
};

export default App;