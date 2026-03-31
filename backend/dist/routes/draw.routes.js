"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const draw_controller_1 = require("../controllers/draw.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Subscriber — published draws only
router.get('/', auth_middleware_1.authenticate, draw_controller_1.fetchAllDraws);
router.get('/:month/:year', auth_middleware_1.authenticate, draw_controller_1.fetchDrawResults);
// Admin only
router.post('/simulate', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, draw_controller_1.simulateDraw);
router.post('/publish', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, draw_controller_1.publishDraw);
exports.default = router;
