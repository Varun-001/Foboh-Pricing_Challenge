import { Request, Response, NextFunction } from 'express'
import { TenantModel } from '../models/Tenant'

// Reads the tenant slug from the subdomain (Host header) or the X-Tenant-Slug
// header (used in local dev where subdomains are awkward).
function extractSlug(req: Request): string | null {
  const headerSlug = req.header('X-Tenant-Slug')
  if (headerSlug) return headerSlug
  const host = req.hostname || ''
  const parts = host.split('.')
  // acme.foboh.app -> "acme"; localhost has no tenant subdomain
  if (parts.length >= 3) return parts[0]
  return null
}

export async function resolveTenant(req: Request, res: Response, next: NextFunction) {
  const slug = extractSlug(req)
  if (!slug) {
    res.status(404).json({ error: 'Tenant not specified' })
    return
  }
  const tenant = await TenantModel.findOne({ slug })
  if (!tenant) {
    res.status(404).json({ error: 'Tenant not found' })
    return
  }
  ;(req as any).tenant = { id: String(tenant._id), slug: tenant.slug }
  next()
}
