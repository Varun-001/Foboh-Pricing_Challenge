import { describe, it, expect } from 'vitest'
import { hash, compare } from '../src/lib/password'

describe('password', () => {
  it('hashes and verifies a correct password', async () => {
    const h = await hash('hunter2')
    expect(h).not.toBe('hunter2')
    expect(await compare('hunter2', h)).toBe(true)
  })
  it('rejects a wrong password', async () => {
    const h = await hash('hunter2')
    expect(await compare('wrong', h)).toBe(false)
  })
})
