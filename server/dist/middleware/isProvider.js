"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProvider = void 0;
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
//# sourceMappingURL=isProvider.js.map