import { describe, it, expect } from 'vitest'
import { TenantModel } from '../src/models/Tenant'
import { ProductModel } from '../src/models/Product'

describe('models', () => {
  it('persists a tenant and reads it back', async () => {
    const t = await TenantModel.create({ name: 'Acme', slug: 'acme', isolationMode: 'shared' })
    const found = await TenantModel.findById(t._id)
    expect(found?.slug).toBe('acme')
  })

  it('enforces SKU uniqueness per tenant, not globally', async () => {
    await ProductModel.create({ tenantId: 'a', title: 'X', sku: 'DUP', brand: 'b', subCategory: 's', segment: 'Wine', basePrice: 10 })
    // same SKU, different tenant — allowed
    await expect(
      ProductModel.create({ tenantId: 'b', title: 'Y', sku: 'DUP', brand: 'b', subCategory: 's', segment: 'Wine', basePrice: 10 })
    ).resolves.toBeTruthy()
    // same SKU, same tenant — rejected
    await expect(
      ProductModel.create({ tenantId: 'a', title: 'Z', sku: 'DUP', brand: 'b', subCategory: 's', segment: 'Wine', basePrice: 10 })
    ).rejects.toThrow()
  })
})
