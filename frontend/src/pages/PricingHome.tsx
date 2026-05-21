import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import ProfileList from '../components/ProfileList'
import PriceChecker from '../components/PriceChecker'
import Toast, { type ToastData } from '../components/Toast'
import { useState, useCallback } from 'react'

export default function PricingHome() {
  const navigate = useNavigate()
  const [refresh, setRefresh]   = useState(0)
  const [toasts, setToasts]     = useState<ToastData[]>([])

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, message }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <div className="flex flex-col min-h-full">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold text-gray-800">Pricing Profiles</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage all your pricing profiles</p>
        </div>
        <button
          onClick={() => navigate('/pricing/new')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-foboh-teal rounded-full hover:bg-foboh-teal-dark transition-colors"
        >
          <Plus size={15} />
          New Profile
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6 px-4 md:px-6 py-6 min-h-0">
        {/* Price Checker */}
        <PriceChecker />

        {/* Profiles — grows to fill remaining height */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-0">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-gray-800">Saved Profiles</h2>
          </div>
          <div className="flex-1 px-6 py-5 overflow-y-auto min-h-0">
            <ProfileList
              refreshTrigger={refresh}
              onEdit={(profile) => navigate(`/pricing/${profile.id}/edit`)}
              onToast={addToast}
              onDeleted={() => setRefresh((n) => n + 1)}
            />
          </div>
        </div>
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
