#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Security Audit Script
 * Performs comprehensive security checks on the application
 */

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      error: '❌',
      warning: '⚠️ ',
      success: '✅',
      info: 'ℹ️ '
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addIssue(message) {
    this.issues.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addPassed(message) {
    this.passed.push(message);
    this.log(message, 'success');
  }

  checkEnvironmentFiles() {
    this.log('Checking environment files...', 'info');
    
    // Check if .env files are in .gitignore
    const gitignorePath = path.join(__dirname, '../.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignore.includes('.env')) {
        this.addPassed('.env files are properly ignored in git');
      } else {
        this.addIssue('.env files are not in .gitignore');
      }
    }

    // Check for .env files in repository
    const envFiles = ['.env', 'server/.env', 'client/.env'];
    envFiles.forEach(envFile => {
      const envPath = path.join(__dirname, '..', envFile);
      if (fs.existsSync(envPath)) {
        this.addIssue(`Found ${envFile} file in repository - should not be committed`);
      }
    });
  }

  checkDependencies() {
    this.log('Checking dependencies for vulnerabilities...', 'info');
    
    const checkDir = (dir, name) => {
      const dirPath = path.join(__dirname, '..', dir);
      if (fs.existsSync(dirPath)) {
        try {
          const result = execSync('npm audit --audit-level=moderate', { 
            cwd: dirPath, 
            encoding: 'utf8',
            stdio: 'pipe'
          });
          if (result.includes('found 0 vulnerabilities')) {
            this.addPassed(`${name} dependencies are secure`);
          }
        } catch (error) {
          if (error.stdout && error.stdout.includes('vulnerabilities')) {
            this.addIssue(`${name} has vulnerable dependencies: ${error.stdout}`);
          }
        }
      }
    };

    checkDir('server', 'Server');
    checkDir('client', 'Client');
  }

  checkHardcodedSecrets() {
    this.log('Checking for hardcoded secrets...', 'info');
    
    const patterns = [
      /password\s*=\s*["'][^"']{8,}["']/gi,
      /api[_-]?key\s*=\s*["'][^"']{10,}["']/gi,
      /secret\s*=\s*["'][^"']{10,}["']/gi,
      /token\s*=\s*["'][^"']{10,}["']/gi
    ];

    const searchDir = (dir) => {
      const files = this.getJSFiles(dir);
      files.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              matches.forEach(match => {
                if (!match.includes('process.env') && !match.includes('example') && !match.includes('test')) {
                  this.addIssue(`Potential hardcoded secret in ${file}: ${match}`);
                }
              });
            }
          });
        } catch (error) {
          // Skip files that can't be read
        }
      });
    };

    searchDir(path.join(__dirname, '../server/src'));
    searchDir(path.join(__dirname, '../client/src'));
  }

  checkPortConfiguration() {
    this.log('Checking port configuration...', 'info');
    
    const serverPath = path.join(__dirname, '../server/src/app.ts');
    if (fs.existsSync(serverPath)) {
      const content = fs.readFileSync(serverPath, 'utf8');
      if (content.includes('127.0.0.1') || content.includes('localhost')) {
        this.addPassed('Server is configured to bind to localhost only');
      } else if (content.includes('0.0.0.0')) {
        this.addWarning('Server is configured to bind to all interfaces (0.0.0.0)');
      }
    }
  }

  checkSecurityHeaders() {
    this.log('Checking security headers configuration...', 'info');
    
    const securityPath = path.join(__dirname, '../server/src/middleware/security.ts');
    if (fs.existsSync(securityPath)) {
      const content = fs.readFileSync(securityPath, 'utf8');
      
      // Check for helmet configuration
      if (content.includes('helmet')) {
        this.addPassed('Helmet security headers are configured');
      }
      
      // Check for specific security headers in the enhanced middleware
      if (content.includes('X-Content-Type-Options') || content.includes('noSniff')) {
        this.addPassed('X-Content-Type-Options header is configured');
      }
      
      if (content.includes('X-Frame-Options') || content.includes('frameguard')) {
        this.addPassed('X-Frame-Options header is configured');
      }
      
      if (content.includes('Content-Security-Policy') || content.includes('contentSecurityPolicy')) {
        this.addPassed('Content-Security-Policy header is configured');
      }
      
      if (content.includes('advancedXssProtection')) {
        this.addPassed('Advanced XSS protection is configured');
      }
      
      if (content.includes('enhancedCSP')) {
        this.addPassed('Enhanced CSP protection is configured');
      }
      
      if (content.includes('hsts') || content.includes('Strict-Transport-Security')) {
        this.addPassed('HSTS (HTTP Strict Transport Security) is configured');
      }
    }
  }

  checkRateLimiting() {
    this.log('Checking rate limiting configuration...', 'info');
    
    const securityPath = path.join(__dirname, '../server/src/middleware/security.ts');
    if (fs.existsSync(securityPath)) {
      const content = fs.readFileSync(securityPath, 'utf8');
      
      if (content.includes('rateLimit')) {
        this.addPassed('Rate limiting is configured');
      } else {
        this.addIssue('Rate limiting is not configured');
      }
      
      if (content.includes('authLimiter')) {
        this.addPassed('Authentication rate limiting is configured');
      } else {
        this.addWarning('Authentication-specific rate limiting might not be configured');
      }
      
      if (content.includes('bruteForceProtection')) {
        this.addPassed('Brute force protection is configured');
      } else {
        this.addIssue('Brute force protection is not configured');
      }
    }
  }

  checkBruteForceProtection() {
    this.log('Checking brute force protection...', 'info');
    
    const securityPath = path.join(__dirname, '../server/src/middleware/security.ts');
    if (fs.existsSync(securityPath)) {
      const content = fs.readFileSync(securityPath, 'utf8');
      
      const protectionFeatures = [
        'bruteForceProtection',
        'trackFailedAuth',
        'attackTracker',
        'blockedIPs',
        'escalateThreat'
      ];
      
      protectionFeatures.forEach(feature => {
        if (content.includes(feature)) {
          this.addPassed(`Brute force feature ${feature} is implemented`);
        } else {
          this.addWarning(`Brute force feature ${feature} might not be implemented`);
        }
      });
    }
  }

  checkSecurityMonitoring() {
    this.log('Checking security monitoring...', 'info');
    
    const securityRoutesPath = path.join(__dirname, '../server/src/routes/security.ts');
    if (fs.existsSync(securityRoutesPath)) {
      this.addPassed('Security monitoring endpoints are configured');
      
      const content = fs.readFileSync(securityRoutesPath, 'utf8');
      if (content.includes('/stats') && content.includes('/health')) {
        this.addPassed('Security statistics and health monitoring available');
      }
    } else {
      this.addWarning('Security monitoring endpoints not found');
    }
  }

  checkAdvancedSecurity() {
    this.log('Checking advanced security features...', 'info');
    
    const securityPath = path.join(__dirname, '../server/src/middleware/security.ts');
    if (fs.existsSync(securityPath)) {
      const content = fs.readFileSync(securityPath, 'utf8');
      
      // Check for API endpoint protection
      if (content.includes('apiEndpointProtection') || content.includes('maliciousPatterns')) {
        this.addPassed('API endpoint protection is implemented');
      }
      
      // Check for bot detection
      if (content.includes('botDetection') || content.includes('botUserAgents')) {
        this.addPassed('Bot detection is implemented');
      }
      
      // Check for suspicious activity logging
      if (content.includes('logSuspiciousActivity') || content.includes('SECURITY_ALERT')) {
        this.addPassed('Suspicious activity logging is implemented');
      }
      
      // Check for enhanced CSP
      if (content.includes('enhancedCSP') || content.includes('contentSecurityPolicy')) {
        this.addPassed('Enhanced Content Security Policy is implemented');
      }
      
      // Check for advanced XSS protection
      if (content.includes('advancedXssProtection') || content.includes('xssFilter')) {
        this.addPassed('Advanced XSS protection is implemented');
      }
      
      // Check for IP blocking and threat escalation
      if (content.includes('escalateThreat') && content.includes('blockedIPs')) {
        this.addPassed('IP blocking and threat escalation is implemented');
      }
      
      // Check for request pattern analysis
      if (content.includes('attackTracker') && content.includes('requestCount')) {
        this.addPassed('Request pattern analysis is implemented');
      }
    }
    
    // Check for security configuration
    const configPath = path.join(__dirname, '../server/src/config/security.ts');
    if (fs.existsSync(configPath)) {
      this.addPassed('Centralized security configuration is available');
    } else {
      this.addWarning('Centralized security configuration not found');
    }
  }

  getJSFiles(dir) {
    const files = [];
    
    const traverse = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        items.forEach(item => {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            traverse(fullPath);
          } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.tsx'))) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    if (fs.existsSync(dir)) {
      traverse(dir);
    }
    
    return files;
  }

  generateReport() {
    this.log('\n=== SECURITY AUDIT REPORT ===', 'info');
    
    console.log(`\n✅ Passed Checks (${this.passed.length}):`);
    this.passed.forEach(item => console.log(`  - ${item}`));
    
    console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
    this.warnings.forEach(item => console.log(`  - ${item}`));
    
    console.log(`\n❌ Issues (${this.issues.length}):`);
    this.issues.forEach(item => console.log(`  - ${item}`));
    
    const score = Math.round((this.passed.length / (this.passed.length + this.warnings.length + this.issues.length)) * 100);
    console.log(`\n🏆 Security Score: ${score}%`);
    
    if (this.issues.length === 0) {
      console.log('\n🎉 No critical security issues found!');
      return 0;
    } else {
      console.log(`\n🚨 Found ${this.issues.length} critical security issue(s) that need immediate attention.`);
      return 1;
    }
  }

  async run() {
    console.log('🔍 Starting Security Audit...\n');
    
    this.checkEnvironmentFiles();
    this.checkDependencies();
    this.checkHardcodedSecrets();
    this.checkPortConfiguration();
    this.checkSecurityHeaders();
    this.checkRateLimiting();
    this.checkBruteForceProtection();
    this.checkSecurityMonitoring();
    this.checkAdvancedSecurity();
    
    return this.generateReport();
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Security audit failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityAuditor;