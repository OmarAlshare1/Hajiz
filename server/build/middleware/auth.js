"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.isProvider = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Please authenticate.' });
    }
};
exports.auth = auth;
const isProvider = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'provider') {
            return res.status(403).json({ message: 'Access denied. Providers only.' });
        }
        next();
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
        return;
    }
};
exports.isProvider = isProvider;
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'default_secret';
    let expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    if (!isNaN(Number(expiresIn))) {
        expiresIn = Number(expiresIn);
    }
    const options = { expiresIn: expiresIn };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map