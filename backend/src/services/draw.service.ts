import { prisma } from '../lib/prisma'
import { DRAW_CONFIG } from '../config/draw.config'

const { PRIZE_DISTRIBUTION, SUBSCRIPTION_PRICES, PRIZE_POOL_PERCENTAGE } = DRAW_CONFIG


// Generate 5 random winning numbers between 1-45
export const generateRandomNumbers = (): number[] => {
  const numbers: number[] = []
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) numbers.push(num)
  }
  return numbers.sort((a, b) => a - b)
}

// Weighted generation based on most frequent user scores
export const generateWeightedNumbers = async (): Promise<number[]> => {
  const scores = await prisma.golfScore.findMany({
    select: { score: true }
  })

  const freq: Record<number, number> = {}
  scores.forEach(({ score }) => {
    freq[score] = (freq[score] || 0) + 1
  })

  const pool: number[] = []

  Object.entries(freq).forEach(([score, count]) => {
    const weight = Math.ceil(Math.log(count + 1)) // log scaling
    for (let i = 0; i < weight; i++) pool.push(Number(score))
  })

  if (pool.length < 5) return generateRandomNumbers()

  const selected: number[] = []
  const poolCopy = [...pool]

  while (selected.length < 5) {
    const idx = Math.floor(Math.random() * poolCopy.length)
    const num = poolCopy[idx]
    if (!selected.includes(num)) selected.push(num)
  }

  return selected.sort((a, b) => a - b)
}


// Count how many numbers match
const countMatches = (userScores: number[], winningNumbers: number[]): number => {
  return userScores.filter(s => winningNumbers.includes(s)).length
}

// Calculate prize pool from active subscribers
export const calculatePrizePool = async (carryOver: number = 0): Promise<number> => {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    select: { plan: true }
  })

  const total = activeSubscriptions.reduce((sum, sub) => {
    return sum + SUBSCRIPTION_PRICES[sub.plan]
  }, 0)

  return (total * PRIZE_POOL_PERCENTAGE) + carryOver
}

