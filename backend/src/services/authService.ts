import { UserModel } from '../models/User'
import { hash, compare } from '../lib/password'
import { signToken } from '../lib/jwt'
import { Role, User } from '../types'

function toUser(doc: any): User {
  return {
    id: String(doc._id),
    tenantId: doc.tenantId,
    email: doc.email,
    role: doc.role as Role,
    createdAt: doc.createdAt,
  }
}

export async function register(tenantId: string, email: string, password: string): Promise<User> {
  const existingCount = await UserModel.countDocuments({ tenantId })
  const role: Role = existingCount === 0 ? 'owner' : 'staff'
  const passwordHash = await hash(password)
  const doc = await UserModel.create({ tenantId, email, passwordHash, role })
  return toUser(doc)
}

export async function login(tenantId: string, email: string, password: string) {
  const doc = await UserModel.findOne({ tenantId, email })
  if (!doc) throw new Error('Invalid credentials')
  const ok = await compare(password, doc.passwordHash)
  if (!ok) throw new Error('Invalid credentials')
  const user = toUser(doc)
  const token = signToken({ userId: user.id, tenantId: user.tenantId, role: user.role })
  return { token, user }
}
