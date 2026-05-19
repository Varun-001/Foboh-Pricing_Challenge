import { Router, Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { store } from '../data/seed'
import { PricingProfile } from '../types'

const router = Router()

/**
 * @openapi
 * /profiles:
 *   get:
 *     summary: List all pricing profiles
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: Array of pricing profiles
 */
router.get('/', (_req: Request, res: Response) => {
  res.json(store.profiles)
})

/**
 * @openapi
 * /profiles:
 *   post:
 *     summary: Create a new pricing profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, productIds, adjustment, adjustmentType, direction]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               productIds: { type: array, items: { type: string } }
 *               adjustment: { type: number }
 *               adjustmentType: { type: string, enum: [fixed, dynamic] }
 *               direction: { type: string, enum: [increase, decrease] }
 *               customerId: { type: string }
 *               groupIds: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Created profile
 *       400:
 *         description: Missing required fields
 */
router.post('/', (req: Request, res: Response) => {
  const { name, productIds, adjustment, adjustmentType, direction } = req.body

  if (!name || !productIds || adjustment === undefined || !adjustmentType || !direction) {
    res.status(400).json({ error: 'Missing required fields: name, productIds, adjustment, adjustmentType, direction' })
    return
  }

  const profile: PricingProfile = {
    id: randomUUID(),
    name,
    description: req.body.description,
    productIds,
    adjustment: Number(adjustment),
    adjustmentType,
    direction,
    customerId: req.body.customerId,
    groupIds: req.body.groupIds,
    createdAt: new Date().toISOString(),
  }

  store.profiles.push(profile)
  res.status(201).json(profile)
})

/**
 * @openapi
 * /profiles/{id}:
 *   put:
 *     summary: Update an existing pricing profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated profile
 *       404:
 *         description: Profile not found
 */
router.put('/:id', (req: Request, res: Response) => {
  const idx = store.profiles.findIndex((p) => p.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }

  store.profiles[idx] = { ...store.profiles[idx], ...req.body, id: req.params.id }
  res.json(store.profiles[idx])
})

/**
 * @openapi
 * /profiles/{id}:
 *   delete:
 *     summary: Delete a pricing profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Profile not found
 */
router.delete('/:id', (req: Request, res: Response) => {
  const idx = store.profiles.findIndex((p) => p.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }

  store.profiles.splice(idx, 1)
  res.status(204).send()
})

export default router
