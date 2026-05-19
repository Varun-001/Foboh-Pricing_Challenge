import type { Product } from '../types'

interface Props {
  products: Product[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
}

export default function ProductTable({ products, selectedIds, onToggle, onToggleAll }: Props) {
  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id))
  const someSelected = products.some((p) => selectedIds.has(p.id)) && !allSelected

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm font-medium">No products match your filters</p>
        <p className="text-xs mt-1">Try adjusting your search or clearing the filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected }}
                onChange={onToggleAll}
                className="rounded border-gray-300 text-foboh-teal focus:ring-foboh-teal/30 cursor-pointer"
              />
            </th>
            <th className="w-12 px-2 py-3" />
            <th className="px-4 py-3 text-left font-semibold text-gray-600 tracking-wide uppercase text-xs">
              Product / SKU
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 tracking-wide uppercase text-xs">
              Brand
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 tracking-wide uppercase text-xs">
              Sub-Category
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600 tracking-wide uppercase text-xs">
              Base Price
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => {
            const selected = selectedIds.has(product.id)
            return (
              <tr
                key={product.id}
                onClick={() => onToggle(product.id)}
                className={`cursor-pointer transition-colors ${
                  selected ? 'bg-foboh-teal-bg' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(product.id)}
                    className="rounded border-gray-300 text-foboh-teal focus:ring-foboh-teal/30 cursor-pointer"
                  />
                </td>
                {/* Image placeholder */}
                <td className="px-2 py-3">
                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-xs font-bold">
                    {product.segment[0]}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{product.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{product.sku}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{product.brand}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {product.subCategory}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-800">
                  ${product.basePrice.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
