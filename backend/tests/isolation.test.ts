import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { buildApp } from '../src/index'
import { TenantModel } from '../src/models/Tenant'
import { register, login } from '../src/services/authService'
import { ProductModel } from '../src/models/Product'

const app = buildApp()

async function makeTenant(slug: string) {
  const t = await TenantModel.create({ name: slug, slug, isolationMode: 'shared' })
  await register(String(t._id), `owner@${slug}.com`, 'pw123456')
  const { token } = await login(String(t._id), `owner@${slug}.com`, 'pw123456')
  return { id: String(t._id), slug, token }
}

describe('tenant isolation over HTTP', () => {
  let acme: any
  let globex: any

  beforeEach(async () => {
    acme = await makeTenant('acme')
    globex = await makeTenant('globex')
    await ProductModel.create({ tenantId: acme.id, title: 'Acme Wine', sku: 'AW1', brand: 'b', subCategory: 's', segment: 'Wine', basePrice: 50 })
    await ProductModel.create({ tenantId: globex.id, title: 'Globex Wine', sku: 'GW1', brand: 'b', subCategory: 's', segment: 'Wine', basePrice: 50 })
  })

  it('a tenant sees only its own products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('X-Tenant-Slug', 'acme')
      .set('Authorization', `Bearer ${acme.token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].sku).toBe('AW1')
  })

  it('rejects a missing token with 401', async () => {
    const res = await request(app).get('/api/products').set('X-Tenant-Slug', 'acme')
    expect(res.status).toBe(401)
  })

  it('rejects a cross-tenant token with 403', async () => {
    // acme token used against the globex subdomain
    const res = await request(app)
      .get('/api/products')
      .set('X-Tenant-Slug', 'globex')
      .set('Authorization', `Bearer ${acme.token}`)
    expect(res.status).toBe(403)
  })

  it('login with a wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Tenant-Slug', 'acme')
      .send({ email: 'owner@acme.com', password: 'wrong' })
    expect(res.status).toBe(401)
  })
})
