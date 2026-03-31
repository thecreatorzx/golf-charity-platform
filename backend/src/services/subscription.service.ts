import { prisma } from '../lib/prisma'
import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const PLANS = {
  MONTHLY: {
    amount: Number(process.env.RAZORPAY_MONTHLY_AMOUNT || 99900),
    price: Number(process.env.MONTHLY_PRICE || 999),
    durationMonths: 1,
  },
  YEARLY: {
    amount: Number(process.env.RAZORPAY_YEARLY_AMOUNT || 899900),
    price: Number(process.env.YEARLY_PRICE || 8999),
    durationMonths: 12,
  },
}

export const createOrder = async (userId: string, plan: 'MONTHLY' | 'YEARLY') => {
  const selectedPlan = PLANS[plan]

  if (!selectedPlan) {
    throw new Error('Invalid plan')
  }

  const order = await razorpay.orders.create({
    amount: selectedPlan.amount, // in paise
    currency: 'INR',
    receipt: `receipt_${userId}_${Date.now()}`,
    notes: { userId, plan },
  })

  return order
}

export const verifyAndActivate = async (
  userId: string,
  plan: 'MONTHLY' | 'YEARLY',
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    throw new Error('Invalid payment signature')
  }

  // Calculate period end
  const now = new Date()
  const periodEnd = new Date(now)
  const selectedPlan = PLANS[plan]

  if (!selectedPlan) {
    throw new Error('Invalid plan')
  }

  periodEnd.setMonth(periodEnd.getMonth() + selectedPlan.durationMonths)
  

  // Upsert subscription
  const subscription = await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan,
      status: 'ACTIVE',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      currentPeriodEnd: periodEnd,
    },
    create: {
      userId,
      plan,
      status: 'ACTIVE',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      currentPeriodEnd: periodEnd,
    },
  })

  return subscription
}

export const getSubscription = async (userId: string) => {
  return prisma.subscription.findUnique({ where: { userId } })
}

export const calculateCharityAmount = (
  plan: 'MONTHLY' | 'YEARLY',
  percentage: number
): number => {
  const selectedPlan = PLANS[plan]

  return (selectedPlan.price * percentage) / 100
}

export const cancelSubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    throw new Error('No subscription found')
  }

  return prisma.subscription.update({
    where: { userId },
    data: { status: 'CANCELLED' },
  })
}

export const mockActivateSubscription = async (userId: string, plan: 'MONTHLY' | 'YEARLY') => {
  const now = new Date()
  const periodEnd = new Date(now)
  const selectedPlan = PLANS[plan]
  periodEnd.setMonth(periodEnd.getMonth() + selectedPlan.durationMonths)
  return prisma.subscription.upsert({
    where: { userId },
    update: { plan, status: 'ACTIVE', currentPeriodEnd: periodEnd },
    create: { userId, plan, status: 'ACTIVE', currentPeriodEnd: periodEnd },
  })
}