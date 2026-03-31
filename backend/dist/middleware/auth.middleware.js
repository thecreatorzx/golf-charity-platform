"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireScores = exports.requireSubscription = exports.authorizeAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const authenticate = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const authorizeAdmin = (req, res, next) => {
    if (req.userRole !== 'ADMIN') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
const requireSubscription = async (req, res, next) => {
    try {
        const subscription = await prisma_1.prisma.subscription.findUnique({
            where: { userId: req.userId },
        });
        // Auto-lapse expired subscriptions in real-time
        if (subscription && subscription.status === 'ACTIVE' && subscription.currentPeriodEnd) {
            if (new Date() > subscription.currentPeriodEnd) {
                await prisma_1.prisma.subscription.update({
                    where: { userId: req.userId },
                    data: { status: 'LAPSED' },
                });
                res.status(403).json({ message: 'Subscription expired' });
                return;
            }
        }
        if (!subscription || subscription.status !== 'ACTIVE') {
            res.status(403).json({ message: 'Active subscription required' });
            return;
        }
        next();
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.requireSubscription = requireSubscription;
const requireScores = async (req, res, next) => {
    try {
        const scoreCount = await prisma_1.prisma.golfScore.count({
            where: { userId: req.userId },
        });
        if (scoreCount === 0) {
            res.status(403).json({ message: 'You must enter at least one score to participate in draws' });
            return;
        }
        next();
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.requireScores = requireScores;
