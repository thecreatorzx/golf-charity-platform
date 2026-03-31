import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { prisma } from '../lib/prisma'
import { VerificationStatus } from '@prisma/client'

// ─── USERS ──────────────────────────────────────────────

export const getAllUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        subscription: true,
        scores: { orderBy: { datePlayed: 'desc' }, take: 5 },
        charityContribution: { include: { charity: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ users })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateUserSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { status } = req.body
    const subscription = await prisma.subscription.update({
      where: { userId: userId as string },
      data: { status },
    })
    res.json({ subscription })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const adminEditScore = async (req: AuthRequest, res: Response) => {
  try {
    const { scoreId } = req.params
    const { score, datePlayed } = req.body

    const existing = await prisma.golfScore.findUnique({ where: { id: scoreId as string } })
    if (!existing) {
      res.status(404).json({ message: 'Score not found' })
      return
    }

    const updated = await prisma.golfScore.update({
      where: { id: scoreId as string },
      data: { score: Number(score), datePlayed: new Date(datePlayed) },
    })
    res.json({ score: updated })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const adminDeleteScore = async (req: AuthRequest, res: Response) => {
  try {
    const { scoreId } = req.params
    await prisma.golfScore.delete({ where: { id: scoreId as string } })
    res.json({ message: 'Score deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

// ─── WINNERS ─────────────────────────────────────────────

export const getAllWinners = async (_req: AuthRequest, res: Response) => {
  try {
    const winners = await prisma.winner.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        drawResult: {
          include: {
            draw: { select: { month: true, year: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ winners })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const verifyWinner = async (req: AuthRequest, res: Response) => {
  try {
    const { winnerId } = req.params
    const { verificationStatus } = req.body

    if (!['APPROVED', 'REJECTED'].includes(verificationStatus)) {
      res.status(400).json({ message: 'Invalid verification status' })
      return
    }

    const winner = await prisma.winner.update({
      where: { id: winnerId as string },
      data: { verificationStatus: verificationStatus as VerificationStatus },
    })
    res.json({ winner })
  } catch (error:any) {
    console.log(error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const markWinnerPaid = async (req: AuthRequest, res: Response) => {
  try {
    const { winnerId } = req.params
    const winner = await prisma.winner.update({
      where: { id: winnerId as string },
      data: { paymentStatus: 'PAID' },
    })
    res.json({ winner })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

// ─── ANALYTICS ───────────────────────────────────────────

export const getAnalytics = async (_req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      totalCharityContributions,
      totalDraws,
      totalWinners,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.charityContribution.aggregate({ _sum: { percentage: true } }),
      prisma.draw.count(),
      prisma.winner.count(),
    ])

    res.json({
      totalUsers,
      activeSubscriptions,
      totalCharityContributions: totalCharityContributions._sum.percentage || 0,
      totalDraws,
      totalWinners,
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}