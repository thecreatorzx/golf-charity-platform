"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedDraws = exports.uploadWinnerProof = exports.updateProfile = exports.getDashboard = void 0;
const prisma_1 = require("../lib/prisma");
const subscription_service_1 = require("../services/subscription.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Dashboard
const getDashboard = async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                name: true,
                email: true,
                subscription: true,
                scores: {
                    orderBy: { datePlayed: 'desc' },
                    take: 5,
                },
                charityContribution: {
                    include: { charity: true },
                },
                winners: {
                    include: {
                        drawResult: {
                            include: {
                                draw: { select: { month: true, year: true } },
                            },
                        },
                    },
                },
                drawEntries: {
                    include: {
                        draw: { select: { month: true, year: true, status: true } },
                    },
                    orderBy: { draw: { year: 'desc' } },
                    take: 6,
                },
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const charityAmount = user.charityContribution && user.subscription
            ? (0, subscription_service_1.calculateCharityAmount)(user.subscription.plan, user.charityContribution.percentage)
            : 0;
        res.json({ user, charityAmount });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDashboard = getDashboard;
// Update Profile
const updateProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.userId },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password required' });
            }
            const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!valid) {
                return res.status(401).json({ message: 'Current password incorrect' });
            }
            updateData.password = await bcryptjs_1.default.hash(newPassword, 12);
        }
        const updated = await prisma_1.prisma.user.update({
            where: { id: req.userId },
            data: updateData,
            select: { id: true, name: true, email: true, role: true },
        });
        res.json({ user: updated });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
// Upload Winner Proof
const uploadWinnerProof = async (req, res) => {
    try {
        const { winnerId } = req.params;
        const { proofUrl } = req.body;
        if (!proofUrl) {
            return res.status(400).json({ message: 'Proof URL required' });
        }
        const winner = await prisma_1.prisma.winner.findUnique({
            where: { id: winnerId },
        });
        if (!winner || winner.userId !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updated = await prisma_1.prisma.winner.update({
            where: { id: winnerId },
            data: { proofUrl },
        });
        res.json({ winner: updated });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.uploadWinnerProof = uploadWinnerProof;
// Get Published Draws
const getPublishedDraws = async (_req, res) => {
    try {
        const draws = await prisma_1.prisma.draw.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            include: {
                results: {
                    include: {
                        winner: true,
                    },
                },
                _count: { select: { entries: true } },
            },
        });
        res.json({ draws });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPublishedDraws = getPublishedDraws;
