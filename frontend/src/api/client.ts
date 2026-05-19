import axios from 'axios'
import type { Product, PricingProfile, ResolvedPrice } from '../types'

const http = axios.create({ baseURL: '/api' })

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
