import { Router, Request, Response } from 'express'
import { store } from '../data/seed'

const router = Router()

/**
 * @openapi
 * /customers:
 *   get:
 *     summary: List all customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Array of customers
 */
router.get('/', (_req: Request, res: Response) => {
  res.json(store.customers)
})

export default router