// Run draw simulation or publish
export const runDraw = async (
  month: number,
  year: number,
  algorithm: 'RANDOM' | 'WEIGHTED' = 'RANDOM',
  publish: boolean = false
) => {

  return await prisma.$transaction(async (tx) => {

    let draw = await tx.draw.findUnique({ where: { month_year: { month, year } } })

    if (draw?.status === 'PUBLISHED') {
      return {
        draw,
        winningNumbers: draw.winningNumbers,
        prizePool: draw.prizePool,
        results: await tx.drawResult.findMany({
          where: { drawId: draw.id }
        }),
        jackpotCarryOver: draw.jackpotCarryOver
      }
    }

    let winningNumbers = draw?.winningNumbers

    if (!winningNumbers || winningNumbers.length === 0) {
      winningNumbers = algorithm === 'WEIGHTED'
        ? await generateWeightedNumbers()
        : generateRandomNumbers()
    }

    const prizePool = await calculatePrizePool(draw?.jackpotCarryOver || 0)

    const activeUsers = await tx.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: {
          include: {
            scores: {
              orderBy: { datePlayed: 'desc' },
              take: 5,
            }
          }
        }
      }
    })

    draw = await tx.draw.upsert({
      where: { month_year: { month, year } },
      update: {
        winningNumbers,
        prizePool,
        algorithm,
        status: publish ? 'PUBLISHED' : 'SIMULATED',
        publishedAt: publish ? new Date() : null,
      },
      create: {
        month,
        year,
        winningNumbers,
        prizePool,
        algorithm,
        status: publish ? 'PUBLISHED' : 'SIMULATED',
        publishedAt: publish ? new Date() : null,
      }
    })

    if (!publish) {
      await tx.drawEntry.deleteMany({ where: { drawId: draw.id } })
      await tx.drawResult.deleteMany({ where: { drawId: draw.id } })
    }

    const results = {
      FIVE_MATCH: [] as string[],
      FOUR_MATCH: [] as string[],
      THREE_MATCH: [] as string[],
    }

    // BATCH COLLECTION (instead of sequential writes)
    const entries: any[] = []

    for (const sub of activeUsers) {
      const userScores = sub.user.scores.map(s => s.score)
      if (userScores.length < 5) continue

      const matches = countMatches(userScores, winningNumbers)

      if (publish && draw?.status === 'PUBLISHED') {
        throw new Error('Draw already published')
      }

      // Collect entries instead of writing immediately
      entries.push({
        drawId: draw.id,
        userId: sub.userId,
        scores: userScores,
      })

      if (matches >= 3) {
        const matchType =
          matches === 5 ? 'FIVE_MATCH' :
          matches === 4 ? 'FOUR_MATCH' :
          'THREE_MATCH'

        results[matchType].push(sub.userId)
      }
    }

    // BULK INSERT
    if (entries.length > 0) {
      await tx.drawEntry.createMany({ data: entries })
    }

    let jackpotCarryOver = 0
    const fiveMatchPool = prizePool * PRIZE_DISTRIBUTION.FIVE_MATCH
    const fourMatchPool = prizePool * PRIZE_DISTRIBUTION.FOUR_MATCH
    const threeMatchPool = prizePool * PRIZE_DISTRIBUTION.THREE_MATCH

    // 5 match
    if (results.FIVE_MATCH.length === 0) {
      jackpotCarryOver = fiveMatchPool
    } else {
      const prize = fiveMatchPool / results.FIVE_MATCH.length
      for (const userId of results.FIVE_MATCH) {
        const result = await tx.drawResult.create({
          data: { drawId: draw.id, userId, matchType: 'FIVE_MATCH', prizeAmount: prize }
        })
        if (publish) {
          await tx.winner.create({
            data: { drawResultId: result.id, userId }
          })
        }
      }
    }

    // 4 match
    if (results.FOUR_MATCH.length > 0) {
      const prize = fourMatchPool / results.FOUR_MATCH.length
      for (const userId of results.FOUR_MATCH) {
        const result = await tx.drawResult.create({
          data: { drawId: draw.id, userId, matchType: 'FOUR_MATCH', prizeAmount: prize }
        })
        if (publish) {
          await tx.winner.create({
            data: { drawResultId: result.id, userId }
          })
        }
      }
    }

    // 3 match
    if (results.THREE_MATCH.length > 0) {
      const prize = threeMatchPool / results.THREE_MATCH.length
      for (const userId of results.THREE_MATCH) {
        const result = await tx.drawResult.create({
          data: { drawId: draw.id, userId, matchType: 'THREE_MATCH', prizeAmount: prize }
        })
        if (publish) {
          await tx.winner.create({
            data: { drawResultId: result.id, userId }
          })
        }
      }
    }

    await tx.draw.update({
      where: { id: draw.id },
      data: { jackpotCarryOver }
    })

    return {
      draw,
      winningNumbers,
      prizePool,
      results,
      jackpotCarryOver,
    }

  })
}

export const getDrawResults = async (month: number, year: number) => {
  return prisma.draw.findUnique({
    where: { month_year: { month, year } },
    include: {
      results: {
        include: {
          winner: true,
        }
      },
      entries: true,
    }
  })
}

export const getAllDraws = async (includeAll: boolean = false) => {
  return prisma.draw.findMany({
    where: includeAll ? undefined : { status: 'PUBLISHED' },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: { _count: { select: { entries: true, results: true } } },
  })
}

export const ensureActiveSubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  if (!subscription || subscription.status !== 'ACTIVE') {
    throw new Error('Active subscription required')
  }
}

export const getDrawResultsService = async (
  userId: string,
  role: string,
  month: number,
  year: number
) => {
  if (role !== 'ADMIN') {
    await ensureActiveSubscription(userId)
  }

  return await getDrawResults(month, year)
}
export const getAllDrawsService = async (
  userId: string,
  role: string
) => {
  const isAdmin = role === 'ADMIN'

  if (!isAdmin) {
    await ensureActiveSubscription(userId)
  }

  return await getAllDraws(isAdmin)
}