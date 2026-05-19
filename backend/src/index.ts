import express from 'express'
import cors from 'cors'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import productsRouter from './routes/products'
import profilesRouter from './routes/profiles'
import resolveRouter from './routes/resolve'
import customersRouter from './routes/customers'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FOBOH Pricing API',
      version: '1.0.0',
      description: 'Pricing profile management and price resolution for food & beverage suppliers',
    },
    servers: [{ url: `http://localhost:${PORT}/api` }],
  },
  apis: ['./src/routes/*.ts'],
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/products', productsRouter)
app.use('/api/profiles', profilesRouter)
app.use('/api/resolve', resolveRouter)
app.use('/api/customers', customersRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`)
})
