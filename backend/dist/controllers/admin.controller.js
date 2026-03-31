"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.markWinnerPaid = exports.verifyWinner = exports.getAllWinners = exports.adminDeleteScore = exports.adminEditScore = exports.updateUserSubscription = exports.getAllUsers = void 0;
const prisma_1 = require("../lib/prisma");
// ─── USERS ───────────────────────────────────────────────
const getAllUsers = async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                subscription: true,
                scores: { orderBy: { datePlayed: 'desc' }, take: 5 },
                charityContribution: { include: { charity: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ users });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
const updateUserSubscription = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        const subscription = await prisma_1.prisma.subscription.update({
            where: { userId: userId },
            data: { status },
        });
        res.json({ subscription });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateUserSubscription = updateUserSubscription;
const adminEditScore = async (req, res) => {
    try {
        const { scoreId } = req.params;
        const { score, datePlayed } = req.body;
        const existing = await prisma_1.prisma.golfScore.findUnique({ where: { id: scoreId } });
        if (!existing) {
            res.status(404).json({ message: 'Score not found' });
            return;
        }
        const updated = await prisma_1.prisma.golfScore.update({
            where: { id: scoreId },
            data: { score: Number(score), datePlayed: new Date(datePlayed) },
        });
        res.json({ score: updated });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.adminEditScore = adminEditScore;
const adminDeleteScore = async (req, res) => {
    try {
        const { scoreId } = req.params;
        await prisma_1.prisma.golfScore.delete({ where: { id: scoreId } });
        res.json({ message: 'Score deleted' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.adminDeleteScore = adminDeleteScore;
// ─── WINNERS ─────────────────────────────────────────────
const getAllWinners = async (_req, res) => {
    try {
        const winners = await prisma_1.prisma.winner.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                drawResult: {
                    include: {
                        draw: { select: { month: true, year: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ winners });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllWinners = getAllWinners;
const verifyWinner = async (req, res) => {
    try {
        const { winnerId } = req.params;
        const { verificationStatus } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(verificationStatus)) {
            res.status(400).json({ message: 'Invalid verification status' });
            return;
        }
        const winner = await prisma_1.prisma.winner.update({
            where: { id: winnerId },
            data: { verificationStatus: verificationStatus },
        });
        res.json({ winner });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyWinner = verifyWinner;
const markWinnerPaid = async (req, res) => {
    try {
        const { winnerId } = req.params;
        const winner = await prisma_1.prisma.winner.update({
            where: { id: winnerId },
            data: { paymentStatus: 'PAID' },
        });
        res.json({ winner });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.markWinnerPaid = markWinnerPaid;
// ─── ANALYTICS ───────────────────────────────────────────
const getAnalytics = async (_req, res) => {
    try {
        const [totalUsers, activeSubscriptions, totalCharityContributions, totalDraws, totalWinners,] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            prisma_1.prisma.charityContribution.aggregate({ _sum: { percentage: true } }),
            prisma_1.prisma.draw.count(),
            prisma_1.prisma.winner.count(),
        ]);
        res.json({
            totalUsers,
            activeSubscriptions,
            totalCharityContributions: totalCharityContributions._sum.percentage || 0,
            totalDraws,
            totalWinners,
        });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAnalytics = getAnalytics;
