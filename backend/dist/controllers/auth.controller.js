"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: 'All fields required' });
            return;
        }
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ message: 'Email already in use' });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: { name, email, password: hashed },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, cookieOptions);
        res.status(201).json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const logout = (_req, res) => {
    res.clearCookie('token', cookieOptions);
    res.status(200).json({ message: 'Logged out' });
};
exports.logout = logout;
const me = async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, email: true, role: true }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.me = me;
