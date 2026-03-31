"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockActivateSubscription = exports.cancelSubscription = exports.calculateCharityAmount = exports.getSubscription = exports.verifyAndActivate = exports.createOrder = exports.razorpay = void 0;
const prisma_1 = require("../lib/prisma");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
exports.razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const PLANS = {
    MONTHLY: {
        amount: Number(process.env.RAZORPAY_MONTHLY_AMOUNT || 99900),
        price: Number(process.env.MONTHLY_PRICE || 999),
        durationMonths: 1,
    },
    YEARLY: {
        amount: Number(process.env.RAZORPAY_YEARLY_AMOUNT || 899900),
        price: Number(process.env.YEARLY_PRICE || 8999),
        durationMonths: 12,
    },
};
const createOrder = async (userId, plan) => {
    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
        throw new Error('Invalid plan');
    }
    const order = await exports.razorpay.orders.create({
        amount: selectedPlan.amount, // in paise
        currency: 'INR',
        receipt: `receipt_${userId}_${Date.now()}`,
        notes: { userId, plan },
    });
    return order;
};
exports.createOrder = createOrder;
const verifyAndActivate = async (userId, plan, razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto_1.default
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
    if (expectedSignature !== razorpay_signature) {
        throw new Error('Invalid payment signature');
    }
    // Calculate period end
    const now = new Date();
    const periodEnd = new Date(now);
    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
        throw new Error('Invalid plan');
    }
    periodEnd.setMonth(periodEnd.getMonth() + selectedPlan.durationMonths);
    // Upsert subscription
    const subscription = await prisma_1.prisma.subscription.upsert({
        where: { userId },
        update: {
            plan,
            status: 'ACTIVE',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            currentPeriodEnd: periodEnd,
        },
        create: {
            userId,
            plan,
            status: 'ACTIVE',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            currentPeriodEnd: periodEnd,
        },
    });
    return subscription;
};
exports.verifyAndActivate = verifyAndActivate;
const getSubscription = async (userId) => {
    return prisma_1.prisma.subscription.findUnique({ where: { userId } });
};
exports.getSubscription = getSubscription;
const calculateCharityAmount = (plan, percentage) => {
    const selectedPlan = PLANS[plan];
    return (selectedPlan.price * percentage) / 100;
};
exports.calculateCharityAmount = calculateCharityAmount;
const cancelSubscription = async (userId) => {
    const subscription = await prisma_1.prisma.subscription.findUnique({
        where: { userId },
    });
    if (!subscription) {
        throw new Error('No subscription found');
    }
    return prisma_1.prisma.subscription.update({
        where: { userId },
        data: { status: 'CANCELLED' },
    });
};
exports.cancelSubscription = cancelSubscription;
const mockActivateSubscription = async (userId, plan) => {
    const now = new Date();
    const periodEnd = new Date(now);
    const selectedPlan = PLANS[plan];
    periodEnd.setMonth(periodEnd.getMonth() + selectedPlan.durationMonths);
    return prisma_1.prisma.subscription.upsert({
        where: { userId },
        update: { plan, status: 'ACTIVE', currentPeriodEnd: periodEnd },
        create: { userId, plan, status: 'ACTIVE', currentPeriodEnd: periodEnd },
    });
};
exports.mockActivateSubscription = mockActivateSubscription;
