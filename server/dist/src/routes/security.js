"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const security_1 = require("../middleware/security");
const router = express_1.default.Router();
router.get('/stats', auth_1.auth, auth_1.isAdmin, async (_req, res) => {
    try {
        const stats = (0, security_1.getSecurityStats)();
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, stats), { timestamp: new Date().toISOString(), serverUptime: process.uptime(), memoryUsage: process.memoryUsage(), nodeVersion: process.version })
        });
    }
    catch (error) {
        console.error('Error fetching security stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch security statistics'
        });
    }
});
router.get('/health', auth_1.auth, auth_1.isAdmin, async (_req, res) => {
    try {
        const stats = (0, security_1.getSecurityStats)();
        const isHealthy = stats.blockedIPs < 100 && stats.recentAttacks.length < 50;
        res.json({
            success: true,
            healthy: isHealthy,
            status: isHealthy ? 'SECURE' : 'UNDER_ATTACK',
            recommendations: isHealthy ? [] : [
                'Consider implementing additional firewall rules',
                'Review and analyze attack patterns',
                'Consider temporary service restrictions'
            ]
        });
    }
    catch (error) {
        console.error('Error checking security health:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check security health'
        });
    }
});
router.post('/block-ip', auth_1.auth, auth_1.isAdmin, async (req, res) => {
    try {
        const { ip, reason, duration } = req.body;
        if (!ip) {
            res.status(400).json({ error: 'IP address is required' });
            return;
        }
        console.log(`Manual IP block requested: ${ip}, reason: ${reason}, duration: ${duration}`);
        res.json({
            success: true,
            message: `IP ${ip} has been blocked`,
            ip,
            reason: reason || 'Manual block',
            duration: duration || '30 minutes',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to block IP' });
    }
});
router.get('/config', auth_1.auth, auth_1.isAdmin, async (_req, res) => {
    try {
        const config = {
            rateLimiting: {
                general: {
                    windowMs: 15 * 60 * 1000,
                    maxRequests: 100
                },
                authentication: {
                    windowMs: 15 * 60 * 1000,
                    maxRequests: 5
                }
            },
            bruteForceProtection: {
                enabled: true,
                blockDuration: 30 * 60 * 1000,
                maxAttempts: 10
            },
            securityHeaders: {
                helmet: true,
                csp: true,
                hsts: true,
                xssProtection: true
            },
            monitoring: {
                logSuspiciousActivity: true,
                trackFailedAuth: true,
                botDetection: true
            }
        };
        res.json({
            success: true,
            config
        });
    }
    catch (error) {
        console.error('Error fetching security config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch security configuration'
        });
    }
});
exports.default = router;
//# sourceMappingURL=security.js.map