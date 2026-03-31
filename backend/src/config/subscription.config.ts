// config/subscription.config.ts
export const SUBSCRIPTION_CONFIG = {
  MONTHLY_PRICE: Number(process.env.MONTHLY_PRICE || 999),
  YEARLY_PRICE: Number(process.env.YEARLY_PRICE || 8999),
}