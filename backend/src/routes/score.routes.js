import { Router } from 'express'
import { addScore, getScores, removeScore } from '../controllers/score.controller.js'
import { authenticate, requireSubscription } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate, requireSubscription) // all score routes require auth

router.post('/', addScore)
router.get('/', getScores)
router.delete('/:id', removeScore)

export default router