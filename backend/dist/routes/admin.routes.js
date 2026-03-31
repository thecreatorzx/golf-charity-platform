"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin); // all admin routes protected
// Users
router.get('/users', admin_controller_1.getAllUsers);
router.put('/users/:userId/subscription', admin_controller_1.updateUserSubscription);
router.put('/scores/:scoreId', admin_controller_1.adminEditScore);
router.delete('/scores/:scoreId', admin_controller_1.adminDeleteScore);
// Winners
router.get('/winners', admin_controller_1.getAllWinners);
router.put('/winners/:winnerId/verify', admin_controller_1.verifyWinner);
router.put('/winners/:winnerId/pay', admin_controller_1.markWinnerPaid);
// Analytics
router.get('/analytics', admin_controller_1.getAnalytics);
exports.default = router;
