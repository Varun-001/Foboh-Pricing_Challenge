import { useState, useEffect } from 'react'
import { Search, CheckCircle, AlertCircle } from 'lucide-react'
import { getCustomers, getProducts, resolvePrice } from '../api/client'
import type { Customer, Product, ResolvedPrice } from '../types'

export default function PriceChecker() {
  const [customers, setCustomers]   = useState<Customer[]>([])
  const [products, setProducts]     = useState<Product[]>([])
  const [customerId, setCustomerId] = useState('')
  const [productId, setProductId]   = useState('')
  const [result, setResult]         = useState<ResolvedPrice | null>(null)
  const [notFound, setNotFound]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()]).then(([c, p]) => {
      setCustomers(c)
      setProducts(p)
    })
  }, [])

  const handleCheck = async () => {
    if (!customerId || !productId) {
      setError('Select both a customer and a product')
      return
    }
    setError('')
    setResult(null)
    setNotFound(false)
    setLoading(true)
    try {
      const data = await resolvePrice(customerId, productId)
      setResult(data)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) setNotFound(true)
      else setError('Failed to resolve price — check the backend is running')
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = products.find((p) => p.id === productId)

  return (
    <div className="bg-white rounded-xl border border-foboh-teal/20 shadow-sm overflow-hidden ring-1 ring-foboh-teal/10">
      <div className="px-6 py-4 border-b border-foboh-teal/10 bg-foboh-teal-bg/40 flex items-center gap-2">
        <Search size={16} className="text-foboh-teal" />
        <h2 className="font-semibold text-gray-800">Price Checker</h2>
        <span className="ml-auto text-xs text-gray-400">Demos the precedence resolver</span>
      </div>

      <div className="px-6 py-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Customer</label>
            <select
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value); setResult(null); setNotFound(false) }}
              className="w-full py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-foboh-teal/30 focus:border-foboh-teal text-gray-700"
            >
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Product</label>
            <select
              value={productId}
              onChange={(e) => { setProductId(e.target.value); setResult(null); setNotFound(false) }}
              className="w-full py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-foboh-teal/30 focus:border-foboh-teal text-gray-700"
            >
              <option value="">Select product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <button
            onClick={handleCheck}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-foboh-teal rounded-lg hover:bg-foboh-teal-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Checking…' : 'Check Price'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}

        {/* Result */}
        {result && selectedProduct && (
          <div className="mt-5 p-4 bg-foboh-teal-bg border border-foboh-teal/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-foboh-teal flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl font-bold text-foboh-teal">
                    ${result.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${selectedProduct.basePrice.toFixed(2)} base
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  Profile: <span className="text-foboh-teal">{result.profileName}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{result.reason}</p>
              </div>
            </div>
          </div>
        )}

        {notFound && (
          <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-600">No matching profile</p>
              <p className="text-xs text-gray-400 mt-0.5">
                No pricing profile applies to this customer + product combination. Base price applies.
              </p>
              {selectedProduct && (
                <p className="text-sm font-semibold text-gray-700 mt-2">
                  Base price: ${selectedProduct.basePrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
