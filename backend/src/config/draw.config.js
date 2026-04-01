export const DRAW_CONFIG = {
  PRIZE_DISTRIBUTION: {
    FIVE_MATCH: Number(process.env.FIVE_MATCH_PERCENT || 0.4),
    FOUR_MATCH: Number(process.env.FOUR_MATCH_PERCENT || 0.35),
    THREE_MATCH: Number(process.env.THREE_MATCH_PERCENT || 0.25),
  },

  SUBSCRIPTION_PRICES: {
    MONTHLY: Number(process.env.MONTHLY_SUB_PRICE || 999),
    YEARLY: Number(process.env.YEARLY_SUB_PRICE || 8999) / 12,
  },

  PRIZE_POOL_PERCENTAGE: Number(process.env.PRIZE_POOL_PERCENTAGE || 0.6),
}