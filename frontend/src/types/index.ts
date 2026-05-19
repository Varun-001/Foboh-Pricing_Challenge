export interface Product {
  id: string
  title: string
  sku: string
  brand: string
  subCategory: string
  segment: string
  basePrice: number
}

export interface CustomerGroup {
  id: string
  name: string
}

export interface Customer {
  id: string
  name: string
  groupIds: string[]
}

export type AdjustmentType = 'fixed' | 'dynamic'
export type AdjustmentDirection = 'increase' | 'decrease'

export interface PricingProfile {
  id: string
  name: string
  description?: string
  productIds: string[]
  adjustment: number
  adjustmentType: AdjustmentType
  direction: AdjustmentDirection
  customerId?: string
  groupIds?: string[]
  createdAt: string
}

export interface ResolvedPrice {
  price: number
  sourceProfileId: string
  profileName: string
  reason: string
}

export interface PricePreviewItem {
  product: Product
  basePrice: number
  newPrice: number
  adjustment: number
  adjustmentType: AdjustmentType
  direction: AdjustmentDirection
}

export interface ProductFilters {
  search: string
  subCategory: string
  segment: string
  brand: string
}
