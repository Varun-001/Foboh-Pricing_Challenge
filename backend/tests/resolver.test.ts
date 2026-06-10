import { describe, it, expect, beforeEach } from 'vitest'
import { ProductModel } from '../src/models/Product'
import { CustomerModel } from '../src/models/Customer'
import { PricingProfileModel } from '../src/models/PricingProfile'
import { resolvePrice } from '../src/resolvers/priceResolver'
import { TenantContext } from '../src/types'

const ctx: TenantContext = { tenantId: 'tA', userId: 'u', role: 'owner' }

beforeEach(async () => {
  await ProductModel.create({ tenantId: 'tA', title: 'Koyama Brut', sku: 'KOY', brand: 'Koyama', subCategory: 'Wine Sparkling', segment: 'Wine', basePrice: 120 })
  const koyama = await ProductModel.findOne({ tenantId: 'tA', sku: 'KOY' })
  const pid = String(koyama!._id)

  await CustomerModel.create({ tenantId: 'tA', name: 'Bondi Cellars', groupIds: ['g-ind', 'g-vip'] })

  // Profile A: 10% off (group) -> $108
  await PricingProfileModel.create({ tenantId: 'tA', name: 'A', productIds: [pid], adjustment: 10, adjustmentType: 'dynamic', direction: 'decrease', groupIds: ['g-ind'], createdAt: '2026-01-15T10:00:00Z' })
  // Profile B: $15 off (group) -> $105
  await PricingProfileModel.create({ tenantId: 'tA', name: 'B', productIds: [pid], adjustment: 15, adjustmentType: 'fixed', direction: 'decrease', groupIds: ['g-vip'], createdAt: '2026-02-01T10:00:00Z' })
  // Profile C: $25 off, customer-specific -> $95
  const bondi = await CustomerModel.findOne({ tenantId: 'tA', name: 'Bondi Cellars' })
  await PricingProfileModel.create({ tenantId: 'tA', name: 'Bondi Custom', productIds: [pid], adjustment: 25, adjustmentType: 'fixed', direction: 'decrease', customerId: String(bondi!._id), createdAt: '2026-02-15T10:00:00Z' })
})

describe('resolvePrice', () => {
  it('customer-specific profile wins the brief scenario at $95', async () => {
    const product = await ProductModel.findOne({ tenantId: 'tA', sku: 'KOY' })
    const customer = await CustomerModel.findOne({ tenantId: 'tA', name: 'Bondi Cellars' })
    const result = await resolvePrice(ctx, String(customer!._id), String(product!._id))
    expect(result?.price).toBe(95)
    expect(result?.reason).toMatch(/highest specificity/)
  })

  it('returns null when no profile matches', async () => {
    const product = await ProductModel.findOne({ tenantId: 'tA', sku: 'KOY' })
    const result = await resolvePrice(ctx, 'nonexistent-customer', String(product!._id))
    expect(result).toBeNull()
  })

  it('within the same audience tier, the narrower product scope wins even when broader is cheaper', async () => {
    const product = await ProductModel.findOne({ tenantId: 'tA', sku: 'KOY' })
    const pid = String(product!._id)
    // A second product so the broad profile genuinely targets more than one.
    const other = await ProductModel.create({ tenantId: 'tA', title: 'Other', sku: 'OTH', brand: 'b', subCategory: 'Wine White', segment: 'Wine', basePrice: 100 })

    const cust = await CustomerModel.create({ tenantId: 'tA', name: 'Group Buyer', groupIds: ['g-x'] })

    // Broad group profile: 2 products, cheaper ($10 off -> $110)
    await PricingProfileModel.create({ tenantId: 'tA', name: 'Broad', productIds: [pid, String(other._id)], adjustment: 10, adjustmentType: 'fixed', direction: 'decrease', groupIds: ['g-x'], createdAt: '2026-03-01T10:00:00Z' })
    // Narrow group profile: 1 product, dearer ($5 off -> $115)
    await PricingProfileModel.create({ tenantId: 'tA', name: 'Narrow', productIds: [pid], adjustment: 5, adjustmentType: 'fixed', direction: 'decrease', groupIds: ['g-x'], createdAt: '2026-03-02T10:00:00Z' })

    const result = await resolvePrice({ tenantId: 'tA', userId: 'u', role: 'owner' }, String(cust._id), pid)
    expect(result?.profileName).toBe('Narrow')
    expect(result?.price).toBe(115)
    expect(result?.reason).toMatch(/narrower product scope/i)
  })

  it('audience stays primary: a customer profile targeting many products beats a group profile targeting one', async () => {
    const product = await ProductModel.findOne({ tenantId: 'tA', sku: 'KOY' })
    const pid = String(product!._id)
    const other = await ProductModel.create({ tenantId: 'tA', title: 'Other2', sku: 'OTH2', brand: 'b', subCategory: 'Wine White', segment: 'Wine', basePrice: 100 })
    const cust = await CustomerModel.create({ tenantId: 'tA', name: 'Mixed Buyer', groupIds: ['g-y'] })

    // Group profile, narrow (1 product)
    await PricingProfileModel.create({ tenantId: 'tA', name: 'GroupNarrow', productIds: [pid], adjustment: 5, adjustmentType: 'fixed', direction: 'decrease', groupIds: ['g-y'], createdAt: '2026-03-01T10:00:00Z' })
    // Customer profile, broad (2 products) — still wins because audience is primary
    await PricingProfileModel.create({ tenantId: 'tA', name: 'CustBroad', productIds: [pid, String(other._id)], adjustment: 1, adjustmentType: 'fixed', direction: 'decrease', customerId: String(cust._id), createdAt: '2026-03-02T10:00:00Z' })

    const result = await resolvePrice({ tenantId: 'tA', userId: 'u', role: 'owner' }, String(cust._id), pid)
    expect(result?.profileName).toBe('CustBroad')
  })
})
