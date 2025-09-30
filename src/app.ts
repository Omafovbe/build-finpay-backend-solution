import express from 'express'
import { sequelize } from './schema/db'
import {
  authRoutes,
  cardRoutes,
  invoiceRoutes,
  userRoutes,
  notificationRoutes,
} from './routes'
import dotenv from 'dotenv'
import authenticatedToken from './middleware/auth'
import walletRoutes from './routes/walletRoutes'
import transRoutes from './routes/transRoutes'
import { swaggerUi, specs } from './swagger'
import redoc from 'redoc-express'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(express.json())

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Redoc
app.get(
  '/redoc',
  redoc({
    title: 'FinPay API Documentation',
    specUrl: '/api-docs.json',
  })
)

// API Docs JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(specs)
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/invoice', authenticatedToken, invoiceRoutes)
app.use('/api/cards', cardRoutes)
app.use('/api/wallets', walletRoutes) // Add this line
app.use('/api/transactions', transRoutes) // Add this line
app.use('/api/user', userRoutes) // Add this line
app.use('/api/notifications', notificationRoutes) // Add this line

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
    return sequelize.sync({ alter: true })
  })
  .then(() => {
    console.log('Database synced.')
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })

app.get('/', (req, res) => {
  res.send('FinPay Backend is running!')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
