import { Router } from 'express'
import {
  simulateDraw,
  publishDraw,
  fetchDrawResults,
  fetchAllDraws,
} from '../controllers/draw.controller'
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware'

const router = Router()

// Subscriber — published draws only
router.get('/', authenticate, fetchAllDraws)
router.get('/:month/:year', authenticate, fetchDrawResults)

// Admin only
router.post('/simulate', authenticate, authorizeAdmin, simulateDraw)
router.post('/publish', authenticate, authorizeAdmin, publishDraw)

export default router