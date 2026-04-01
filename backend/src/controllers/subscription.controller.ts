import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { createOrder, verifyAndActivate, getSubscription, cancelSubscription, mockActivateSubscription  } from '../services/subscription.service.js'

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

export const cancel = async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await cancelSubscription(req.userId!)
    res.json({ subscription, message: 'Subscription cancelled' })
  } catch (error: any) {
    const status = error.message === 'No subscription found' ? 404 : 500
    res.status(status).json({ message: error.message || 'Server error' })
  }
}

export const mockActivate = async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body
    if (!plan || !['MONTHLY', 'YEARLY'].includes(plan)) {
      res.status(400).json({ message: 'Invalid plan' })
      return
    }
    const subscription = await mockActivateSubscription(req.userId!, plan)
    res.json({ subscription })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}