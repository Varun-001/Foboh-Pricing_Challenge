import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from '../src/lib/jwt'

describe('jwt', () => {
  it('signs and verifies a payload', () => {
    const token = signToken({ userId: 'u1', tenantId: 't1', role: 'owner' })
    const decoded = verifyToken(token)
    expect(decoded).toMatchObject({ userId: 'u1', tenantId: 't1', role: 'owner' })
  })
  it('throws on a tampered token', () => {
    const token = signToken({ userId: 'u1', tenantId: 't1', role: 'owner' })
    expect(() => verifyToken(token + 'x')).toThrow()
  })
})
