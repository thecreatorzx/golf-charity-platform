import { prisma } from "../lib/prisma.js";

const MAX_SCORES = Number(process.env.MAX_SCORES || 5); // ✅ was 10
const MIN_SCORE = Number(process.env.MIN_SCORE || 1);
const MAX_SCORE = Number(process.env.MAX_SCORE || 45); // ✅ was hardcoded

export const upsertScore = async (userId, score, datePlayed) => {
  if (score < MIN_SCORE || score > MAX_SCORE) {
    throw new Error(`Score must be between ${MIN_SCORE} and ${MAX_SCORE}`);
  }

  const existingScores = await prisma.golfScore.findMany({
    where: { userId },
    orderBy: { datePlayed: "asc" },
  });

  if (existingScores.length >= MAX_SCORES) {
    await prisma.golfScore.delete({ where: { id: existingScores[0].id } });
  }

  return prisma.golfScore.create({
    data: { userId, score, datePlayed },
  });
};

export const getUserScores = async (userId) => {
  return prisma.golfScore.findMany({
    where: { userId },
    orderBy: { datePlayed: "desc" },
  });
};

export const deleteScore = async (scoreId, userId) => {
  return prisma.golfScore.delete({
    where: { id: scoreId, userId },
  });
};
