"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityStats = exports.errorHandler = exports.validateContentType = exports.requestSizeLimiter = exports.botDetection = exports.apiEndpointProtection = exports.securityHeaders = exports.preventParamPollution = exports.preventXss = exports.sanitizeData = exports.trackFailedAuth = exports.authLimiter = exports.bruteForceProtection = exports.limiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const attackTracker = new Map();
const blockedIPs = new Set();
setInterval(() => {
    const now = new Date();
    for (const [ip, attempt] of attackTracker.entries()) {
        if (now.getTime() - attempt.lastAttempt.getTime() > 60 * 60 * 1000) {
            attackTracker.delete(ip);
        }
        if (attempt.blocked && attempt.blockExpiry && now > attempt.blockExpiry) {
            attempt.blocked = false;
            blockedIPs.delete(ip);
            console.log(`🔓 IP ${ip} has been unblocked after timeout`);
        }
    }
}, 10 * 60 * 1000);
function getClientIP(req) {
    var _a;
    return ((_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown';
}
function logSuspiciousActivity(ip, type, req) {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'Unknown';
    const url = req.url;
    console.warn(`🚨 SECURITY ALERT [${timestamp}]:`);
    console.warn(`  Type: ${type}`);
    console.warn(`  IP: ${ip}`);
    console.warn(`  URL: ${url}`);
    console.warn(`  User-Agent: ${userAgent}`);
    console.warn(`  Method: ${req.method}`);
}
function escalateThreat(ip, threatType) {
    const attempt = attackTracker.get(ip);
    if (!attempt)
        return;
    if (!attempt.blocked) {
        attempt.blocked = true;
        attempt.blockExpiry = new Date(Date.now() + 30 * 60 * 1000);
        blockedIPs.add(ip);
        console.error(`🔒 IP ${ip} has been blocked due to ${threatType}`);
        console.error(`   Block expires at: ${attempt.blockExpiry.toISOString()}`);
    }
}
exports.limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        const ip = getClientIP(req);
        if (blockedIPs.has(ip)) {
            return false;
        }
        return req.path === '/health' || req.path === '/';
    },
    handler: (req, res) => {
        const ip = getClientIP(req);
        logSuspiciousActivity(ip, 'RATE_LIMIT_EXCEEDED', req);
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        });
    }
});
const bruteForceProtection = (req, res, next) => {
    const ip = getClientIP(req);
    if (blockedIPs.has(ip)) {
        const attempt = attackTracker.get(ip);
        if ((attempt === null || attempt === void 0 ? void 0 : attempt.blockExpiry) && new Date() < attempt.blockExpiry) {
            logSuspiciousActivity(ip, 'BLOCKED_IP_ACCESS_ATTEMPT', req);
            res.status(429).json({
                error: 'IP address temporarily blocked due to suspicious activity',
                retryAfter: Math.ceil((attempt.blockExpiry.getTime() - Date.now()) / 1000)
            });
            return;
        }
    }
    const now = new Date();
    let attempt = attackTracker.get(ip);
    if (!attempt) {
        attempt = {
            ip,
            attempts: 1,
            firstAttempt: now,
            lastAttempt: now,
            blocked: false
        };
    }
    else {
        attempt.attempts++;
        attempt.lastAttempt = now;
    }
    attackTracker.set(ip, attempt);
    if (attempt.attempts > 50 && (now.getTime() - attempt.firstAttempt.getTime()) < 60000) {
        logSuspiciousActivity(ip, 'RAPID_REQUESTS', req);
        escalateThreat(ip, 'DOS_ATTACK');
    }
    next();
};
exports.bruteForceProtection = bruteForceProtection;
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skip: (req) => {
        const ip = getClientIP(req);
        return blockedIPs.has(ip) ? false : false;
    },
    handler: (req, res) => {
        const ip = getClientIP(req);
        logSuspiciousActivity(ip, 'AUTH_BRUTE_FORCE', req);
        escalateThreat(ip, 'AUTH_BRUTE_FORCE');
        res.status(429).json({
            error: 'Too many authentication attempts, please try again later.',
            retryAfter: '15 minutes'
        });
    }
});
const trackFailedAuth = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const ip = getClientIP(req);
        if (res.statusCode === 401 || res.statusCode === 403) {
            let attempt = attackTracker.get(ip);
            if (!attempt) {
                attempt = {
                    ip,
                    attempts: 1,
                    firstAttempt: new Date(),
                    lastAttempt: new Date(),
                    blocked: false
                };
            }
            else {
                attempt.attempts++;
                attempt.lastAttempt = new Date();
            }
            attackTracker.set(ip, attempt);
            if (attempt.attempts >= 10) {
                logSuspiciousActivity(ip, 'MULTIPLE_AUTH_FAILURES', req);
                escalateThreat(ip, 'CREDENTIAL_STUFFING');
            }
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.trackFailedAuth = trackFailedAuth;
const sanitizeData = (req, _res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].trim();
            }
        });
    }
    next();
};
exports.sanitizeData = sanitizeData;
exports.preventXss = (0, xss_clean_1.default)();
exports.preventParamPollution = (0, hpp_1.default)();
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
});
const apiEndpointProtection = (req, res, next) => {
    const ip = getClientIP(req);
    const suspiciousPatterns = [
        /\.\.\//,
        /%2e%2e%2f/i,
        /\.(exe|bat|cmd|sh)$/i,
        /\.(php|asp|jsp)$/i,
        /(union|select|insert|delete|drop|create|alter)/i,
        /(script|javascript|vbscript)/i,
        /(eval|exec|system|shell_exec)/i,
    ];
    const url = req.url.toLowerCase();
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url));
    if (isSuspicious) {
        logSuspiciousActivity(ip, 'MALICIOUS_URL_PATTERN', req);
        escalateThreat(ip, 'WEB_ATTACK');
        res.status(400).json({ error: 'Invalid request' });
        return;
    }
    next();
};
exports.apiEndpointProtection = apiEndpointProtection;
const botDetection = (req, _res, next) => {
    const userAgent = req.get('User-Agent') || '';
    const ip = getClientIP(req);
    const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i,
        /scanner/i, /nikto/i, /sqlmap/i, /nmap/i,
        /burp/i, /zap/i, /acunetix/i, /nessus/i
    ];
    const isBot = botPatterns.some(pattern => pattern.test(userAgent));
    if (isBot && !req.path.includes('/robots.txt')) {
        logSuspiciousActivity(ip, 'BOT_DETECTED', req);
        const attempt = attackTracker.get(ip);
        if (attempt && attempt.attempts > 5) {
            escalateThreat(ip, 'AUTOMATED_ATTACK');
        }
    }
    next();
};
exports.botDetection = botDetection;
const requestSizeLimiter = (req, res, next) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > MAX_SIZE) {
        return res.status(413).json({ message: 'Request entity too large' });
    }
    return next();
};
exports.requestSizeLimiter = requestSizeLimiter;
const validateContentType = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            return res.status(415).json({ message: 'Unsupported media type' });
        }
    }
    return next();
};
exports.validateContentType = validateContentType;
const errorHandler = (err, req, res, _next) => {
    const ip = getClientIP(req);
    console.error(`🚨 Server Error from IP ${ip}:`, err.message);
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: Object.values(err.errors).map((e) => e.message)
        });
    }
    if (err.code === 11000) {
        return res.status(400).json({
            message: 'Duplicate field value entered',
            field: Object.keys(err.keyPattern)[0]
        });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
const getSecurityStats = () => {
    return {
        totalTrackedIPs: attackTracker.size,
        blockedIPs: blockedIPs.size,
        recentAttacks: Array.from(attackTracker.entries())
            .filter(([_, attempt]) => Date.now() - attempt.lastAttempt.getTime() < 60 * 60 * 1000)
            .map(([ip, attempt]) => ({
            ip,
            attempts: attempt.attempts,
            lastAttempt: attempt.lastAttempt,
            blocked: attempt.blocked
        }))
    };
};
exports.getSecurityStats = getSecurityStats;
//# sourceMappingURL=security.js.map