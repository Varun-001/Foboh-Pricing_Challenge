import { PricingProfile, ResolvedPrice } from '../types'
import { store } from '../data/seed'

function calcPrice(basePrice: number, profile: PricingProfile): number {
  const delta =
    profile.adjustmentType === 'fixed'
      ? profile.adjustment
      : (profile.adjustment / 100) * basePrice

  const raw = profile.direction === 'increase' ? basePrice + delta : basePrice - delta
  return Math.max(0.01, Math.round(raw * 100) / 100)
}

// // Specificity rules (specificity-wins precedence):
// //   3 — customer-specific (customerId set)
// //   2 — sub-category group (all profile products share one subCategory)
// //   1 — broad category group (products span multiple subCategories)
// function specificity(profile: PricingProfile): number {
//   if (profile.customerId) return 3

//   const subCats = new Set(
//     profile.productIds
//       .map((id) => store.products.find((p) => p.id === id))
//       .filter(Boolean)
//       .map((p) => p!.subCategory)
//   )

//   console.log(`subCats for profile ${profile.name}:`, subCats);
//   return subCats.size === 1 ? 2 : 1
// }


// Specificity-wins precedence — ranked by AUDIENCE (who the profile targets):
//   3 — customer-specific  (customerId set: a deliberate, named-customer deal)
//   2 — group-level        (groupIds set: applies to one or more customer groups)
//   1 — everyone / broad    (no customerId and no groupIds: applies to all customers)
//
// A more specific audience always beats a broader one, regardless of price.
// A named-customer price is a deliberate decision (negotiated rate, contract,
// bundled terms) and must not be silently overridden by a broader group discount.
function specificity(profile: PricingProfile): number {
  if (profile.customerId) return 3
  if (profile.groupIds && profile.groupIds.length > 0) return 2
  return 1
}
function reasonString(profile: PricingProfile, score: number): string {
  if (score === 3) return `Customer-specific profile '${profile.name}' applied — highest specificity`
  if (score === 2) return `Sub-category profile '${profile.name}' applied — mid specificity`
  return `Category profile '${profile.name}' applied — lowest specificity`
}

export function resolvePrice(customerId: string, productId: string): ResolvedPrice | null {
  const customer = store.customers.find((c) => c.id === customerId)
  const product = store.products.find((p) => p.id === productId)
  if (!customer || !product) return null

  const matching = store.profiles.filter((profile) => {
    // product must be in this profile
    if (!profile.productIds.includes(productId)) return false

    // profile must target this customer directly or via a shared group
    if (profile.customerId) return profile.customerId === customerId
    if (profile.groupIds)
      return profile.groupIds.some((gid) => customer.groupIds.includes(gid))

    return false
  })

  console.log("matching", matching);

  if (matching.length === 0) return null

  const scored = matching.map((profile) => ({
    profile,
    score: specificity(profile),
    price: calcPrice(product.basePrice, profile),
  }))

  console.log("scored", scored);

  // Sort: highest specificity first; tiebreak lowest price; tiebreak most recent creation
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.price !== b.price) return a.price - b.price
    return new Date(b.profile.createdAt).getTime() - new Date(a.profile.createdAt).getTime()
  })

  const winner = scored[0]
  return {
    price: winner.price,
    sourceProfileId: winner.profile.id,
    profileName: winner.profile.name,
    reason: reasonString(winner.profile, winner.score),
  }
}
