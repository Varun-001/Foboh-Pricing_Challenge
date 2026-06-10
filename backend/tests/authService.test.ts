import { describe, it, expect } from 'vitest'
import { TenantModel } from '../src/models/Tenant'
import { register, login } from '../src/services/authService'

async function seedTenant() {
  const t = await TenantModel.create({ name: 'Acme', slug: 'acme', isolationMode: 'shared' })
  return String(t._id)
}

describe('authService', () => {
  it('first user of a tenant becomes owner', async () => {
    const tenantId = await seedTenant()
    const user = await register(tenantId, 'a@acme.com', 'pw123456')
    expect(user.role).toBe('owner')
  })

  it('subsequent users default to staff', async () => {
    const tenantId = await seedTenant()
    await register(tenantId, 'a@acme.com', 'pw123456')
    const second = await register(tenantId, 'b@acme.com', 'pw123456')
    expect(second.role).toBe('staff')
  })

  it('login returns a token for valid credentials', async () => {
    const tenantId = await seedTenant()
    await register(tenantId, 'a@acme.com', 'pw123456')
    const { token, user } = await login(tenantId, 'a@acme.com', 'pw123456')
    expect(token).toBeTruthy()
    expect(user.email).toBe('a@acme.com')
  })

  it('login throws on wrong password', async () => {
    const tenantId = await seedTenant()
    await register(tenantId, 'a@acme.com', 'pw123456')
    await expect(login(tenantId, 'a@acme.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  it('login throws for a user from another tenant', async () => {
    const tenantId = await seedTenant()
    const other = await TenantModel.create({ name: 'Globex', slug: 'globex', isolationMode: 'shared' })
    await register(tenantId, 'a@acme.com', 'pw123456')
    await expect(login(String(other._id), 'a@acme.com', 'pw123456')).rejects.toThrow('Invalid credentials')
  })
})
