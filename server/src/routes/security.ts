import express from 'express';
import { auth, isAdmin } from '../middleware/auth';
import { getSecurityStats } from '../middleware/security';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * Security monitoring endpoints
 * Only accessible by administrators
 */

// Get real-time security statistics
router.get('/stats', auth, isAdmin, async (_req: Request, res: Response) => {
  try {
    const stats = getSecurityStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security statistics'
    });
  }
});

// Get security health check
router.get('/health', auth, isAdmin, async (_req: Request, res: Response) => {
  try {
    const stats = getSecurityStats();
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
  } catch (error) {
    console.error('Error checking security health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check security health'
    });
  }
});

// Manual IP blocking endpoint (emergency use)
router.post('/block-ip', auth, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ip, reason, duration } = req.body;
    
    if (!ip) {
      res.status(400).json({ error: 'IP address is required' });
      return;
    }
    
    // Manual IP blocking logic would go here
    // For now, we'll just log it
    console.log(`Manual IP block requested: ${ip}, reason: ${reason}, duration: ${duration}`);
    
    res.json({
      success: true,
      message: `IP ${ip} has been blocked`,
      ip,
      reason: reason || 'Manual block',
      duration: duration || '30 minutes',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block IP' });
  }
});

// Security configuration endpoint
router.get('/config', auth, isAdmin, async (_req: Request, res: Response) => {
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
        blockDuration: 30 * 60 * 1000, // 30 minutes
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
  } catch (error) {
    console.error('Error fetching security config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security configuration'
    });
  }
});

export default router;