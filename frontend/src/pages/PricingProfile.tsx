import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import FilterBar from '../components/FilterBar'
import ProductTable from '../components/ProductTable'
import PriceAdjustmentForm, { type AdjustmentConfig } from '../components/PriceAdjustmentForm'
import PricePreviewTable from '../components/PricePreviewTable'
import ProfileList from '../components/ProfileList'
import PriceChecker from '../components/PriceChecker'
import Toast, { type ToastData } from '../components/Toast'
import { getProducts, createProfile, updateProfile } from '../api/client'
import type { Product, ProductFilters, PricingProfile } from '../types'

const DEFAULT_FILTERS: ProductFilters = { search: '', subCategory: '', segment: '', brand: '' }
const DEFAULT_CONFIG: AdjustmentConfig = { adjustmentType: 'fixed', direction: 'decrease', value: 0 }

function SectionHeader({
  step, title, status,
}: { step: number; title: string; status: 'completed' | 'active' | 'pending' }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
          status === 'completed' ? 'bg-foboh-teal text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {status === 'completed' ? <CheckCircle2 size={16} /> : step}
        </span>
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      {status === 'completed' && (
        <span className="text-xs font-semibold text-foboh-teal bg-foboh-teal-bg px-2.5 py-1 rounded-full">
          Completed
        </span>
      )}
      {status === 'pending' && (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          <Clock size={11} /> Not Started
        </span>
      )}
    </div>
  )
}

export default function PricingProfilePage() {
  const [allProducts, setAllProducts]     = useState<Product[]>([])
  const [filters, setFilters]             = useState<ProductFilters>(DEFAULT_FILTERS)
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set())
  const [config, setConfig]               = useState<AdjustmentConfig>(DEFAULT_CONFIG)
  const [profileName, setProfileName]     = useState('')
  const [profileDesc, setProfileDesc]     = useState('')
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [saving, setSaving]               = useState(false)
  const [listRefresh, setListRefresh]     = useState(0)
  const [toasts, setToasts]               = useState<ToastData[]>([])

  useEffect(() => {
    getProducts().then(setAllProducts).catch(() => addToast('error', 'Failed to load products'))
  }, [])

  const filteredProducts = allProducts.filter((p) => {
    const q = filters.search.toLowerCase()
    if (q && !p.title.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false
    if (filters.subCategory && p.subCategory !== filters.subCategory) return false
    if (filters.segment && p.segment !== filters.segment) return false
    if (filters.brand && p.brand !== filters.brand) return false
    return true
  })

  const selectedProducts = allProducts.filter((p) => selectedIds.has(p.id))

  const addToast = (type: 'success' | 'error', message: string) => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, message }])
  }

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const resetForm = () => {
    setProfileName('')
    setProfileDesc('')
    setSelectedIds(new Set())
    setConfig(DEFAULT_CONFIG)
    setEditingId(null)
  }

  const handleEdit = (profile: PricingProfile) => {
    setProfileName(profile.name)
    setProfileDesc(profile.description ?? '')
    setSelectedIds(new Set(profile.productIds))
    setConfig({
      adjustmentType: profile.adjustmentType,
      direction: profile.direction,
      value: profile.adjustment,
    })
    setEditingId(profile.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleToggleAll = () => {
    const allFilteredSelected = filteredProducts.every((p) => selectedIds.has(p.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      filteredProducts.forEach((p) =>
        allFilteredSelected ? next.delete(p.id) : next.add(p.id)
      )
      return next
    })
  }

  const handleSave = async () => {
    if (!profileName.trim()) { addToast('error', 'Profile name is required'); return }
    if (selectedIds.size === 0) { addToast('error', 'Select at least one product'); return }

    const payload = {
      name: profileName.trim(),
      description: profileDesc.trim() || undefined,
      productIds: [...selectedIds],
      adjustment: config.value,
      adjustmentType: config.adjustmentType,
      direction: config.direction,
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateProfile(editingId, payload)
        addToast('success', `Profile "${profileName}" updated`)
      } else {
        await createProfile(payload)
        addToast('success', `Profile "${profileName}" saved`)
      }
      resetForm()
      setListRefresh((n) => n + 1)
    } catch {
      addToast('error', 'Failed to save profile — please try again')
    } finally {
      setSaving(false)
    }
  }

  const step1Done = profileName.trim().length > 0

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <span>Pricing</span>
            <span>›</span>
            <span className="text-gray-600 font-medium">
              {editingId ? 'Edit Profile' : 'Setup a Profile'}
            </span>
          </nav>
          <h1 className="text-lg font-semibold text-gray-800">
            {editingId ? 'Edit Profile' : 'Setup a Profile'}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {editingId ? 'Cancel Edit' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-foboh-teal rounded-lg hover:bg-foboh-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : editingId ? 'Update Profile' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 pb-16 space-y-4 max-w-5xl w-full mx-auto">

        {/* Step 1 — Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <SectionHeader step={1} title="Basic Pricing Profile" status={step1Done ? 'completed' : 'active'} />
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Profile Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Independent Retailers — 10% Wine Discount"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-foboh-teal/30 focus:border-foboh-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={profileDesc}
                onChange={(e) => setProfileDesc(e.target.value)}
                placeholder="Describe when this profile applies..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-foboh-teal/30 focus:border-foboh-teal resize-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2 — Product Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <SectionHeader step={2} title="Select Product Pricing" status="active" />
          </div>
          <div className="px-6 py-5 space-y-5">
            <FilterBar products={allProducts} filters={filters} onChange={setFilters} />
            <ProductTable
              products={filteredProducts}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
            />
            {selectedIds.size > 0 && (
              <p className="text-xs text-gray-400">
                {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''} selected
              </p>
            )}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Price Adjustment</h3>
              <PriceAdjustmentForm
                selectedProducts={selectedProducts}
                config={config}
                onChange={setConfig}
              />
            </div>
            {selectedIds.size > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Price Preview</h3>
                <PricePreviewTable selectedProducts={selectedProducts} config={config} />
              </div>
            )}
          </div>
        </div>

        {/* Step 3 — Assign Customers (placeholder) */}
        <div className="bg-white rounded-xl border border-dashed border-gray-200 overflow-hidden opacity-70">
          <div className="px-6 py-4 border-b border-gray-100">
            <SectionHeader step={3} title="Assign Customers to Pricing Profile" status="pending" />
          </div>
          <div className="px-6 py-4 text-sm text-gray-400 italic">
            Save the profile first, then assign customers or groups.
          </div>
        </div>

        {/* Price Checker */}
        <PriceChecker />

        {/* Saved Profiles */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Saved Profiles</h2>
          </div>
          <div className="px-6 py-5">
            <ProfileList
              refreshTrigger={listRefresh}
              onEdit={handleEdit}
              onToast={addToast}
            />
          </div>
        </div>

      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
