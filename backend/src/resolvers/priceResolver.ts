import { isValidObjectId } from 'mongoose'
import { ResolvedPrice, TenantContext } from '../types'
import { forTenant } from '../lib/tenantScope'
import { ProductModel } from '../models/Product'
import { CustomerModel } from '../models/Customer'
import { PricingProfileModel } from '../models/PricingProfile'

interface ProfileLike {
  id: string
  name: string
  productIds: string[]
  adjustment: number
  adjustmentType: 'fixed' | 'dynamic'
  direction: 'increase' | 'decrease'
  customerId?: string
  groupIds?: string[]
  createdAt: string
}

function calcPrice(basePrice: number, profile: ProfileLike): number {
  const delta =
    profile.adjustmentType === 'fixed'
      ? profile.adjustment
      : (profile.adjustment / 100) * basePrice
  const raw = profile.direction === 'increase' ? basePrice + delta : basePrice - delta
  return Math.max(0.01, Math.round(raw * 100) / 100)
}

// Specificity-wins precedence — ranked by AUDIENCE (who the profile targets):
//   3 — customer-specific (customerId set: a deliberate, named-customer deal)
//   2 — group-level       (groupIds set: applies to one or more customer groups)
//   1 — everyone / broad   (no customerId and no groupIds)
// A more specific audience always beats a broader one, regardless of price.
function specificity(profile: ProfileLike): number {
  if (profile.customerId) return 3
  if (profile.groupIds && profile.groupIds.length > 0) return 2
  return 1
}

// Fewer products targeted = more specific. An "all wine" profile stores many
// productIds; a single-product profile stores one. Lower count wins.
function productSpecificity(profile: ProfileLike): number {
  return profile.productIds.length
}

function reasonString(profile: ProfileLike, score: number): string {
  if (score === 3) return `Customer-specific profile '${profile.name}' applied — highest specificity`
  if (score === 2) return `Group profile '${profile.name}' applied — mid specificity`
  return `Broad profile '${profile.name}' applied — lowest specificity`
}

export async function resolvePrice(
  ctx: TenantContext,
  customerId: string,
  productId: string,
): Promise<ResolvedPrice | null> {
  // Malformed ids resolve to not-found rather than throwing a cast error.
  if (!isValidObjectId(customerId) || !isValidObjectId(productId)) return null

  const customer = await forTenant(ctx, CustomerModel).findById(customerId)
  const product = await forTenant(ctx, ProductModel).findById(productId)
  if (!customer || !product) return null

  // Tenant-scoped + product-filtered at the query layer, not in JS.
  const candidates = await forTenant(ctx, PricingProfileModel).find({ productIds: productId })

  const matching = candidates.filter((profile: any) => {
    if (profile.customerId) return profile.customerId === customerId
    if (profile.groupIds && profile.groupIds.length > 0)
      return profile.groupIds.some((gid: string) => customer.groupIds.includes(gid))
    return true // broad profile applies to everyone in the tenant
  })

  if (matching.length === 0) return null

  const scored = matching.map((doc: any) => {
    const profile: ProfileLike = {
      id: String(doc._id),
      name: doc.name,
      productIds: doc.productIds,
      adjustment: doc.adjustment,
      adjustmentType: doc.adjustmentType,
      direction: doc.direction,
      customerId: doc.customerId,
      groupIds: doc.groupIds,
      createdAt: doc.createdAt,
    }
    return { profile, score: specificity(profile), price: calcPrice(product.basePrice, profile) }
  })

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    // Within an audience tier, the narrower product scope is more specific.
    const aProd = productSpecificity(a.profile)
    const bProd = productSpecificity(b.profile)
    if (aProd !== bProd) return aProd - bProd
    if (a.price !== b.price) return a.price - b.price
    return new Date(b.profile.createdAt).getTime() - new Date(a.profile.createdAt).getTime()
  })

  const winner = scored[0]
  const runnerUp = scored[1]
  // If a same-audience runner-up was beaten purely on product breadth, say so.
  const decidedByProduct =
    runnerUp &&
    runnerUp.score === winner.score &&
    productSpecificity(winner.profile) < productSpecificity(runnerUp.profile)

  const reason = decidedByProduct
    ? `${reasonString(winner.profile, winner.score)} — narrower product scope (` +
      `${productSpecificity(winner.profile)} product${productSpecificity(winner.profile) === 1 ? '' : 's'}) ` +
      `beat '${runnerUp.profile.name}' (${productSpecificity(runnerUp.profile)} products) at the same audience level`
    : reasonString(winner.profile, winner.score)

  return {
    price: winner.price,
    sourceProfileId: winner.profile.id,
    profileName: winner.profile.name,
    reason,
  }
}
