import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './components/features/auth/AuthProvider.tsx'
import { AssetSummaryProvider } from './context/AssetSummaryContext.tsx'
import { Toaster as HotToaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
        <AssetSummaryProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
          </AssetSummaryProvider>
        <HotToaster />
      </BrowserRouter>
  </StrictMode>,
)
