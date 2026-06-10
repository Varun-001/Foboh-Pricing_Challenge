import { Router, Request, Response } from 'express'
import { listProfiles, createProfile, updateProfile, deleteProfile } from '../services/profileService'

const router = Router()

/**
 * @openapi
 * /profiles:
 *   get:
 *     summary: List all pricing profiles (tenant-scoped)
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: Array of pricing profiles
 */
router.get('/', async (req: Request, res: Response) => {
  res.json(await listProfiles((req as any).context))
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
router.post('/', async (req: Request, res: Response) => {
  const { name, productIds, adjustment, adjustmentType, direction } = req.body
  if (!name || !productIds || adjustment === undefined || !adjustmentType || !direction) {
    res.status(400).json({ error: 'Missing required fields: name, productIds, adjustment, adjustmentType, direction' })
    return
  }
  const profile = await createProfile((req as any).context, req.body)
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
router.put('/:id', async (req: Request, res: Response) => {
  const updated = await updateProfile((req as any).context, String(req.params.id), req.body)
  if (!updated) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }
  res.json(updated)
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
router.delete('/:id', async (req: Request, res: Response) => {
  const deleted = await deleteProfile((req as any).context, String(req.params.id))
  if (!deleted) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }
  res.status(204).send()
})

export default router
