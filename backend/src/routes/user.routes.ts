import { Router } from 'express'
import { authenticate, requireSubscription } from '../middleware/auth.middleware.js'
import {
  getDashboard,
  updateProfile,
  uploadWinnerProof,
  getPublishedDraws,
} from '../controllers/user.controller.js'

const router = Router()

router.get('/dashboard', authenticate, getDashboard)

router.put('/profile', authenticate, updateProfile)

router.post(
  '/winners/:winnerId/proof',
  authenticate,
  requireSubscription,
  uploadWinnerProof
)

router.get(
  '/draws/published',
  authenticate,
  requireSubscription,
  getPublishedDraws
)

export default router