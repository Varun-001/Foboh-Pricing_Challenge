import { TenantContext } from '../types'
import { forTenant } from '../lib/tenantScope'
import { ProductModel } from '../models/Product'
import { CustomerModel } from '../models/Customer'

export function listProducts(ctx: TenantContext, filter: Record<string, unknown> = {}) {
  return forTenant(ctx, ProductModel).find(filter)
}

export function listCustomers(ctx: TenantContext) {
  return forTenant(ctx, CustomerModel).find()
}
