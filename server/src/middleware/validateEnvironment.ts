import { validateEnvironment } from '../config/security';

/**
 * Middleware to validate environment variables on application startup
 * Ensures all required security configurations are properly set
 */
export const validateEnvironmentMiddleware = () => {
  const validation = validateEnvironment();
  
  if (!validation.valid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => {
      console.error(`  - ${error}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      console.error('\n🚨 Application cannot start in production with invalid configuration');
      process.exit(1);
    } else {
      console.warn('\n⚠️  Application starting with warnings in development mode');
      console.warn('Please fix these issues before deploying to production\n');
    }
  } else {
    console.log('✅ Environment validation passed');
  }
};

/**
 * Security headers middleware for additional protection
 */
export const additionalSecurityHeaders = (req: any, res: any, next: any) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add HSTS header for HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

/**
 * Request logging middleware for security monitoring
 */
export const securityLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
  ];
  
  const url = req.url;
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress;
  
  // Check for suspicious patterns
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent)
  );
  
  if (isSuspicious) {
    console.warn(`🚨 Suspicious request detected:`);
    console.warn(`  IP: ${ip}`);
    console.warn(`  URL: ${url}`);
    console.warn(`  User-Agent: ${userAgent}`);
    console.warn(`  Time: ${new Date().toISOString()}`);
  }
  
  // Log response time for performance monitoring
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) { // Log slow requests (>5s)
      console.warn(`⚠️  Slow request: ${req.method} ${url} - ${duration}ms`);
    }
  });
  
  next();
};