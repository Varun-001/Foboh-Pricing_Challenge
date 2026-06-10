import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface AuthState {
  token: string | null
  tenantSlug: string | null
  login: (token: string, tenantSlug: string) => void
  logout: () => void
}

const AuthCtx = createContext<AuthState>(null as any)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [tenantSlug, setTenantSlug] = useState<string | null>(() => localStorage.getItem('tenantSlug'))

  const login = (t: string, slug: string) => {
    localStorage.setItem('token', t)
    localStorage.setItem('tenantSlug', slug)
    setToken(t)
    setTenantSlug(slug)
  }
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('tenantSlug')
    setToken(null)
    setTenantSlug(null)
  }

  return <AuthCtx.Provider value={{ token, tenantSlug, login, logout }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
