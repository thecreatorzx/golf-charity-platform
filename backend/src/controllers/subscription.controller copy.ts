import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { createOrder, verifyAndActivate, getSubscription } from '../services/subscription.service'

export const initiateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body
    if (!plan || !['MONTHLY', 'YEARLY'].includes(plan)) {
      res.status(400).json({ message: 'Invalid plan' })
      return
    }

    const order = await createOrder(req.userId!, plan)
    res.json({ order, key: process.env.RAZORPAY_KEY_ID })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

export const confirmSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const {
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    const subscription = await verifyAndActivate(
      req.userId!,
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    res.json({ subscription })
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Verification failed' })
  }
}

export const fetchSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await getSubscription(req.userId!)
    res.json({ subscription })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}