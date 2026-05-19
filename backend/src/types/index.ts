export interface Product {
  id: string
  title: string
  sku: string
  brand: string
  subCategory: string   // "Wine Sparkling", "Wine Red", etc.
  segment: string       // "Wine", "Beer", "Spirits", etc.
  basePrice: number
}

export interface CustomerGroup {
  id: string
  name: string          // "VIP", "Independent Retailers", etc.
}

export interface Customer {
  id: string
  name: string
  groupIds: string[]    // a customer can belong to multiple groups
}

export type AdjustmentType = 'fixed' | 'dynamic'
export type AdjustmentDirection = 'increase' | 'decrease'

export interface PricingProfile {
  id: string
  name: string
  description?: string
  
  // Which products this profile applies to
  productIds: string[]
  
  // The price adjustment to apply
  adjustment: number                      // either $ amount or % value
  adjustmentType: AdjustmentType          // 'fixed' = $, 'dynamic' = %
  direction: AdjustmentDirection          // 'increase' or 'decrease'
  
  // Who this profile applies to — set ONE of these:
  customerId?: string                     // specific customer → highest priority
  groupIds?: string[]                     // one or more groups → middle priority
                                          // both undefined = applies to everyone → lowest priority
  createdAt: string                       // ISO timestamp
}
export interface ResolvedPrice {
  price: number
  sourceProfileId: string
  profileName: string
  reason: string          // human-readable explanation of why this profile won
}
export interface PricePreviewItem {
  product: Product
  basePrice: number
  newPrice: number
  adjustment: number
  adjustmentType: AdjustmentType
  direction: AdjustmentDirection
}

