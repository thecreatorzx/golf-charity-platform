import { upsertScore, getUserScores, deleteScore } from '../services/score.service.js'

export const addScore = async (req, res) => {
  try {
    const { score, datePlayed } = req.body
    

    if (!score || !datePlayed) {
      res.status(400).json({ message: 'Score and date are required' })
      return
    }

    const newScore = await upsertScore(
      req.userId,
      Number(score),
      new Date(datePlayed)
    )

    res.status(201).json({ score: newScore })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Server error' })
  }
}

export const getScores = async (req, res) => {
  try {
    const scores = await getUserScores(req.userId)
    res.json({ scores })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const removeScore = async (req, res) => {
  try {
    const { id } = req.params
    await deleteScore(id, req.userId)
    res.json({ message: 'Score deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}