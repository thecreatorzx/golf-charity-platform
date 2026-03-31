"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDrawsService = exports.getDrawResultsService = exports.ensureActiveSubscription = exports.getAllDraws = exports.getDrawResults = exports.runDraw = exports.calculatePrizePool = exports.generateWeightedNumbers = exports.generateRandomNumbers = void 0;
const prisma_1 = require("../lib/prisma");
const draw_config_1 = require("../config/draw.config");
const { PRIZE_DISTRIBUTION, SUBSCRIPTION_PRICES, PRIZE_POOL_PERCENTAGE } = draw_config_1.DRAW_CONFIG;
// Generate 5 random winning numbers between 1-45
const generateRandomNumbers = () => {
    const numbers = [];
    while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num))
            numbers.push(num);
    }
    return numbers.sort((a, b) => a - b);
};
exports.generateRandomNumbers = generateRandomNumbers;
// Weighted generation based on most frequent user scores
const generateWeightedNumbers = async () => {
    const scores = await prisma_1.prisma.golfScore.findMany({
        select: { score: true }
    });
    const freq = {};
    scores.forEach(({ score }) => {
        freq[score] = (freq[score] || 0) + 1;
    });
    const pool = [];
    Object.entries(freq).forEach(([score, count]) => {
        const weight = Math.ceil(Math.log(count + 1)); // log scaling
        for (let i = 0; i < weight; i++)
            pool.push(Number(score));
    });
    if (pool.length < 5)
        return (0, exports.generateRandomNumbers)();
    const selected = [];
    const poolCopy = [...pool];
    while (selected.length < 5) {
        const idx = Math.floor(Math.random() * poolCopy.length);
        const num = poolCopy[idx];
        if (!selected.includes(num))
            selected.push(num);
    }
    return selected.sort((a, b) => a - b);
};
exports.generateWeightedNumbers = generateWeightedNumbers;
// Count how many numbers match
const countMatches = (userScores, winningNumbers) => {
    return userScores.filter(s => winningNumbers.includes(s)).length;
};
// Calculate prize pool from active subscribers
const calculatePrizePool = async (carryOver = 0) => {
    const activeSubscriptions = await prisma_1.prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        select: { plan: true }
    });
    const total = activeSubscriptions.reduce((sum, sub) => {
        return sum + SUBSCRIPTION_PRICES[sub.plan];
    }, 0);
    return (total * PRIZE_POOL_PERCENTAGE) + carryOver;
};
exports.calculatePrizePool = calculatePrizePool;
// Run draw simulation or publish
const runDraw = async (month, year, algorithm = 'RANDOM', publish = false) => {
    return await prisma_1.prisma.$transaction(async (tx) => {
        let draw = await tx.draw.findUnique({ where: { month_year: { month, year } } });
        if (draw?.status === 'PUBLISHED') {
            return {
                draw,
                winningNumbers: draw.winningNumbers,
                prizePool: draw.prizePool,
                results: await tx.drawResult.findMany({
                    where: { drawId: draw.id }
                }),
                jackpotCarryOver: draw.jackpotCarryOver
            };
        }
        let winningNumbers = draw?.winningNumbers;
        if (!winningNumbers || winningNumbers.length === 0) {
            winningNumbers = algorithm === 'WEIGHTED'
                ? await (0, exports.generateWeightedNumbers)()
                : (0, exports.generateRandomNumbers)();
        }
        const prizePool = await (0, exports.calculatePrizePool)(draw?.jackpotCarryOver || 0);
        const activeUsers = await tx.subscription.findMany({
            where: { status: 'ACTIVE' },
            include: {
                user: {
                    include: {
                        scores: {
                            orderBy: { datePlayed: 'desc' },
                            take: 5,
                        }
                    }
                }
            }
        });
        draw = await tx.draw.upsert({
            where: { month_year: { month, year } },
            update: {
                winningNumbers,
                prizePool,
                algorithm,
                status: publish ? 'PUBLISHED' : 'SIMULATED',
                publishedAt: publish ? new Date() : null,
            },
            create: {
                month,
                year,
                winningNumbers,
                prizePool,
                algorithm,
                status: publish ? 'PUBLISHED' : 'SIMULATED',
                publishedAt: publish ? new Date() : null,
            }
        });
        if (!publish) {
            await tx.drawEntry.deleteMany({ where: { drawId: draw.id } });
            await tx.drawResult.deleteMany({ where: { drawId: draw.id } });
        }
        const results = {
            FIVE_MATCH: [],
            FOUR_MATCH: [],
            THREE_MATCH: [],
        };
        // BATCH COLLECTION (instead of sequential writes)
        const entries = [];
        for (const sub of activeUsers) {
            const userScores = sub.user.scores.map(s => s.score);
            if (userScores.length < 5)
                continue;
            const matches = countMatches(userScores, winningNumbers);
            if (publish && draw?.status === 'PUBLISHED') {
                throw new Error('Draw already published');
            }
            // Collect entries instead of writing immediately
            entries.push({
                drawId: draw.id,
                userId: sub.userId,
                scores: userScores,
            });
            if (matches >= 3) {
                const matchType = matches === 5 ? 'FIVE_MATCH' :
                    matches === 4 ? 'FOUR_MATCH' :
                        'THREE_MATCH';
                results[matchType].push(sub.userId);
            }
        }
        // BULK INSERT
        if (entries.length > 0) {
            await tx.drawEntry.createMany({ data: entries });
        }
        let jackpotCarryOver = 0;
        const fiveMatchPool = prizePool * PRIZE_DISTRIBUTION.FIVE_MATCH;
        const fourMatchPool = prizePool * PRIZE_DISTRIBUTION.FOUR_MATCH;
        const threeMatchPool = prizePool * PRIZE_DISTRIBUTION.THREE_MATCH;
        // 5 match
        if (results.FIVE_MATCH.length === 0) {
            jackpotCarryOver = fiveMatchPool;
        }
        else {
            const prize = fiveMatchPool / results.FIVE_MATCH.length;
            for (const userId of results.FIVE_MATCH) {
                const result = await tx.drawResult.create({
                    data: { drawId: draw.id, userId, matchType: 'FIVE_MATCH', prizeAmount: prize }
                });
                if (publish) {
                    await tx.winner.create({
                        data: { drawResultId: result.id, userId }
                    });
                }
            }
        }
        // 4 match
        if (results.FOUR_MATCH.length > 0) {
            const prize = fourMatchPool / results.FOUR_MATCH.length;
            for (const userId of results.FOUR_MATCH) {
                const result = await tx.drawResult.create({
                    data: { drawId: draw.id, userId, matchType: 'FOUR_MATCH', prizeAmount: prize }
                });
                if (publish) {
                    await tx.winner.create({
                        data: { drawResultId: result.id, userId }
                    });
                }
            }
        }
        // 3 match
        if (results.THREE_MATCH.length > 0) {
            const prize = threeMatchPool / results.THREE_MATCH.length;
            for (const userId of results.THREE_MATCH) {
                const result = await tx.drawResult.create({
                    data: { drawId: draw.id, userId, matchType: 'THREE_MATCH', prizeAmount: prize }
                });
                if (publish) {
                    await tx.winner.create({
                        data: { drawResultId: result.id, userId }
                    });
                }
            }
        }
        await tx.draw.update({
            where: { id: draw.id },
            data: { jackpotCarryOver }
        });
        return {
            draw,
            winningNumbers,
            prizePool,
            results,
            jackpotCarryOver,
        };
    });
};
exports.runDraw = runDraw;
const getDrawResults = async (month, year) => {
    return prisma_1.prisma.draw.findUnique({
        where: { month_year: { month, year } },
        include: {
            results: {
                include: {
                    winner: true,
                }
            },
            entries: true,
        }
    });
};
exports.getDrawResults = getDrawResults;
const getAllDraws = async (includeAll = false) => {
    return prisma_1.prisma.draw.findMany({
        where: includeAll ? undefined : { status: 'PUBLISHED' },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: { _count: { select: { entries: true, results: true } } },
    });
};
exports.getAllDraws = getAllDraws;
const ensureActiveSubscription = async (userId) => {
    const subscription = await prisma_1.prisma.subscription.findUnique({
        where: { userId }
    });
    if (!subscription || subscription.status !== 'ACTIVE') {
        throw new Error('Active subscription required');
    }
};
exports.ensureActiveSubscription = ensureActiveSubscription;
const getDrawResultsService = async (userId, role, month, year) => {
    if (role !== 'ADMIN') {
        await (0, exports.ensureActiveSubscription)(userId);
    }
    return await (0, exports.getDrawResults)(month, year);
};
exports.getDrawResultsService = getDrawResultsService;
const getAllDrawsService = async (userId, role) => {
    const isAdmin = role === 'ADMIN';
    if (!isAdmin) {
        await (0, exports.ensureActiveSubscription)(userId);
    }
    return await (0, exports.getAllDraws)(isAdmin);
};
exports.getAllDrawsService = getAllDrawsService;
