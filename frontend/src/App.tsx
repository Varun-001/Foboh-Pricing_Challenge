import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import PricingHome from './pages/PricingHome'
import PricingProfile from './pages/PricingProfile'
import PriceCheckerPage from './pages/PriceCheckerPage'
import ComingSoon from './pages/ComingSoon'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Wrapper gives Routes children a proper flex-col context */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/pricing" replace />} />
              <Route path="/pricing" element={<PricingHome />} />
              <Route path="/pricing/new" element={<PricingProfile />} />
              <Route path="/pricing/:id/edit" element={<PricingProfile />} />
              <Route path="/pricing/checker" element={<PriceCheckerPage />} />
              <Route path="/dashboard" element={<ComingSoon />} />
              <Route path="/orders" element={<ComingSoon />} />
              <Route path="/customers" element={<ComingSoon />} />
              <Route path="/products" element={<ComingSoon />} />
              <Route path="/freight" element={<ComingSoon />} />
              <Route path="/integrations" element={<ComingSoon />} />
              <Route path="/settings" element={<ComingSoon />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
