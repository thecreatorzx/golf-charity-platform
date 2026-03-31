import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      role: string
    }
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  next()
}

export const requireSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId },
    })

    // Auto-lapse expired subscriptions in real-time
    if (subscription && subscription.status === 'ACTIVE' && subscription.currentPeriodEnd) {
      if (new Date() > subscription.currentPeriodEnd) {
        await prisma.subscription.update({
          where: { userId: req.userId },
          data: { status: 'LAPSED' },
        })
        res.status(403).json({ message: 'Subscription expired' })
        return
      }
    }

    if (!subscription || subscription.status !== 'ACTIVE') {
      res.status(403).json({ message: 'Active subscription required' })
      return
    }

    next()
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const requireScores = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scoreCount = await prisma.golfScore.count({
      where: { userId: req.userId },
    })

    if (scoreCount === 0) {
      res.status(403).json({ message: 'You must enter at least one score to participate in draws' })
      return
    }

    next()
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}