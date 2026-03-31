"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const score_controller_1 = require("../controllers/score.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireSubscription); // all score routes require auth
router.post('/', score_controller_1.addScore);
router.get('/', score_controller_1.getScores);
router.delete('/:id', score_controller_1.removeScore);
exports.default = router;
