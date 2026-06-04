import { Schema, model } from 'mongoose'

const profileSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: String,
  productIds: { type: [String], default: [] },
  adjustment: { type: Number, required: true },
  adjustmentType: { type: String, enum: ['fixed', 'dynamic'], required: true },
  direction: { type: String, enum: ['increase', 'decrease'], required: true },
  customerId: String,
  groupIds: [String],
  createdAt: { type: String, default: () => new Date().toISOString() },
})

profileSchema.index({ tenantId: 1, productIds: 1 })

export const PricingProfileModel = model('PricingProfile', profileSchema)
