import { Router } from 'express'
import {
  getAllUsers,
  updateUserSubscription,
  adminEditScore,
  adminDeleteScore,
  getAllWinners,
  verifyWinner,
  markWinnerPaid,
  getAnalytics,
} from '../controllers/admin.controller.js'
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate, authorizeAdmin) // all admin routes protected

// Users
router.get('/users', getAllUsers)
router.put('/users/:userId/subscription', updateUserSubscription)
router.put('/scores/:scoreId', adminEditScore)
router.delete('/scores/:scoreId', adminDeleteScore)

// Winners
router.get('/winners', getAllWinners)
router.put('/winners/:winnerId/verify', verifyWinner)
router.put('/winners/:winnerId/pay', markWinnerPaid)

// Analytics
router.get('/analytics', getAnalytics)

export default router