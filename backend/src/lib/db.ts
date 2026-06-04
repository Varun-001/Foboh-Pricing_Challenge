import mongoose from 'mongoose'

// Expose `id` (string) and hide Mongo internals (_id, __v) in JSON responses so the
// frontend keeps using the same `id` field it used against the in-memory store.
mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    delete ret._id
    return ret
  },
})

export async function connectDb(uri = process.env.MONGO_URI || 'mongodb://localhost:27017/foboh') {
  await mongoose.connect(uri)
  console.log('MongoDB connected')
}

export async function disconnectDb() {
  await mongoose.disconnect()
}
