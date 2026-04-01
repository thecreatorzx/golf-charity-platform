import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { upsertScore, getUserScores, deleteScore } from '../services/score.service.js'

export const addScore = async (req: AuthRequest, res: Response) => {
  try {
    const { score, datePlayed } = req.body
    

    if (!score || !datePlayed) {
      res.status(400).json({ message: 'Score and date are required' })
      return
    }

    const newScore = await upsertScore(
      req.userId!,
      Number(score),
      new Date(datePlayed)
    )

    res.status(201).json({ score: newScore })
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Server error' })
  }
}

export const getScores = async (req: AuthRequest, res: Response) => {
  try {
    const scores = await getUserScores(req.userId!)
    res.json({ scores })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const removeScore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    await deleteScore(id as string, req.userId!)
    res.json({ message: 'Score deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}