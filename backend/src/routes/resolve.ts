import { Router, Request, Response } from 'express'
import { resolvePrice } from '../resolvers/priceResolver'

const router = Router()

/**
 * @openapi
 * /resolve:
 *   get:
 *     summary: Resolve the winning price for a customer + product combination
 *     tags: [Resolve]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema: { type: string }
 *         description: ID of the customer
 *       - in: query
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: Resolved price with winning profile and reason
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 price: { type: number }
 *                 sourceProfileId: { type: string }
 *                 profileName: { type: string }
 *                 reason: { type: string }
 *       400:
 *         description: Missing customerId or productId
 *       404:
 *         description: Customer or product not found, or no matching profile
 */
router.get('/', async (req: Request, res: Response) => {
  const { customerId, productId } = req.query as Record<string, string>
  if (!customerId || !productId) {
    res.status(400).json({ error: 'customerId and productId are required' })
    return
  }
  const result = await resolvePrice((req as any).context, customerId, productId)
  if (!result) {
    res.status(404).json({ error: 'No matching profile found for this customer and product' })
    return
  }
  res.json(result)
})

export default router
