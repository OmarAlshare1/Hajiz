import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';

// In-memory store for tracking failed attempts and blocked IPs
interface AttackAttempt {
  ip: string;
  attempts: number;
  firstAttempt: Date;
  lastAttempt: Date;
  blocked: boolean;
  blockExpiry?: Date;
}

const attackTracker = new Map<string, AttackAttempt>();
const blockedIPs = new Set<string>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = new Date();
  for (const [ip, attempt] of attackTracker.entries()) {
    // Remove entries older than 1 hour
    if (now.getTime() - attempt.lastAttempt.getTime() > 60 * 60 * 1000) {
      attackTracker.delete(ip);
    }
    // Unblock IPs after block period expires
    if (attempt.blocked && attempt.blockExpiry && now > attempt.blockExpiry) {
      attempt.blocked = false;
      blockedIPs.delete(ip);
      console.log(`🔓 IP ${ip} has been unblocked after timeout`);
    }
  }
}, 10 * 60 * 1000);

// Helper function to get client IP
function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.headers['x-real-ip'] as string ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         'unknown';
}

// Log suspicious activity
function logSuspiciousActivity(ip: string, type: string, req: Request) {
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

// Escalate threat level and apply countermeasures
function escalateThreat(ip: string, threatType: string) {
  const attempt = attackTracker.get(ip);
  if (!attempt) return;
  
  // Block IP for escalated threats
  if (!attempt.blocked) {
    attempt.blocked = true;
    attempt.blockExpiry = new Date(Date.now() + 30 * 60 * 1000); // Block for 30 minutes
    blockedIPs.add(ip);
    
    console.error(`🔒 IP ${ip} has been blocked due to ${threatType}`);
    console.error(`   Block expires at: ${attempt.blockExpiry.toISOString()}`);
  }
}

// Enhanced rate limiting with brute force protection
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const ip = getClientIP(req);
    if (blockedIPs.has(ip)) {
      return false; // Don't skip, apply rate limit
    }
    // Skip rate limiting for health checks
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

// Brute force detection middleware
export const bruteForceProtection = (req: Request, res: Response, next: NextFunction): void => {
  const ip = getClientIP(req);
  
  // Check if IP is blocked
  if (blockedIPs.has(ip)) {
    const attempt = attackTracker.get(ip);
    if (attempt?.blockExpiry && new Date() < attempt.blockExpiry) {
      logSuspiciousActivity(ip, 'BLOCKED_IP_ACCESS_ATTEMPT', req);
      res.status(429).json({
        error: 'IP address temporarily blocked due to suspicious activity',
        retryAfter: Math.ceil((attempt.blockExpiry.getTime() - Date.now()) / 1000)
      });
      return;
    }
  }
  
  // Track request patterns for potential attacks
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
  } else {
    attempt.attempts++;
    attempt.lastAttempt = now;
  }
  
  attackTracker.set(ip, attempt);
  
  // Detect rapid requests (potential DoS)
  if (attempt.attempts > 50 && (now.getTime() - attempt.firstAttempt.getTime()) < 60000) {
    logSuspiciousActivity(ip, 'RAPID_REQUESTS', req);
    escalateThreat(ip, 'DOS_ATTACK');
  }
  
  next();
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Stricter limit for auth endpoints
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => {
    const ip = getClientIP(req);
    return blockedIPs.has(ip) ? false : false; // Never skip for auth endpoints
  },
  handler: (req, res) => {
    const ip = getClientIP(req);
    logSuspiciousActivity(ip, 'AUTH_BRUTE_FORCE', req);
    // Escalate to IP blocking after repeated auth failures
    escalateThreat(ip, 'AUTH_BRUTE_FORCE');
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Failed authentication tracking
export const trackFailedAuth = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const ip = getClientIP(req);
    
    // Check if this was a failed authentication
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
      } else {
        attempt.attempts++;
        attempt.lastAttempt = new Date();
      }
      
      attackTracker.set(ip, attempt);
      
      // Escalate after multiple failed attempts
      if (attempt.attempts >= 10) {
        logSuspiciousActivity(ip, 'MULTIPLE_AUTH_FAILURES', req);
        escalateThreat(ip, 'CREDENTIAL_STUFFING');
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Data sanitization
export const sanitizeData = (req: Request, _res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }

  next();
};

// XSS protection
export const preventXss = xss();

// Parameter pollution prevention
export const preventParamPollution = hpp();

// Security headers
export const securityHeaders = helmet({
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

// API endpoint protection
export const apiEndpointProtection = (req: Request, res: Response, next: NextFunction): void => {
  const ip = getClientIP(req);
  
  // Check for common attack patterns in URL
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /%2e%2e%2f/i, // Encoded path traversal
    /\.(exe|bat|cmd|sh)$/i, // Executable files
    /\.(php|asp|jsp)$/i, // Server-side scripts
    /(union|select|insert|delete|drop|create|alter)/i, // SQL injection
    /(script|javascript|vbscript)/i, // Script injection
    /(eval|exec|system|shell_exec)/i, // Code execution
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

// Monitor for automated tools and bots
export const botDetection = (req: Request, _res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = getClientIP(req);
  
  // Common bot/scanner user agents
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /scanner/i, /nikto/i, /sqlmap/i, /nmap/i,
    /burp/i, /zap/i, /acunetix/i, /nessus/i
  ];
  
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  if (isBot && !req.path.includes('/robots.txt')) {
    logSuspiciousActivity(ip, 'BOT_DETECTED', req);
    
    // Rate limit bots more aggressively
    const attempt = attackTracker.get(ip);
    if (attempt && attempt.attempts > 5) {
      escalateThreat(ip, 'AUTOMATED_ATTACK');
    }
  }
  
  next();
};

// Request size limiting
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > MAX_SIZE) {
    return res.status(413).json({ message: 'Request entity too large' });
  }
  return next();
};

// Content type validation
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ message: 'Unsupported media type' });
    }
  }
  return next();
};

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const ip = getClientIP(req);
  console.error(`🚨 Server Error from IP ${ip}:`, err.message);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map((e: any) => e.message)
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate field value entered',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // Default error
  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
};

// Export attack tracking for monitoring
export const getSecurityStats = () => {
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