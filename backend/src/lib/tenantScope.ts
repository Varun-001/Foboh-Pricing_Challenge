import { Model } from 'mongoose'
import { TenantContext } from '../types'

// The single tenancy enforcement choke point. Every read/write derives tenantId
// from ctx — never from the request body. This is the seam that would change if a
// tenant were promoted to a dedicated DB (swap the Model source by ctx.tenantId).
export function forTenant<T>(ctx: TenantContext, Model: Model<T>) {
  const scope = { tenantId: ctx.tenantId }
  return {
    find: (filter: Record<string, unknown> = {}) => Model.find({ ...filter, ...scope }),
    findOne: (filter: Record<string, unknown> = {}) => Model.findOne({ ...filter, ...scope }),
    findById: (id: string) => Model.findOne({ _id: id, ...scope }),
    create: (doc: Record<string, unknown>) => Model.create({ ...doc, ...scope } as any),
    updateById: (id: string, update: Record<string, unknown>) =>
      Model.findOneAndUpdate({ _id: id, ...scope }, { ...update, ...scope }, { new: true }),
    deleteById: (id: string) => Model.findOneAndDelete({ _id: id, ...scope }),
  }
}
