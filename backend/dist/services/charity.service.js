"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCharity = exports.setUserCharity = exports.deleteCharity = exports.updateCharity = exports.createCharity = exports.getCharityById = exports.getAllCharities = void 0;
const prisma_1 = require("../lib/prisma");
const getAllCharities = async (search) => {
    return prisma_1.prisma.charity.findMany({
        where: search
            ? { name: { contains: search, mode: 'insensitive' } }
            : undefined,
        orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    });
};
exports.getAllCharities = getAllCharities;
const getCharityById = async (id) => {
    return prisma_1.prisma.charity.findUnique({ where: { id } });
};
exports.getCharityById = getCharityById;
const createCharity = async (data) => {
    return prisma_1.prisma.charity.create({ data });
};
exports.createCharity = createCharity;
const updateCharity = async (id, data) => {
    return prisma_1.prisma.charity.update({ where: { id }, data });
};
exports.updateCharity = updateCharity;
const deleteCharity = async (id) => {
    return prisma_1.prisma.charity.delete({ where: { id } });
};
exports.deleteCharity = deleteCharity;
const setUserCharity = async (userId, charityId, percentage) => {
    const MIN = Number(process.env.MIN_CHARITY_PERCENT || 10);
    const MAX = Number(process.env.MAX_CHARITY_PERCENT || 100);
    if (percentage < MIN)
        throw new Error(`Minimum contribution is ${MIN}%`);
    if (percentage > MAX)
        throw new Error(`Maximum is ${MAX}%`);
    return prisma_1.prisma.charityContribution.upsert({
        where: { userId },
        update: { charityId, percentage },
        create: { userId, charityId, percentage },
    });
};
exports.setUserCharity = setUserCharity;
const getUserCharity = async (userId) => {
    return prisma_1.prisma.charityContribution.findUnique({
        where: { userId },
        include: { charity: true },
    });
};
exports.getUserCharity = getUserCharity;
