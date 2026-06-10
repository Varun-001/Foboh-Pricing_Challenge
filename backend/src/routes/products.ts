import { Router, Request, Response } from 'express'
import { listProducts } from '../services/catalogService'

const router = Router()

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List products with optional filters (tenant-scoped)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema: { type: string }
 *         description: Filter by title (case-insensitive contains)
 *       - in: query
 *         name: sku
 *         schema: { type: string }
 *         description: Filter by SKU (case-insensitive contains)
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *         description: Filter by brand (exact match)
 *       - in: query
 *         name: subCategory
 *         schema: { type: string }
 *         description: Filter by sub-category (exact match)
 *       - in: query
 *         name: segment
 *         schema: { type: string }
 *         description: Filter by segment (exact match)
 *     responses:
 *       200:
 *         description: Filtered list of products
 */
router.get('/', async (req: Request, res: Response) => {
  const ctx = (req as any).context
  const { title, sku, brand, subCategory, segment } = req.query as Record<string, string>
  const filter: Record<string, unknown> = {}
  if (title) filter.title = new RegExp(title, 'i')
  if (sku) filter.sku = new RegExp(sku, 'i')
  if (brand) filter.brand = brand
  if (subCategory) filter.subCategory = subCategory
  if (segment) filter.segment = segment
  res.json(await listProducts(ctx, filter))
})

export default router
