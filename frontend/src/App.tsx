import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Asset } from './pages/Asset';
import { Transaction } from './pages/Transaction';
import { useState } from 'react';


const App = () => {

  // Sidebarの開閉状態を管理
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Sidebarのbuttonクリック時に作動する関数
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  return (
    <BrowserRouter>
      <div className="fixed flex w-full h-full">
        {/* Sidebarコンテナ */}
        <nav className={`bg-gray-800  border border-gray-700 transition-all duration-350 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
          <Sidebar 
            isOpen={isSidebarOpen} // 現在のSidebar開閉状態
            onToggle={toggleSidebar} // 状態を更新する関数
          />
        </nav>
        {/* mainコンテナ */}
        <main className="flex-grow  pb-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/asset" element={<Asset />} />
            <Route path="/transaction" element={<Transaction />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;