import { Router, Request, Response } from 'express'
import { store } from '../data/seed'

const router = Router()

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List products with optional filters
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
 *         description: Filter by brand (case-insensitive contains)
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
router.get('/', (req: Request, res: Response) => {
  const { title, sku, brand, subCategory, segment } = req.query as Record<string, string>

  const results = store.products.filter((p) => {
    if (title && !p.title.toLowerCase().includes(title.toLowerCase())) return false
    if (sku && !p.sku.toLowerCase().includes(sku.toLowerCase())) return false
    if (brand && !p.brand.toLowerCase().includes(brand.toLowerCase())) return false
    if (subCategory && p.subCategory !== subCategory) return false
    if (segment && p.segment !== segment) return false
    return true
  })

  res.json(results)
})

export default router
