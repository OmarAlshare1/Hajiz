"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = exports.additionalSecurityHeaders = exports.validateEnvironmentMiddleware = void 0;
const security_1 = require("../config/security");
const validateEnvironmentMiddleware = () => {
    const validation = (0, security_1.validateEnvironment)();
    if (!validation.valid) {
        console.error('❌ Environment validation failed:');
        validation.errors.forEach(error => {
            console.error(`  - ${error}`);
        });
        if (process.env.NODE_ENV === 'production') {
            console.error('\n🚨 Application cannot start in production with invalid configuration');
            process.exit(1);
        }
        else {
            console.warn('\n⚠️  Application starting with warnings in development mode');
            console.warn('Please fix these issues before deploying to production\n');
        }
    }
    else {
        console.log('✅ Environment validation passed');
    }
};
exports.validateEnvironmentMiddleware = validateEnvironmentMiddleware;
const additionalSecurityHeaders = (req, res, next) => {
    res.removeHeader('X-Powered-By');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
};
exports.additionalSecurityHeaders = additionalSecurityHeaders;
const securityLogger = (req, res, next) => {
    const startTime = Date.now();
    const suspiciousPatterns = [
        /\.\.\//,
        /<script/i,
        /union.*select/i,
        /javascript:/i,
        /eval\(/i,
    ];
    const url = req.url;
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url) || pattern.test(userAgent));
    if (isSuspicious) {
        console.warn(`🚨 Suspicious request detected:`);
        console.warn(`  IP: ${ip}`);
        console.warn(`  URL: ${url}`);
        console.warn(`  User-Agent: ${userAgent}`);
        console.warn(`  Time: ${new Date().toISOString()}`);
    }
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        if (duration > 5000) {
            console.warn(`⚠️  Slow request: ${req.method} ${url} - ${duration}ms`);
        }
    });
    next();
};
exports.securityLogger = securityLogger;
//# sourceMappingURL=validateEnvironment.js.map