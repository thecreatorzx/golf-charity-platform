import { prisma } from "../lib/prisma.js";

const PRIZE_POOL_PCT = Number(process.env.PRIZE_POOL_PERCENTAGE || 0.6);
const FIVE_MATCH_PCT = Number(process.env.FIVE_MATCH_PERCENT || 0.4);
const FOUR_MATCH_PCT = Number(process.env.FOUR_MATCH_PERCENT || 0.35);
const THREE_MATCH_PCT = Number(process.env.THREE_MATCH_PERCENT || 0.25);
const MONTHLY_PRICE = Number(process.env.MONTHLY_PRICE || 999);
const YEARLY_PRICE = Number(process.env.YEARLY_PRICE || 8999);

// Generate 5 unique random numbers between 1–45
export const generateRandomNumbers = () => {
  const numbers = [];
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) numbers.push(num);
  }
  return numbers.sort((a, b) => a - b);
};

// Weighted generation based on most frequent user scores
export const generateWeightedNumbers = async () => {
  const scores = await prisma.golfScore.findMany({
    select: { score: true },
  });

  const freq = {};
  scores.forEach(({ score }) => {
    freq[score] = (freq[score] || 0) + 1;
  });

  const pool = [];
  Object.entries(freq).forEach(([score, count]) => {
    const weight = Math.ceil(Math.log(Number(count) + 1));
    for (let i = 0; i < weight; i++) pool.push(Number(score));
  });

  if (pool.length < 5) return generateRandomNumbers();

  const selected = [];
  const poolCopy = [...pool];
  while (selected.length < 5) {
    const idx = Math.floor(Math.random() * poolCopy.length);
    const num = poolCopy[idx];
    if (!selected.includes(num)) selected.push(num);
  }

  return selected.sort((a, b) => a - b);
};

const countMatches = (userScores, winningNumbers) =>
  userScores.filter((s) => winningNumbers.includes(s)).length;

// ✅ Fix: receives tx so it's transactionally consistent
export const calculatePrizePool = async (tx, carryOver = 0) => {
  const activeSubscriptions = await tx.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { plan: true },
  });

  const total = activeSubscriptions.reduce((sum, sub) => {
    return sum + (sub.plan === "MONTHLY" ? MONTHLY_PRICE : YEARLY_PRICE);
  }, 0);

  return total * PRIZE_POOL_PCT + carryOver;
};

