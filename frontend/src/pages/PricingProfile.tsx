import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import FilterBar from '../components/FilterBar'
import ProductTable from '../components/ProductTable'
import PriceAdjustmentForm, { type AdjustmentConfig } from '../components/PriceAdjustmentForm'
import PricePreviewTable from '../components/PricePreviewTable'
import Toast, { type ToastData } from '../components/Toast'
import { getProducts, getProfiles, createProfile, updateProfile } from '../api/client'
import type { Product, ProductFilters, PricingProfile } from '../types'

const DEFAULT_FILTERS: ProductFilters = { search: '', subCategory: '', segment: '', brand: '' }
const DEFAULT_CONFIG: AdjustmentConfig = { adjustmentType: 'fixed', direction: 'decrease', value: 0 }

type Step = 'basicInfo' | 'productPricing' | 'assignCustomers'

function adjustmentLabel(config: AdjustmentConfig) {
  const dir = config.direction === 'increase' ? 'Increase' : 'Decrease'
  const type = config.adjustmentType === 'fixed' ? 'Fixed' : 'Dynamic'
  const val = config.adjustmentType === 'fixed'
    ? `$${config.value.toFixed(2)}`
    : `${config.value}%`
  return `${type} ${dir} of ${val}`
}

// Completed step — collapsed summary card
function CompletedStep({
  title, subtitle, summary, onMakeChanges,
}: { title: string; subtitle?: string; summary: React.ReactNode; onMakeChanges: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 flex items-start justify-between border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-foboh-teal flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-foboh-teal" />
          Completed
        </span>
      </div>
      <div className="px-6 py-4 flex items-start justify-between gap-4">
        <div className="text-sm text-gray-600 space-y-0.5">{summary}</div>
        <button
          onClick={onMakeChanges}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-foboh-teal transition-colors flex-shrink-0"
        >
          <Pencil size={14} /> Make Changes
        </button>
      </div>
    </div>
  )
}

// Pending step — just header
function PendingStep({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden opacity-60">
      <div className="px-6 py-4 flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          Not Started
        </span>
      </div>
    </div>
  )
}

