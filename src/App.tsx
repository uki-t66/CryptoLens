import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';


const App = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        {/* Sidebarコンテナ */}
        <nav className=''>
          <Sidebar />
        </nav>
        {/* mainコンテナ */}
        <main className="flex-1 w-full ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;