import { Router, Request, Response } from 'express'
import { register, login } from '../services/authService'

const router = Router()

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a user for the current tenant (first user becomes owner)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Created user }
 *       400: { description: Missing fields }
 *       409: { description: User already exists }
 */
router.post('/register', async (req: Request, res: Response) => {
  const tenant = (req as any).tenant
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }
  try {
    const user = await register(tenant.id, email, password)
    res.status(201).json(user)
  } catch {
    res.status(409).json({ error: 'User already exists' })
  }
})

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in to the current tenant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Token and user }
 *       401: { description: Invalid credentials }
 */
router.post('/login', async (req: Request, res: Response) => {
  const tenant = (req as any).tenant
  const { email, password } = req.body
  try {
    const result = await login(tenant.id, email, password)
    res.json(result)
  } catch {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

export default router