export default function PricingProfilePage() {
  const { id: editId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filters, setFilters]         = useState<ProductFilters>(DEFAULT_FILTERS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [config, setConfig]           = useState<AdjustmentConfig>(DEFAULT_CONFIG)
  const [profileName, setProfileName] = useState('')
  const [profileDesc, setProfileDesc] = useState('')
  const [saving, setSaving]           = useState(false)
  const [toasts, setToasts]           = useState<ToastData[]>([])

  // Wizard step state
  const [activeStep, setActiveStep]         = useState<Step>('basicInfo')
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set())

  const addToast = (type: 'success' | 'error', message: string) =>
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, message }])

  const dismissToast = useCallback((id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  useEffect(() => {
    getProducts().then(setAllProducts).catch(() => addToast('error', 'Failed to load products'))
  }, [])

  // In edit mode — load existing profile and pre-fill
  useEffect(() => {
    if (!editId) return
    getProfiles().then((profiles) => {
      const p = profiles.find((x: PricingProfile) => x.id === editId)
      if (!p) { navigate('/pricing'); return }
      setProfileName(p.name)
      setProfileDesc(p.description ?? '')
      setSelectedIds(new Set(p.productIds))
      setConfig({ adjustmentType: p.adjustmentType, direction: p.direction, value: p.adjustment })
      setCompletedSteps(new Set(['basicInfo', 'productPricing'] as Step[]))
      setActiveStep('assignCustomers')
    })
  }, [editId, navigate])

  const filteredProducts = allProducts.filter((p) => {
    const q = filters.search.toLowerCase()
    if (q && !p.title.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false
    if (filters.subCategory && p.subCategory !== filters.subCategory) return false
    if (filters.segment && p.segment !== filters.segment) return false
    if (filters.brand && p.brand !== filters.brand) return false
    return true
  })

  const selectedProducts = allProducts.filter((p) => selectedIds.has(p.id))

  const handleToggle = (id: string) =>
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleToggleAll = () => {
    const allSel = filteredProducts.every((p) => selectedIds.has(p.id))
    setSelectedIds((prev) => {
      const n = new Set(prev)
      filteredProducts.forEach((p) => allSel ? n.delete(p.id) : n.add(p.id))
      return n
    })
  }

  const completeStep = (step: Step, next: Step) => {
    setCompletedSteps((prev) => new Set([...prev, step]))
    setActiveStep(next)
  }

  const handleMakeChanges = (step: Step) => setActiveStep(step)

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      name: profileName.trim(),
      description: profileDesc.trim() || undefined,
      productIds: [...selectedIds],
      adjustment: config.value,
      adjustmentType: config.adjustmentType,
      direction: config.direction,
    }
    try {
      if (editId) {
        await updateProfile(editId, payload)
        addToast('success', `Profile "${profileName}" updated`)
      } else {
        await createProfile(payload)
        addToast('success', `Profile "${profileName}" saved`)
      }
      setTimeout(() => navigate('/pricing'), 1200)
    } catch {
      addToast('error', 'Failed to save profile — please try again')
    } finally {
      setSaving(false)
    }
  }

  const allDone = completedSteps.has('basicInfo') && completedSteps.has('productPricing')
  const stepDone = (s: Step) => completedSteps.has(s) && activeStep !== s

  // Step 1 summary
  const step1Summary = (
    <>
      <p className="text-xs text-gray-400">You've created a Price Profile</p>
      <p className="font-semibold text-gray-800">{profileName}</p>
      {profileDesc && <p className="text-gray-500 text-xs">{profileDesc}</p>}
    </>
  )

  // Step 2 summary
  const productNames = selectedProducts.slice(0, 2).map((p) => p.title).join(' & ')
  const productMore  = selectedProducts.length > 2 ? ` +${selectedProducts.length - 2} more` : ''
  const step2Summary = (
    <>
      <p className="text-xs text-gray-400">You've selected {selectedProducts.length} Products</p>
      <p className="font-semibold text-gray-800">{productNames}{productMore}</p>
      <p className="text-gray-500 text-xs">With Price Adjustment Mode set to <strong>{adjustmentLabel(config)}</strong></p>
    </>
  )

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto min-h-0">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-start justify-between flex-shrink-0">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-0.5">
            <button onClick={() => navigate('/pricing')} className="hover:text-foboh-teal transition-colors">
              Pricing Profile
            </button>
            <span>›</span>
            <span className="text-gray-800 font-semibold">{editId ? 'Edit Profile' : 'Setup a Profile'}</span>
          </nav>
          <p className="text-xs text-gray-400">Setup your pricing profile, select products and assign customers</p>
        </div>
        <div className="flex gap-2 ml-4">
          <button onClick={() => navigate('/pricing')} className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!allDone || saving}
            className="px-5 py-1.5 text-sm font-medium text-white bg-foboh-teal rounded-full hover:bg-foboh-teal-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save as Draft'}
          </button>
        </div>
      </div>

      {/* Wizard content */}
      <div className="flex-1 px-4 md:px-6 py-6 space-y-3">

        {/* ── Step 1: Basic Info ── */}
        {stepDone('basicInfo') ? (
          <CompletedStep
            title="Basic Pricing Profile"
            // subtitle="Cheeky little description goes in here"
            summary={step1Summary}
            onMakeChanges={() => handleMakeChanges('basicInfo')}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">Basic Pricing Profile</h2>
                {/* <p className="text-xs text-gray-400 mt-0.5">Cheeky little description goes in here</p> */}
              </div>
              {completedSteps.has('basicInfo') && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-foboh-teal">
                  <span className="w-2 h-2 rounded-full bg-foboh-teal" /> Completed
                </span>
              )}
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
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    if (!profileName.trim()) { addToast('error', 'Profile name is required'); return }
                    completeStep('basicInfo', 'productPricing')
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-foboh-teal rounded-full hover:bg-foboh-teal-dark transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Product Pricing ── */}
        {stepDone('productPricing') ? (
          <CompletedStep
            title="Set Product Pricing"
            // subtitle="Cheeky little description goes in here"
            summary={step2Summary}
            onMakeChanges={() => handleMakeChanges('productPricing')}
          />
        ) : completedSteps.has('basicInfo') || activeStep === 'productPricing' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Set Product Pricing</h2>
              <p className="text-xs text-gray-400 mt-0.5">Set details</p>
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
                <p className="text-xs text-gray-400">{selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''} selected</p>
              )}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Price Adjustment</h3>
                <PriceAdjustmentForm selectedProducts={selectedProducts} config={config} onChange={setConfig} />
              </div>
              {selectedIds.size > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Price Preview</h3>
                  <PricePreviewTable selectedProducts={selectedProducts} config={config} />
                </div>
              )}
              <div className="flex justify-end pt-4 border-t border-gray-100 mt-2">
                <button
                  onClick={() => setActiveStep('basicInfo')}
                  className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (selectedIds.size === 0) { addToast('error', 'Select at least one product'); return }
                    completeStep('productPricing', 'assignCustomers')
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-foboh-teal rounded-full hover:bg-foboh-teal-dark transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <PendingStep title="Set Product Pricing"
          //  subtitle="Cheeky little description goes in here" 
           />
        )}

        {/* ── Step 3: Assign Customers ── */}
        {(completedSteps.has('basicInfo') && completedSteps.has('productPricing')) || activeStep === 'assignCustomers' ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">Assign Customers to Pricing Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">Choose which customers this profile will be applied to</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-gray-300" /> Not Started
              </span>
            </div>
            <div className="px-6 py-4 text-sm text-gray-400 italic">
              Customer assignment coming soon — save the profile first, then assign customers or groups.
            </div>
            <div className="px-6 pb-5 flex justify-between">
              <button
                onClick={() => setActiveStep('productPricing')}
                className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-foboh-teal rounded-full hover:bg-foboh-teal-dark disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save & Publish Profile'}
              </button>
            </div>
          </div>
        ) : (
          <PendingStep title="Assign Customers to Pricing Profile" subtitle="Choose which customers this profile will be applied to" />
        )}
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
