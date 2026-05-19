import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import type { Product, ProductFilters } from '../types'

interface Props {
  products: Product[]
  filters: ProductFilters
  onChange: (filters: ProductFilters) => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function FilterBar({ products, filters, onChange }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    onChange({ ...filters, search: debouncedSearch })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const subCategories = [...new Set(products.map((p) => p.subCategory))].sort()
  const segments     = [...new Set(products.map((p) => p.segment))].sort()
  const brands       = [...new Set(products.map((p) => p.brand))].sort()

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title or SKU..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-foboh-teal/30 focus:border-foboh-teal"
        />
      </div>

      {/* Sub-category */}
      <select
        value={filters.subCategory}
        onChange={(e) => onChange({ ...filters, subCategory: e.target.value })}
        className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-foboh-teal/30 focus:border-foboh-teal text-gray-600"
      >
        <option value="">All Categories</option>
        {subCategories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Segment */}
      <select
        value={filters.segment}
        onChange={(e) => onChange({ ...filters, segment: e.target.value })}
        className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-foboh-teal/30 focus:border-foboh-teal text-gray-600"
      >
        <option value="">All Segments</option>
        {segments.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Brand */}
      <select
        value={filters.brand}
        onChange={(e) => onChange({ ...filters, brand: e.target.value })}
        className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-foboh-teal/30 focus:border-foboh-teal text-gray-600"
      >
        <option value="">All Brands</option>
        {brands.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>

      {/* Clear */}
      {(filters.search || filters.subCategory || filters.segment || filters.brand) && (
        <button
          onClick={() => {
            setSearchInput('')
            onChange({ search: '', subCategory: '', segment: '', brand: '' })
          }}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Clear
        </button>
      )}
    </div>
  )
}
