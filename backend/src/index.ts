import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import subscriptionRoutes from './routes/subscription.routes'
import scoreRoutes from './routes/score.routes'
import charityRoutes from './routes/charity.routes'
import drawRoutes from './routes/draw.routes'
import adminRoutes from './routes/admin.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // allows cookies to be sent
}))

app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/charities', charityRoutes)
app.use('/api/draws', drawRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})