export const runDraw = async (
  month,
  year,
  algorithm = "RANDOM",
  publish = false,
) => {
  return await prisma.$transaction(async (tx) => {
    let draw = await tx.draw.findUnique({
      where: {
        month_year: {
          month: Number(month),
          year: Number(year),
        },
      },
    });
    if (!draw) {
      return {
        draw: null,
        winningNumbers: [],
        prizePool: 0,
        results: [],
        jackpotCarryOver: 0,
      };
    }

    // Early return if already published
    if (draw?.status === "PUBLISHED") {
      return {
        draw,
        winningNumbers: draw.winningNumbers,
        prizePool: draw.prizePool,
        results: await tx.drawResult.findMany({ where: { drawId: draw.id } }),
        jackpotCarryOver: draw.jackpotCarryOver,
      };
    }

    let winningNumbers = draw?.winningNumbers;
    if (!winningNumbers || winningNumbers.length === 0) {
      winningNumbers =
        algorithm === "WEIGHTED"
          ? await generateWeightedNumbers()
          : generateRandomNumbers();
    }

    // ✅ Fix: pass tx into calculatePrizePool
    const prizePool = await calculatePrizePool(tx, draw?.jackpotCarryOver || 0);

    const activeUsers = await tx.subscription.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: {
          include: {
            scores: { orderBy: { datePlayed: "desc" }, take: 5 },
          },
        },
      },
    });

    draw = await tx.draw.upsert({
      where: {
        month_year: {
          month: Number(month),
          year: Number(year),
        },
      },
      update: {
        winningNumbers,
        prizePool,
        algorithm,
        status: publish ? "PUBLISHED" : "SIMULATED",
        publishedAt: publish ? new Date() : null,
      },
      create: {
        month,
        year,
        winningNumbers,
        prizePool,
        algorithm,
        status: publish ? "PUBLISHED" : "SIMULATED",
        publishedAt: publish ? new Date() : null,
      },
    });

    // On re-simulation, clear old entries/results
    if (!publish) {
      await tx.drawEntry.deleteMany({ where: { drawId: draw.id } });
      await tx.drawResult.deleteMany({ where: { drawId: draw.id } });
    }

    const matches = { FIVE_MATCH: [], FOUR_MATCH: [], THREE_MATCH: [] };
    const entries = [];

    for (const sub of activeUsers) {
      const userScores = sub.user.scores.map((s) => s.score);
      if (userScores.length < 5) continue;

      entries.push({ drawId: draw.id, userId: sub.userId, scores: userScores });

      const matchCount = countMatches(userScores, winningNumbers);
      if (matchCount >= 3) {
        const matchType =
          matchCount === 5
            ? "FIVE_MATCH"
            : matchCount === 4
              ? "FOUR_MATCH"
              : "THREE_MATCH";
        matches[matchType].push(sub.userId);
      }
    }

    if (entries.length > 0) {
      await tx.drawEntry.createMany({ data: entries });
    }

    let jackpotCarryOver = 0;
    const fiveMatchPool = prizePool * FIVE_MATCH_PCT;
    const fourMatchPool = prizePool * FOUR_MATCH_PCT;
    const threeMatchPool = prizePool * THREE_MATCH_PCT;

    // 5 match
    if (matches.FIVE_MATCH.length === 0) {
      jackpotCarryOver = fiveMatchPool;
    } else {
      const prize = fiveMatchPool / matches.FIVE_MATCH.length;
      for (const userId of matches.FIVE_MATCH) {
        const result = await tx.drawResult.create({
          data: {
            drawId: draw.id,
            userId,
            matchType: "FIVE_MATCH",
            prizeAmount: prize,
          },
        });
        if (publish) {
          await tx.winner.create({ data: { drawResultId: result.id, userId } });
        }
      }
    }

    // 4 match
    if (matches.FOUR_MATCH.length > 0) {
      const prize = fourMatchPool / matches.FOUR_MATCH.length;
      for (const userId of matches.FOUR_MATCH) {
        const result = await tx.drawResult.create({
          data: {
            drawId: draw.id,
            userId,
            matchType: "FOUR_MATCH",
            prizeAmount: prize,
          },
        });
        if (publish) {
          await tx.winner.create({ data: { drawResultId: result.id, userId } });
        }
      }
    }

    // 3 match
    if (matches.THREE_MATCH.length > 0) {
      const prize = threeMatchPool / matches.THREE_MATCH.length;
      for (const userId of matches.THREE_MATCH) {
        const result = await tx.drawResult.create({
          data: {
            drawId: draw.id,
            userId,
            matchType: "THREE_MATCH",
            prizeAmount: prize,
          },
        });
        if (publish) {
          await tx.winner.create({ data: { drawResultId: result.id, userId } });
        }
      }
    }

    await tx.draw.update({
      where: { id: draw.id },
      data: { jackpotCarryOver },
    });

    const formattedMatches = await Promise.all(
      ["FIVE_MATCH", "FOUR_MATCH", "THREE_MATCH"].map(async (matchType) => {
        const userIds = matches[matchType];
        const pool =
          matchType === "FIVE_MATCH"
            ? fiveMatchPool
            : matchType === "FOUR_MATCH"
              ? fourMatchPool
              : threeMatchPool;

        const users =
          userIds.length > 0
            ? await tx.user.findMany({
                where: { id: { in: userIds } },
                select: { name: true, email: true },
              })
            : [];

        return {
          matchType,
          users,
          prizeAmount: userIds.length > 0 ? pool / userIds.length : 0,
        };
      }),
    );

    return {
      draw,
      winningNumbers,
      prizePool,
      results: matches,
      matches: formattedMatches,
      jackpotCarryOver,
    };
  });
};

export const getDrawResults = async (month, year) => {
  if (!Number.isInteger(month) || !Number.isInteger(year)) {
    throw new Error("Invalid DB query parameters");
  }

  return prisma.draw.findUnique({
    where: {
      month_year: {
        month,
        year,
      },
    },
    include: {
      results: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          winner: true,
        },
      },
      entries: true,
    },
  });
};

export const getAllDraws = async (includeAll = false) => {
  return prisma.draw.findMany({
    where: includeAll ? undefined : { status: "PUBLISHED" },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { _count: { select: { entries: true, results: true } } },
  });
};

export const ensureActiveSubscription = async (userId) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });
  if (!subscription || subscription.status !== "ACTIVE") {
    throw new Error("Active subscription required");
  }
};

export const getDrawResultsService = async (userId, role, month, year) => {
  const m = Number(month);
  const y = Number(year);

  if (!Number.isInteger(m) || !Number.isInteger(y)) {
    throw new Error("Invalid month/year");
  }

  if (role !== "ADMIN") await ensureActiveSubscription(userId);

  return await getDrawResults(m, y);
};

export const getAllDrawsService = async (userId, role) => {
  const isAdmin = role === "ADMIN";
  if (!isAdmin) await ensureActiveSubscription(userId);
  return await getAllDraws(isAdmin);
};
