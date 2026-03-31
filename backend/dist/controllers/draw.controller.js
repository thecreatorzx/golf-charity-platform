"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllDraws = exports.fetchDrawResults = exports.publishDraw = exports.simulateDraw = void 0;
const draw_service_1 = require("../services/draw.service");
// Simulate draw
const simulateDraw = async (req, res) => {
    try {
        const { month, year, algorithm } = req.body;
        const result = await (0, draw_service_1.runDraw)(Number(month), Number(year), algorithm || 'RANDOM', false);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.simulateDraw = simulateDraw;
// Publish draw
const publishDraw = async (req, res) => {
    try {
        const { month, year, algorithm } = req.body;
        const result = await (0, draw_service_1.runDraw)(Number(month), Number(year), algorithm || 'RANDOM', true);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.publishDraw = publishDraw;
// Fetch draw results
const fetchDrawResults = async (req, res) => {
    try {
        const { month, year } = req.params;
        const results = await (0, draw_service_1.getDrawResultsService)(req.userId, req.userRole, Number(month), Number(year));
        res.json({ results });
    }
    catch (error) {
        res.status(error.message === 'Active subscription required' ? 403 : 500)
            .json({ message: error.message || 'Server error' });
    }
};
exports.fetchDrawResults = fetchDrawResults;
// Fetch all draws
const fetchAllDraws = async (req, res) => {
    try {
        const draws = await (0, draw_service_1.getAllDrawsService)(req.userId, req.userRole);
        res.json({ draws });
    }
    catch (error) {
        res.status(error.message === 'Active subscription required' ? 403 : 500)
            .json({ message: error.message || 'Server error' });
    }
};
exports.fetchAllDraws = fetchAllDraws;
