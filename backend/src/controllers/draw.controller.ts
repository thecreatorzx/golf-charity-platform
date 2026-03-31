import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import {
  runDraw,
  getDrawResultsService,
  getAllDrawsService,
} from '../services/draw.service'

// Simulate draw
export const simulateDraw = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year, algorithm } = req.body

    const result = await runDraw(
      Number(month),
      Number(year),
      algorithm || 'RANDOM',
      false
    )

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

// Publish draw
export const publishDraw = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year, algorithm } = req.body

    const result = await runDraw(
      Number(month),
      Number(year),
      algorithm || 'RANDOM',
      true
    )

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

// Fetch draw results
export const fetchDrawResults = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.params

    const results = await getDrawResultsService(
      req.userId!,
      req.userRole!,
      Number(month),
      Number(year)
    )

    res.json({ results })
  } catch (error: any) {
    res.status(error.message === 'Active subscription required' ? 403 : 500)
      .json({ message: error.message || 'Server error' })
  }
}

// Fetch all draws
export const fetchAllDraws = async (req: AuthRequest, res: Response) => {
  try {
    const draws = await getAllDrawsService(
      req.userId!,
      req.userRole!
    )

    res.json({ draws })
  } catch (error: any) {
    res.status(error.message === 'Active subscription required' ? 403 : 500)
      .json({ message: error.message || 'Server error' })
  }
}