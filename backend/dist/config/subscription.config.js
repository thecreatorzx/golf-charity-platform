"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_CONFIG = void 0;
// config/subscription.config.ts
exports.SUBSCRIPTION_CONFIG = {
    MONTHLY_PRICE: Number(process.env.MONTHLY_PRICE || 999),
    YEARLY_PRICE: Number(process.env.YEARLY_PRICE || 8999),
};
