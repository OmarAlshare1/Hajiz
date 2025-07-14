"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.isAdmin = exports.isProvider = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Access token required' });
            return;
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token || token.length < 10) {
            res.status(401).json({ message: 'Invalid token format' });
            return;
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret, {
            algorithms: ['HS256'],
            issuer: 'hajiz-api',
            audience: 'hajiz-client'
        });
        const user = await User_1.User.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        res.status(401).json({ message: 'Authentication failed' });
    }
};
exports.auth = auth;
const isProvider = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'provider') {
            res.status(403).json({ message: 'Access denied. Providers only.' });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.isProvider = isProvider;
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.isAdmin) {
            res.status(403).json({ message: 'Access denied. Administrators only.' });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.isAdmin = isAdmin;
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'default_secret' || secret.length < 32) {
        throw new Error('JWT_SECRET must be set and at least 32 characters long');
    }
    let expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    if (!isNaN(Number(expiresIn))) {
        expiresIn = Number(expiresIn);
    }
    const options = {
        expiresIn: expiresIn,
        algorithm: 'HS256',
        issuer: 'hajiz-api',
        audience: 'hajiz-client'
    };
    return jsonwebtoken_1.default.sign({ userId, iat: Math.floor(Date.now() / 1000) }, secret, options);
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map