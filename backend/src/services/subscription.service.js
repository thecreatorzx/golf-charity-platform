import { prisma } from "../lib/prisma.js";
import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "WARNING: Razorpay credentials not configured. Subscription features will not work.",
  );
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
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

export const createOrder = async (userId, plan) => {
  const selectedPlan = PLANS[plan];
  if (!selectedPlan) throw new Error("Invalid plan");

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay configuration missing.");
  }

  try {
    const order = await razorpay.orders.create({
      amount: selectedPlan.amount,
      currency: "INR",
      receipt: `rec_${Date.now()}`,
      notes: { userId, plan },
    });
    return order;
  } catch (error) {
    const errDetail =
      error?.error?.description || error?.message || "Unknown error";
    throw new Error(`Failed to create payment order: ${errDetail}`);
  }
};

export const verifyAndActivate = async (
  userId,
  plan,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
) => {
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Invalid payment signature");
  }

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) throw new Error("Invalid plan");

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + selectedPlan.durationMonths);

  return prisma.subscription.upsert({
    where: { userId },
    update: {
      plan,
      status: "ACTIVE",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      currentPeriodEnd: periodEnd,
    },
    create: {
      userId,
      plan,
      status: "ACTIVE",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      currentPeriodEnd: periodEnd,
    },
  });
};

export const getSubscription = async (userId) => {
  return prisma.subscription.findUnique({ where: { userId } });
};

export const calculateCharityAmount = (plan, percentage) => {
  return (PLANS[plan].price * percentage) / 100;
};

export const cancelSubscription = async (userId) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });
  if (!subscription) throw new Error("No subscription found");
  return prisma.subscription.update({
    where: { userId },
    data: { status: "CANCELLED" },
  });
};

export const mockActivateSubscription = async (userId, plan) => {
  const selectedPlan = PLANS[plan];
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + selectedPlan.durationMonths);
  return prisma.subscription.upsert({
    where: { userId },
    update: { plan, status: "ACTIVE", currentPeriodEnd: periodEnd },
    create: { userId, plan, status: "ACTIVE", currentPeriodEnd: periodEnd },
  });
};
