"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = exports.validatePassword = exports.validateJWTSecret = exports.SECURITY_CONFIG = void 0;
exports.SECURITY_CONFIG = {
    JWT: {
        MIN_SECRET_LENGTH: 32,
        ALGORITHM: 'HS256',
        ISSUER: 'hajiz-api',
        AUDIENCE: 'hajiz-client',
        DEFAULT_EXPIRES_IN: '7d'
    },
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 100,
        AUTH_MAX_REQUESTS: 5,
        SKIP_PATHS: ['/health', '/', '/api/health']
    },
    REQUEST: {
        MAX_SIZE: 10 * 1024 * 1024,
        ALLOWED_CONTENT_TYPES: [
            'application/json',
            'multipart/form-data',
            'application/x-www-form-urlencoded'
        ]
    },
    CORS: {
        ALLOWED_ORIGINS: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3004',
            'https://www.hajiz.co.uk'
        ],
        ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
        CREDENTIALS: true
    },
    HEADERS: {
        CSP: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL_CHARS: true
    },
    SESSION: {
        MAX_AGE: 7 * 24 * 60 * 60 * 1000,
        SECURE: process.env.NODE_ENV === 'production',
        HTTP_ONLY: true,
        SAME_SITE: 'strict'
    }
};
const validateJWTSecret = (secret) => {
    return !!(secret && secret.length >= exports.SECURITY_CONFIG.JWT.MIN_SECRET_LENGTH && secret !== 'default_secret');
};
exports.validateJWTSecret = validateJWTSecret;
const validatePassword = (password) => {
    const errors = [];
    const config = exports.SECURITY_CONFIG.PASSWORD;
    if (password.length < config.MIN_LENGTH) {
        errors.push(`Password must be at least ${config.MIN_LENGTH} characters long`);
    }
    if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (config.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (config.REQUIRE_NUMBERS && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (config.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        valid: errors.length === 0,
        errors
    };
};
exports.validatePassword = validatePassword;
const validateEnvironment = () => {
    const errors = [];
    if (!(0, exports.validateJWTSecret)(process.env.JWT_SECRET)) {
        errors.push('JWT_SECRET must be set and at least 32 characters long');
    }
    if (!process.env.MONGODB_URI) {
        errors.push('MONGODB_URI must be set');
    }
    if (!process.env.NODE_ENV) {
        errors.push('NODE_ENV must be set');
    }
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            errors.push('Cloudinary configuration must be complete in production');
        }
        if (!process.env.AISENSY_API_KEY) {
            errors.push('AiSensy API key must be set in production');
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
};
exports.validateEnvironment = validateEnvironment;
//# sourceMappingURL=security.js.map