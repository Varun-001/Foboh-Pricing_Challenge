import { Product, Customer, CustomerGroup, PricingProfile } from '../types'

export const products: Product[] = [
  {
    id: 'prod-1',
    title: 'High Garden Pinot Noir 2021',
    sku: 'HGVPIN216',
    brand: 'High Garden',
    subCategory: 'Wine Red',
    segment: 'Wine',
    basePrice: 279.06,
  },
  {
    id: 'prod-2',
    title: 'Koyama Methode Brut Nature NV',
    sku: 'KOYBRUNV6',
    brand: 'Koyama Wines',
    subCategory: 'Wine Sparkling',
    segment: 'Wine',
    basePrice: 120.00,
  },
  {
    id: 'prod-3',
    title: 'Koyama Riesling 2018',
    sku: 'KOYNR1837',
    brand: 'Koyama Wines',
    subCategory: 'Wine Port/Dessert',
    segment: 'Wine',
    basePrice: 215.04,
  },
  {
    id: 'prod-4',
    title: 'Koyama Tussock Riesling 2019',
    sku: 'KOYRIE19',
    brand: 'Koyama Wines',
    subCategory: 'Wine White',
    segment: 'Wine',
    basePrice: 215.04,
  },
  {
    id: 'prod-5',
    title: 'Lacoute-Godbillon Brut Cru NV',
    sku: 'LACBNATNV6',
    brand: 'Lacoute-Godbillon',
    subCategory: 'Wine Sparkling',
    segment: 'Wine',
    basePrice: 409.32,
  },
]

export const customerGroups: CustomerGroup[] = [
  { id: 'group-independent', name: 'Independent Retailers' },
  { id: 'group-vip', name: 'VIP' },
  { id: 'group-restaurants', name: 'Restaurants' },
]

export const customers: Customer[] = [
  {
    id: 'cust-bondi-cellars',
    name: 'Bondi Cellars',
    groupIds: ['group-independent', 'group-vip'],
  },
  {
    id: 'cust-cork-and-vine',
    name: 'Cork and Vine',
    groupIds: ['group-independent'],
  },
  {
    id: 'cust-the-grand-hotel',
    name: 'The Grand Hotel',
    groupIds: ['group-vip', 'group-restaurants'],
  },
]

// Profile A: 10% off all Wine → Independent Retailers (category-level, specificity 1)
// Profile B: $15 off Sparkling Wine → VIP (sub-category-level, specificity 2)
// Profile C: custom $95 on Koyama Brut Nature → Bondi Cellars only (customer-level, specificity 3)
//
// Bondi Cellars is in both groups. All three profiles match prod-2 (base $120):
//   Profile A → $108 | Profile B → $105 | Profile C → $95
// Specificity wins: Profile C takes precedence → Bondi Cellars pays $95.
export const profiles: PricingProfile[] = [
  {
    id: 'profile-a',
    name: '10% off Wine — Independent Retailers',
    description: 'Category-wide discount for independent retail group',
    productIds: products.filter((p) => p.segment === 'Wine').map((p) => p.id),
    adjustment: 10,
    adjustmentType: 'dynamic',
    direction: 'decrease',
    groupIds: ['group-independent'],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'profile-b',
    name: '$15 off Sparkling Wine — VIP',
    description: 'Sub-category discount for VIP customers',
    productIds: products.filter((p) => p.subCategory === 'Wine Sparkling').map((p) => p.id),
    adjustment: 15,
    adjustmentType: 'fixed',
    direction: 'decrease',
    groupIds: ['group-vip'],
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'profile-c',
    name: 'Bondi Cellars Custom Price — Koyama Methode Brut',
    description: 'Negotiated price for key account',
    productIds: ['prod-2'],
    adjustment: 25,
    adjustmentType: 'fixed',
    direction: 'decrease',
    customerId: 'cust-bondi-cellars',
    createdAt: '2026-02-15T10:00:00Z',
  },
]

export const store = {
  products: [...products],
  customerGroups: [...customerGroups],
  customers: [...customers],
  profiles: [...profiles],
}
