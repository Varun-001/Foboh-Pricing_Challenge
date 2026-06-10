import axios from 'axios'
import type { Product, PricingProfile, ResolvedPrice } from '../types'

const http = axios.create({ baseURL: '/api' })

// Inject the JWT and tenant slug on every request.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const tenantSlug = localStorage.getItem('tenantSlug')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (tenantSlug) config.headers['X-Tenant-Slug'] = tenantSlug
  return config
})

// On an expired/invalid session, clear and bounce to login.
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('tenantSlug')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export const getCustomers = () =>
  http.get<import('../types').Customer[]>('/customers').then((r) => r.data)

export const getProducts = (params?: Record<string, string>) =>
  http.get<Product[]>('/products', { params }).then((r) => r.data)

export const getProfiles = () =>
  http.get<PricingProfile[]>('/profiles').then((r) => r.data)

export const createProfile = (data: Omit<PricingProfile, 'id' | 'createdAt'>) =>
  http.post<PricingProfile>('/profiles', data).then((r) => r.data)

export const updateProfile = (id: string, data: Partial<PricingProfile>) =>
  http.put<PricingProfile>(`/profiles/${id}`, data).then((r) => r.data)

export const deleteProfile = (id: string) =>
  http.delete(`/profiles/${id}`)

export const resolvePrice = (customerId: string, productId: string) =>
  http.get<ResolvedPrice>('/resolve', { params: { customerId, productId } }).then((r) => r.data)
