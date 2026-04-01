import { prisma } from '../lib/prisma.js'

const MAX_SCORES = process.env.MAX_SCORES ? Number(process.env.MAX_SCORES) : 10
const MIN_SCORE = process.env.MIN_SCORE ? Number(process.env.MIN_SCORE) : 1
const MAX_SCORE = 45

export const upsertScore = async (userId: string, score: number, datePlayed: Date) => {
  if (score < MIN_SCORE || score > MAX_SCORE) {
    throw new Error('Score must be between 1 and 45')
  }

  // Get current scores ordered oldest first
  const existingScores = await prisma.golfScore.findMany({
    where: { userId },
    orderBy: { datePlayed: 'asc' },
  })

  // If already at max, delete the oldest
  if (existingScores.length >= MAX_SCORES) {
    await prisma.golfScore.delete({
      where: { id: existingScores[0].id },
    })
  }

  // Insert new score
  const newScore = await prisma.golfScore.create({
    data: { userId, score, datePlayed },
  })

  return newScore
}

export const getUserScores = async (userId: string) => {
  return prisma.golfScore.findMany({
    where: { userId },
    orderBy: { datePlayed: 'desc' }, // most recent first
  })
}

export const deleteScore = async (scoreId: string, userId: string) => {
  return prisma.golfScore.delete({
    where: { id: scoreId, userId },
  })
}