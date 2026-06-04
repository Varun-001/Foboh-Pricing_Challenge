import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'staff'], default: 'staff' },
  createdAt: { type: String, default: () => new Date().toISOString() },
})

userSchema.index({ tenantId: 1, email: 1 }, { unique: true })

export const UserModel = model('User', userSchema)
