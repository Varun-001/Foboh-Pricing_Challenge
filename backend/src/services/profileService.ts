import { TenantContext } from '../types'
import { forTenant } from '../lib/tenantScope'
import { PricingProfileModel } from '../models/PricingProfile'

export function listProfiles(ctx: TenantContext) {
  return forTenant(ctx, PricingProfileModel).find()
}

export function createProfile(ctx: TenantContext, body: Record<string, unknown>) {
  return forTenant(ctx, PricingProfileModel).create({
    name: body.name,
    description: body.description,
    productIds: body.productIds,
    adjustment: Number(body.adjustment),
    adjustmentType: body.adjustmentType,
    direction: body.direction,
    customerId: body.customerId,
    groupIds: body.groupIds,
  })
}

export function updateProfile(ctx: TenantContext, id: string, body: Record<string, unknown>) {
  return forTenant(ctx, PricingProfileModel).updateById(id, body)
}

export function deleteProfile(ctx: TenantContext, id: string) {
  return forTenant(ctx, PricingProfileModel).deleteById(id)
}
