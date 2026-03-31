"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScore = exports.getUserScores = exports.upsertScore = void 0;
const prisma_1 = require("../lib/prisma");
const MAX_SCORES = process.env.MAX_SCORES ? Number(process.env.MAX_SCORES) : 10;
const MIN_SCORE = process.env.MIN_SCORE ? Number(process.env.MIN_SCORE) : 1;
const MAX_SCORE = 45;
const upsertScore = async (userId, score, datePlayed) => {
    if (score < MIN_SCORE || score > MAX_SCORE) {
        throw new Error('Score must be between 1 and 45');
    }
    // Get current scores ordered oldest first
    const existingScores = await prisma_1.prisma.golfScore.findMany({
        where: { userId },
        orderBy: { datePlayed: 'asc' },
    });
    // If already at max, delete the oldest
    if (existingScores.length >= MAX_SCORES) {
        await prisma_1.prisma.golfScore.delete({
            where: { id: existingScores[0].id },
        });
    }
    // Insert new score
    const newScore = await prisma_1.prisma.golfScore.create({
        data: { userId, score, datePlayed },
    });
    return newScore;
};
exports.upsertScore = upsertScore;
const getUserScores = async (userId) => {
    return prisma_1.prisma.golfScore.findMany({
        where: { userId },
        orderBy: { datePlayed: 'desc' }, // most recent first
    });
};
exports.getUserScores = getUserScores;
const deleteScore = async (scoreId, userId) => {
    return prisma_1.prisma.golfScore.delete({
        where: { id: scoreId, userId },
    });
};
exports.deleteScore = deleteScore;
