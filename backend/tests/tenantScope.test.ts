import { describe, it, expect } from 'vitest'
import { ProductModel } from '../src/models/Product'
import { forTenant } from '../src/lib/tenantScope'
import { TenantContext } from '../src/types'

const ctxA: TenantContext = { tenantId: 'tA', userId: 'u', role: 'owner' }

describe('forTenant', () => {
  it('reads only the calling tenant rows', async () => {
    await ProductModel.create({ tenantId: 'tA', title: 'A', sku: 'A1', basePrice: 1, segment: 'Wine', subCategory: 's', brand: 'b' })
    await ProductModel.create({ tenantId: 'tB', title: 'B', sku: 'B1', basePrice: 1, segment: 'Wine', subCategory: 's', brand: 'b' })

    const aRows = await forTenant(ctxA, ProductModel).find()
    expect(aRows).toHaveLength(1)
    expect(aRows[0].sku).toBe('A1')
  })

  it('stamps tenantId on create, ignoring any tenantId in the payload', async () => {
    const doc = await forTenant(ctxA, ProductModel).create({
      tenantId: 'tB', // attempt to spoof — must be overridden
      title: 'X', sku: 'X1', basePrice: 1, segment: 'Wine', subCategory: 's', brand: 'b',
    })
    expect(doc.tenantId).toBe('tA')
  })

  it('cannot read another tenant row by id', async () => {
    const b = await ProductModel.create({ tenantId: 'tB', title: 'B', sku: 'B2', basePrice: 1, segment: 'Wine', subCategory: 's', brand: 'b' })
    const found = await forTenant(ctxA, ProductModel).findById(String(b._id))
    expect(found).toBeNull()
  })
})
