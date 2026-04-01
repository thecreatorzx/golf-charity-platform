import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

let prismaInstance = global.prisma || new PrismaClient({ adapter })

export const prisma = prismaInstance

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaInstance
}