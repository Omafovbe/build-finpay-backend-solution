import express from 'express'
import { sequelize } from './schema/db'
import { authRoutes, invoiceRoutes } from './routes'
import dotenv from 'dotenv'
import authenticatedToken from './middleware/auth'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/invoice', authenticatedToken, invoiceRoutes)

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
    return sequelize.sync()
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
