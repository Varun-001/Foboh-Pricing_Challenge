import { useState } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import PricingHome from './pages/PricingHome'
import PricingProfile from './pages/PricingProfile'
import PriceCheckerPage from './pages/PriceCheckerPage'
import ComingSoon from './pages/ComingSoon'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './auth/AuthContext'

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Single scroll container — all pages scroll here */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50">
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
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <Shell />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
