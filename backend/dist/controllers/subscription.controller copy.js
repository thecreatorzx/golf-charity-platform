"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSubscription = exports.confirmSubscription = exports.initiateSubscription = void 0;
const subscription_service_1 = require("../services/subscription.service");
const initiateSubscription = async (req, res) => {
    try {
        const { plan } = req.body;
        if (!plan || !['MONTHLY', 'YEARLY'].includes(plan)) {
            res.status(400).json({ message: 'Invalid plan' });
            return;
        }
        const order = await (0, subscription_service_1.createOrder)(req.userId, plan);
        res.json({ order, key: process.env.RAZORPAY_KEY_ID });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.initiateSubscription = initiateSubscription;
const confirmSubscription = async (req, res) => {
    try {
        const { plan, razorpay_order_id, razorpay_payment_id, razorpay_signature, } = req.body;
        const subscription = await (0, subscription_service_1.verifyAndActivate)(req.userId, plan, razorpay_order_id, razorpay_payment_id, razorpay_signature);
        res.json({ subscription });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Verification failed' });
    }
};
exports.confirmSubscription = confirmSubscription;
const fetchSubscription = async (req, res) => {
    try {
        const subscription = await (0, subscription_service_1.getSubscription)(req.userId);
        res.json({ subscription });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.fetchSubscription = fetchSubscription;
