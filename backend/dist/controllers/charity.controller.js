"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donateToCharity = exports.fetchUserCharity = exports.selectUserCharity = exports.removeCharity = exports.editCharity = exports.addCharity = exports.getCharity = exports.listCharities = void 0;
const charity_service_1 = require("../services/charity.service");
const listCharities = async (req, res) => {
    try {
        const { search } = req.query;
        const charities = await (0, charity_service_1.getAllCharities)(search);
        res.json({ charities });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.listCharities = listCharities;
const getCharity = async (req, res) => {
    try {
        const charity = await (0, charity_service_1.getCharityById)(req.params.id);
        if (!charity) {
            res.status(404).json({ message: 'Charity not found' });
            return;
        }
        res.json({ charity });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCharity = getCharity;
const addCharity = async (req, res) => {
    try {
        const { name, description, imageUrl, website, featured } = req.body;
        if (!name || !description) {
            res.status(400).json({ message: 'Name and description required' });
            return;
        }
        const charity = await (0, charity_service_1.createCharity)({ name, description, imageUrl, website, featured });
        res.status(201).json({ charity });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addCharity = addCharity;
const editCharity = async (req, res) => {
    try {
        const charity = await (0, charity_service_1.updateCharity)(req.params.id, req.body);
        res.json({ charity });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.editCharity = editCharity;
const removeCharity = async (req, res) => {
    try {
        await (0, charity_service_1.deleteCharity)(req.params.id);
        res.json({ message: 'Charity deleted' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.removeCharity = removeCharity;
const selectUserCharity = async (req, res) => {
    try {
        const { charityId, percentage } = req.body;
        if (!charityId) {
            res.status(400).json({ message: 'Charity ID required' });
            return;
        }
        const contribution = await (0, charity_service_1.setUserCharity)(req.userId, charityId, percentage || 10);
        res.json({ contribution });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Server error' });
    }
};
exports.selectUserCharity = selectUserCharity;
const fetchUserCharity = async (req, res) => {
    try {
        const contribution = await (0, charity_service_1.getUserCharity)(req.userId);
        res.json({ contribution });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.fetchUserCharity = fetchUserCharity;
const donateToCharity = async (req, res) => {
    try {
        const { charityId, amount } = req.body;
        if (!charityId || !amount) {
            res.status(400).json({ message: 'Charity and amount required' });
            return;
        }
        // In production this would trigger a Razorpay order
        // For now log the intent and return success
        res.json({
            message: 'Donation recorded',
            charityId,
            amount,
            note: 'Payment gateway integration pending'
        });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.donateToCharity = donateToCharity;
