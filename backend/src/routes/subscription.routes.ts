import { Router } from 'express'
import {
  initiateSubscription,
  confirmSubscription,
  fetchSubscription,
  cancel,
  mockActivate,
} from '../controllers/subscription.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.post('/initiate', initiateSubscription)
router.post('/confirm', confirmSubscription)
router.post('/cancel', cancel)
router.post('/mock-activate', mockActivate)
router.get('/', fetchSubscription)

export default router