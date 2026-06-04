import { Router, Request, Response } from 'express'
import { listCustomers } from '../services/catalogService'

const router = Router()

/**
 * @openapi
 * /customers:
 *   get:
 *     summary: List all customers (tenant-scoped)
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Array of customers
 */
router.get('/', async (req: Request, res: Response) => {
  res.json(await listCustomers((req as any).context))
})

export default router
