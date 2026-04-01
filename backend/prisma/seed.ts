import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Seed admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@golfcharity.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@golfcharity.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin created')

  // ✅ Seed test player
  const playerPassword = await bcrypt.hash('user123', 12)
  const player = await prisma.user.upsert({
    where: { email: 'player@test.com' },
    update: {},
    create: {
      name: 'Test Player',
      email: 'player@test.com',
      password: playerPassword,
      role: 'SUBSCRIBER',
    },
  })
  console.log('✅ Test user created')

  // Seed charities
  await prisma.charity.createMany({
    data: [
      {
        name: 'Green Earth Foundation',
        description: 'Dedicated to environmental conservation through golf events.',
        featured: true,
        website: 'https://greenearth.org',
      },
      {
        name: 'Children First Trust',
        description: 'Supporting underprivileged children through sports education.',
        featured: false,
        website: 'https://childrenfirst.org',
      },
      {
        name: 'Veterans Golf Initiative',
        description: 'Using golf therapy to support military veterans.',
        featured: false,
        website: 'https://veteransgolf.org',
      },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Charities seeded')

  // ✅ Create test draw
  const draw = await prisma.draw.upsert({
    where: {
      month_year: { month: 1, year: 2026 },
    },
    update: {},
    create: {
      month: 1,
      year: 2026,
      winningNumbers: [5, 12, 18, 27, 33],
      prizePool: 10000,
      algorithm: 'RANDOM',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      jackpotCarryOver: 0,
    },
  })
  console.log('✅ Test draw created')

  // ✅ Create draw result
  const drawResult = await prisma.drawResult.create({
    data: {
      drawId: draw.id,
      userId: player.id,
      matchType: 'THREE_MATCH',
      prizeAmount: 500,
    },
  })
  console.log('✅ Draw result created')

  // ✅ Create winner
  await prisma.winner.create({
    data: {
      drawResultId: drawResult.id,
      userId: player.id,
    },
  })
  console.log('✅ Winner created')

  console.log('\n🎯 Test Credentials:')
  console.log('Admin → admin@golfcharity.com / admin123')
  console.log('User  → player@test.com / user123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())