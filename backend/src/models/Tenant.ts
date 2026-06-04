import { Schema, model } from 'mongoose'

const tenantSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isolationMode: { type: String, enum: ['shared', 'dedicated'], default: 'shared' },
  createdAt: { type: String, default: () => new Date().toISOString() },
})

export const TenantModel = model('Tenant', tenantSchema)
