import { Request, Response, NextFunction } from 'express'
import { TenantContext } from '../types'

// Critical cross-tenant guard: the JWT's tenantId must match the subdomain's tenant.
// Prevents replaying a valid token from one tenant against another tenant's subdomain.
export function authorizeTenant(req: Request, res: Response, next: NextFunction) {
  const tenant = (req as any).tenant
  const user = (req as any).user
  if (!tenant || !user) {
    res.status(401).json({ error: 'Unauthenticated' })
    return
  }
  if (user.tenantId !== tenant.id) {
    res.status(403).json({ error: 'Token does not belong to this tenant' })
    return
  }
  const ctx: TenantContext = { tenantId: user.tenantId, userId: user.userId, role: user.role }
  ;(req as any).context = ctx
  next()
}
