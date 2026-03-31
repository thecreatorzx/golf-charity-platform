"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeScore = exports.getScores = exports.addScore = void 0;
const score_service_1 = require("../services/score.service");
const addScore = async (req, res) => {
    try {
        const { score, datePlayed } = req.body;
        if (!score || !datePlayed) {
            res.status(400).json({ message: 'Score and date are required' });
            return;
        }
        const newScore = await (0, score_service_1.upsertScore)(req.userId, Number(score), new Date(datePlayed));
        res.status(201).json({ score: newScore });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Server error' });
    }
};
exports.addScore = addScore;
const getScores = async (req, res) => {
    try {
        const scores = await (0, score_service_1.getUserScores)(req.userId);
        res.json({ scores });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getScores = getScores;
const removeScore = async (req, res) => {
    try {
        const { id } = req.params;
        await (0, score_service_1.deleteScore)(id, req.userId);
        res.json({ message: 'Score deleted' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.removeScore = removeScore;
