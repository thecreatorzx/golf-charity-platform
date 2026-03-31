import { prisma } from '../lib/prisma'

export const getAllCharities = async (search?: string) => {
  return prisma.charity.findMany({
    where: search
      ? { name: { contains: search, mode: 'insensitive' } }
      : undefined,
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
  })
}

export const getCharityById = async (id: string) => {
  return prisma.charity.findUnique({ where: { id } })
}

export const createCharity = async (data: {
  name: string
  description: string
  imageUrl?: string
  website?: string
  featured?: boolean
}) => {
  return prisma.charity.create({ data })
}

export const updateCharity = async (id: string, data: Partial<{
  name: string
  description: string
  imageUrl: string
  website: string
  featured: boolean
}>) => {
  return prisma.charity.update({ where: { id }, data })
}

export const deleteCharity = async (id: string) => {
  return prisma.charity.delete({ where: { id } })
}

export const setUserCharity = async (
  userId: string,
  charityId: string,
  percentage: number
) => {
const MIN = Number(process.env.MIN_CHARITY_PERCENT || 10)
const MAX = Number(process.env.MAX_CHARITY_PERCENT || 100)

if (percentage < MIN) throw new Error(`Minimum contribution is ${MIN}%`)
if (percentage > MAX) throw new Error(`Maximum is ${MAX}%`)

  return prisma.charityContribution.upsert({
    where: { userId },
    update: { charityId, percentage },
    create: { userId, charityId, percentage },
  })
}

export const getUserCharity = async (userId: string) => {
  return prisma.charityContribution.findUnique({
    where: { userId },
    include: { charity: true },
  })
}