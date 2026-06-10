import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header('Authorization') || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' })
    return
  }
  try {
    const payload = verifyToken(token)
    ;(req as any).user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
