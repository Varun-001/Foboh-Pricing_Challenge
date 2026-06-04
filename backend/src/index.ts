import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import { connectDb } from './lib/db'
import { resolveTenant } from './middleware/resolveTenant'
import { authenticate } from './middleware/authenticate'
import { authorizeTenant } from './middleware/authorizeTenant'

import authRouter from './routes/auth'
import productsRouter from './routes/products'
import profilesRouter from './routes/profiles'
import resolveRouter from './routes/resolve'
import customersRouter from './routes/customers'

export function buildApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'FOBOH Pricing API', version: '2.0.0', description: 'Multi-tenant pricing API' },
      servers: [{ url: `http://localhost:${process.env.PORT || 3001}/api` }],
    },
    apis: ['./src/routes/*.ts'],
  })
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  // Public, tenant-scoped (resolveTenant only): auth endpoints.
  app.use('/api/auth', resolveTenant, authRouter)

  // Protected: full chain resolveTenant -> authenticate -> authorizeTenant.
  const protect = [resolveTenant, authenticate, authorizeTenant]
  app.use('/api/products', ...protect, productsRouter)
  app.use('/api/profiles', ...protect, profilesRouter)
  app.use('/api/resolve', ...protect, resolveRouter)
  app.use('/api/customers', ...protect, customersRouter)

  return app
}

if (require.main === module) {
  const PORT = process.env.PORT || 3001
  connectDb().then(() => {
    buildApp().listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
      console.log(`Swagger UI: http://localhost:${PORT}/api-docs`)
    })
  })
}
