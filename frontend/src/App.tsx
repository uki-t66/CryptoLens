import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Asset } from './pages/Asset';


const App = () => {
  return (
    <BrowserRouter>
      <div className="fixed flex w-full h-full">
        {/* Sidebarコンテナ */}
        <nav>
          <Sidebar />
        </nav>
        {/* mainコンテナ */}
        <main className="flex-grow p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/asset" element={<Asset />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;