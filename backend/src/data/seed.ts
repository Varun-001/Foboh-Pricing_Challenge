import 'dotenv/config'
import { connectDb, disconnectDb } from '../lib/db'
import { TenantModel } from '../models/Tenant'
import { ProductModel } from '../models/Product'
import { CustomerGroupModel, CustomerModel } from '../models/Customer'
import { PricingProfileModel } from '../models/PricingProfile'
import { UserModel } from '../models/User'
import { register } from '../services/authService'

const PRODUCTS = [
  { title: 'High Garden Pinot Noir 2021', sku: 'HGVPIN216', brand: 'High Garden', subCategory: 'Wine Red', segment: 'Wine', basePrice: 279.06 },
  { title: 'Koyama Methode Brut Nature NV', sku: 'KOYBRUNV6', brand: 'Koyama Wines', subCategory: 'Wine Sparkling', segment: 'Wine', basePrice: 120.0 },
  { title: 'Koyama Riesling 2018', sku: 'KOYNR1837', brand: 'Koyama Wines', subCategory: 'Wine Port/Dessert', segment: 'Wine', basePrice: 215.04 },
  { title: 'Koyama Tussock Riesling 2019', sku: 'KOYRIE19', brand: 'Koyama Wines', subCategory: 'Wine White', segment: 'Wine', basePrice: 215.04 },
  { title: 'Lacoute-Godbillon Brut Cru NV', sku: 'LACBNATNV6', brand: 'Lacoute-Godbillon', subCategory: 'Wine Sparkling', segment: 'Wine', basePrice: 409.32 },
]

async function seedTenant(name: string, slug: string) {
  const tenant = await TenantModel.create({ name, slug, isolationMode: 'shared' })
  const tenantId = String(tenant._id)

  await register(tenantId, `owner@${slug}.com`, 'password123')

  const products = await ProductModel.create(PRODUCTS.map((p) => ({ ...p, tenantId })))
  const bySku = (sku: string) => products.find((p) => p.sku === sku)!

  const [gInd, gVip] = await CustomerGroupModel.create([
    { tenantId, name: 'Independent Retailers' },
    { tenantId, name: 'VIP' },
    { tenantId, name: 'Restaurants' },
  ])

  const bondi = await CustomerModel.create({ tenantId, name: 'Bondi Cellars', groupIds: [String(gInd._id), String(gVip._id)] })
  await CustomerModel.create({ tenantId, name: 'Cork and Vine', groupIds: [String(gInd._id)] })

  const wineIds = products.filter((p) => p.segment === 'Wine').map((p) => String(p._id))
  const sparklingIds = products.filter((p) => p.subCategory === 'Wine Sparkling').map((p) => String(p._id))

  await PricingProfileModel.create([
    { tenantId, name: '10% off Wine — Independent Retailers', productIds: wineIds, adjustment: 10, adjustmentType: 'dynamic', direction: 'decrease', groupIds: [String(gInd._id)], createdAt: '2026-01-15T10:00:00Z' },
    { tenantId, name: '$15 off Sparkling Wine — VIP', productIds: sparklingIds, adjustment: 15, adjustmentType: 'fixed', direction: 'decrease', groupIds: [String(gVip._id)], createdAt: '2026-02-01T10:00:00Z' },
    { tenantId, name: 'Bondi Cellars Custom Price — Koyama Methode Brut', productIds: [String(bySku('KOYBRUNV6')._id)], adjustment: 25, adjustmentType: 'fixed', direction: 'decrease', customerId: String(bondi._id), createdAt: '2026-02-15T10:00:00Z' },
  ])

  console.log(`Seeded tenant '${slug}' (login: owner@${slug}.com / password123)`)
}

async function run() {
  await connectDb()
  await Promise.all([
    TenantModel.deleteMany({}), ProductModel.deleteMany({}), CustomerModel.deleteMany({}),
    CustomerGroupModel.deleteMany({}), PricingProfileModel.deleteMany({}), UserModel.deleteMany({}),
  ])

  await seedTenant('Acme Wholesale', 'acme')
  await seedTenant('Globex Beverages', 'globex')
  await disconnectDb()
  console.log('Seed complete.')
}

run().catch((e) => { console.error(e); process.exit(1) })
