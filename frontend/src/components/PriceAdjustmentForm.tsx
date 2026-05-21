import type { Product, AdjustmentType, AdjustmentDirection } from '../types'

export interface AdjustmentConfig {
  adjustmentType: AdjustmentType
  direction: AdjustmentDirection
  value: number
}

interface Props {
  selectedProducts: Product[]
  config: AdjustmentConfig
  onChange: (config: AdjustmentConfig) => void
}

type RadioGroupProps = {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}

function RadioGroup({ label, options, value, onChange }: RadioGroupProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
              value === opt.value
                ? 'bg-foboh-teal text-white border-foboh-teal'
                : 'bg-white text-gray-600 border-gray-200 hover:border-foboh-teal/50'
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}

export default function PriceAdjustmentForm({ selectedProducts, config, onChange }: Props) {
  const wouldFloor = config.value > 0 && selectedProducts.some((p) => {
    const delta =
      config.adjustmentType === 'fixed'
        ? config.value
        : (config.value / 100) * p.basePrice
    const raw = config.direction === 'increase' ? p.basePrice + delta : p.basePrice - delta
    return raw < 0.01
  })

  return (
    <div className="space-y-5">
      <RadioGroup
        label="Adjustment Type"
        value={config.adjustmentType}
        onChange={(v) => onChange({ ...config, adjustmentType: v as AdjustmentType })}
        options={[
          { value: 'fixed',   label: 'Fixed ($)' },
          { value: 'dynamic', label: 'Dynamic (%)' },
        ]}
      />

      <RadioGroup
        label="Direction"
        value={config.direction}
        onChange={(v) => onChange({ ...config, direction: v as AdjustmentDirection })}
        options={[
          { value: 'increase', label: 'Increase +' },
          { value: 'decrease', label: 'Decrease −' },
        ]}
      />

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Adjustment Value
        </p>
        <div className="relative w-40">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            {config.adjustmentType === 'fixed' ? '$' : '%'}
          </span>
          <input
            type="number"
            min={0}
            step={config.adjustmentType === 'fixed' ? 0.01 : 0.1}
            value={config.value === 0 ? '' : config.value}
            placeholder="0"
            onChange={(e) =>
              onChange({ ...config, value: Math.max(0, parseFloat(e.target.value) || 0) })
            }
            className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-foboh-teal/30 focus:border-foboh-teal"
          />
        </div>
      </div>

      {wouldFloor && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <span className="text-amber-500 mt-0.5">⚠</span>
          <span>
            This adjustment would make {selectedProducts.filter((p) => {
              const delta = config.adjustmentType === 'fixed' ? config.value : (config.value / 100) * p.basePrice
              return (config.direction === 'decrease' ? p.basePrice - delta : p.basePrice + delta) < 0.01
            }).length} product price(s) go below $0 — they will be floored at $0.01.
          </span>
        </div>
      )}
    </div>
  )
}
