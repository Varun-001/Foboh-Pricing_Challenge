import type { Product } from '../types'
import type { AdjustmentConfig } from './PriceAdjustmentForm'

interface Props {
  selectedProducts: Product[]
  config: AdjustmentConfig
}

function calcNewPrice(basePrice: number, config: AdjustmentConfig): { price: number; floored: boolean } {
  const delta =
    config.adjustmentType === 'fixed'
      ? config.value
      : (config.value / 100) * basePrice
  const raw = config.direction === 'increase' ? basePrice + delta : basePrice - delta
  const price = Math.max(0.01, Math.round(raw * 100) / 100)
  return { price, floored: raw < 0.01 }
}

function formatAdjustment(config: AdjustmentConfig): string {
  const sign = config.direction === 'increase' ? '+' : '−'
  return config.adjustmentType === 'fixed'
    ? `${sign}$${config.value.toFixed(2)}`
    : `${sign}${config.value}%`
}

export default function PricePreviewTable({ selectedProducts, config }: Props) {
  if (selectedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
        <p className="text-sm font-medium">No products selected</p>
        <p className="text-xs mt-1">Select products above to preview new prices</p>
      </div>
    )
  }

  const adjustmentLabel = formatAdjustment(config)

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide text-xs">
              Product Title
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide text-xs">
              SKU
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide text-xs">
              Category
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600 uppercase tracking-wide text-xs">
              Base Price
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600 uppercase tracking-wide text-xs">
              Adjustment
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600 uppercase tracking-wide text-xs">
              New Price
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {selectedProducts.map((product) => {
            const { price: newPrice, floored } = calcNewPrice(product.basePrice, config)
            const isDecrease = newPrice < product.basePrice
            const isIncrease = newPrice > product.basePrice

            let priceClass = 'text-gray-800'
            if (floored) priceClass = 'text-red-600 font-semibold'
            else if (isDecrease) priceClass = 'text-green-600 font-semibold'
            else if (isIncrease) priceClass = 'text-amber-600 font-semibold'

            return (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{product.title}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {product.subCategory}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">${product.basePrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-500">{adjustmentLabel}</td>
                <td className="px-4 py-3 text-right">
                  <span className={priceClass}>${newPrice.toFixed(2)}</span>
                  {floored && (
                    <span className="block text-xs text-red-400 font-normal">floored at $0.01</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
