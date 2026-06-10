import { Schema, model } from 'mongoose'

const productSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  sku: { type: String, required: true },
  brand: String,
  subCategory: String,
  segment: String,
  basePrice: { type: Number, required: true },
})

productSchema.index({ tenantId: 1, sku: 1 }, { unique: true })

export const ProductModel = model('Product', productSchema)
