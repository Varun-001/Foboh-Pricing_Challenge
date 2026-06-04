import { Schema, model } from 'mongoose'

const customerGroupSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
})
customerGroupSchema.index({ tenantId: 1, name: 1 }, { unique: true })

const customerSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  groupIds: { type: [String], default: [] },
})

export const CustomerGroupModel = model('CustomerGroup', customerGroupSchema)
export const CustomerModel = model('Customer', customerSchema)
