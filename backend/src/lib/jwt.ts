import jwt from 'jsonwebtoken'
import { Role } from '../types'

export interface TokenPayload {
  userId: string
  tenantId: string
  role: Role
}

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'

export const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: '1h' })

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, SECRET) as TokenPayload
