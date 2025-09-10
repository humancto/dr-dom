/**
 * SSL Certificate & Security Headers Analyzer
 * Analyzes HTTPS configuration and security headers
 */

class SSLAnalyzer {
  constructor() {
    this.analysis = {
      protocol: null,
      securityHeaders: {},
      certificate: {},
      grade: null,
      issues: [],
      recommendations: []
    };
    this.init();
  }

  async init() {
    // Analyze immediately
    await this.analyze();
  }

  async analyze() {
    console.log('[SSL Analyzer] Starting security analysis...');
    
    // Check protocol
    this.analysis.protocol = window.location.protocol;
    const isHTTPS = this.analysis.protocol === 'https:';
    
    if (!isHTTPS) {
      this.analysis.grade = 'F';
      this.analysis.issues.push({
        severity: 'critical',
        message: 'Site is not using HTTPS encryption',
        impact: 'All data transmitted in plain text'
      });
    } else {
      // Analyze security configuration
      await this.analyzeSecurityHeaders();
      this.analyzeCertificate();
      this.calculateGrade();
    }
    
    this.generateRecommendations();
    this.storeAnalysis();
    
    return this.analysis;
  }

  async analyzeSecurityHeaders() {
    // We need to get headers from the background script
    // since content scripts can't access response headers directly
    
    try {
      // Check for common security indicators in the DOM
      const securityIndicators = this.checkDOMSecurityIndicators();
      
      // Analyze Content Security Policy
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (cspMeta) {
        this.analysis.securityHeaders['Content-Security-Policy'] = {
          present: true,
          value: cspMeta.content,
          score: this.analyzeCSP(cspMeta.content)
        };
      }
      
      // Check for X-Frame-Options via iframe test
      this.checkFrameOptions();
      
      // Check for secure cookies
      this.checkCookieSecurity();
      
      // Request headers from background script
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          { action: 'getSecurityHeaders', url: window.location.href },
          (response) => {
            if (response && response.headers) {
              this.processSecurityHeaders(response.headers);
            }
          }
        );
      }
      
    } catch (error) {
      console.warn('[SSL Analyzer] Could not analyze headers:', error);
    }
  }

  checkDOMSecurityIndicators() {
    const indicators = {};
    
    // Check for HSTS preload
    if (document.documentElement.getAttribute('data-hsts')) {
      indicators.hsts = true;
    }
    
    // Check for CSP nonce
    const scriptsWithNonce = document.querySelectorAll('script[nonce]');
    if (scriptsWithNonce.length > 0) {
      indicators.cspNonce = true;
      this.analysis.securityHeaders['CSP-Nonce'] = {
        present: true,
        score: 10
      };
    }
    
    // Check for SRI (Subresource Integrity)
    const scriptsWithSRI = document.querySelectorAll('script[integrity], link[integrity]');
    if (scriptsWithSRI.length > 0) {
      indicators.sri = true;
      this.analysis.securityHeaders['Subresource-Integrity'] = {
        present: true,
        count: scriptsWithSRI.length,
        score: 10
      };
    }
    
    return indicators;
  }

  analyzeCSP(cspContent) {
    let score = 0;
    
    // Check for important directives
    if (cspContent.includes("default-src 'self'")) score += 20;
    if (cspContent.includes("script-src") && !cspContent.includes("unsafe-inline")) score += 15;
    if (cspContent.includes("style-src") && !cspContent.includes("unsafe-inline")) score += 10;
    if (cspContent.includes("img-src")) score += 5;
    if (cspContent.includes("connect-src")) score += 5;
    if (cspContent.includes("frame-ancestors")) score += 10;
    if (cspContent.includes("upgrade-insecure-requests")) score += 10;
    
    // Penalties
    if (cspContent.includes("unsafe-inline")) {
      score -= 15;
      this.analysis.issues.push({
        severity: 'medium',
        message: 'CSP allows unsafe-inline scripts',
        impact: 'Vulnerable to XSS attacks'
      });
    }
    
    if (cspContent.includes("unsafe-eval")) {
      score -= 10;
      this.analysis.issues.push({
        severity: 'medium',
        message: 'CSP allows unsafe-eval',
        impact: 'Vulnerable to code injection'
      });
    }
    
    return Math.max(0, score);
  }

  checkFrameOptions() {
    // Try to create an iframe to test clickjacking protection
    try {
      const testFrame = document.createElement('iframe');
      testFrame.style.display = 'none';
      testFrame.src = window.location.href;
      document.body.appendChild(testFrame);
      
      // If we can load ourselves in an iframe, X-Frame-Options is not set
      setTimeout(() => {
        try {
          const frameDoc = testFrame.contentDocument || testFrame.contentWindow.document;
          if (frameDoc) {
            this.analysis.issues.push({
              severity: 'medium',
              message: 'Missing X-Frame-Options header',
              impact: 'Vulnerable to clickjacking attacks'
            });
          }
        } catch (e) {
          // Good - frame is blocked
          this.analysis.securityHeaders['X-Frame-Options'] = {
            present: true,
            score: 10
          };
        } finally {
          document.body.removeChild(testFrame);
        }
      }, 100);
    } catch (e) {
      // Frame creation failed - likely blocked
    }
  }

  checkCookieSecurity() {
    const cookies = document.cookie.split(';');
    let secureCookies = 0;
    let totalCookies = cookies.length;
    
    // Check if we're on HTTPS
    if (window.location.protocol === 'https:') {
      // On HTTPS, all cookies should be secure
      // We can't directly check Secure flag from JS, but we can infer
      
      // Check for session cookies without proper security
      if (document.cookie.includes('session') || document.cookie.includes('SESS')) {
        if (!document.cookie.includes('__Secure-') && !document.cookie.includes('__Host-')) {
          this.analysis.issues.push({
            severity: 'low',
            message: 'Session cookies may not have Secure flag',
            impact: 'Cookies could be intercepted over HTTP'
          });
        }
      }
    }
    
    // Check for cookie prefixes (security indicators)
    if (document.cookie.includes('__Secure-')) {
      this.analysis.securityHeaders['Secure-Cookies'] = {
        present: true,
        score: 5
      };
    }
    
    if (document.cookie.includes('__Host-')) {
      this.analysis.securityHeaders['Host-Cookies'] = {
        present: true,
        score: 5
      };
    }
  }

  analyzeCertificate() {
    // We can't directly access certificate details from content script
    // But we can check some indicators
    
    if (window.location.protocol === 'https:') {
      this.analysis.certificate = {
        valid: true, // If we're here, cert is valid
        protocol: 'TLS', // Modern browsers only support TLS
      };
      
      // Check for mixed content
      this.checkMixedContent();
      
      // Check certificate transparency
      this.checkCertificateTransparency();
    }
  }

  checkMixedContent() {
    // Check for non-HTTPS resources
    const insecureElements = [
      ...document.querySelectorAll('img[src^="http://"]'),
      ...document.querySelectorAll('script[src^="http://"]'),
      ...document.querySelectorAll('link[href^="http://"]'),
      ...document.querySelectorAll('iframe[src^="http://"]'),
      ...document.querySelectorAll('audio[src^="http://"], video[src^="http://"]')
    ];
    
    if (insecureElements.length > 0) {
      this.analysis.issues.push({
        severity: 'high',
        message: `Found ${insecureElements.length} insecure resources`,
        impact: 'Mixed content weakens HTTPS protection',
        details: insecureElements.slice(0, 5).map(el => el.src || el.href)
      });
      
      this.analysis.certificate.mixedContent = true;
      this.analysis.certificate.insecureResources = insecureElements.length;
    }
  }

  checkCertificateTransparency() {
    // Check if Certificate Transparency is likely in use
    // Modern browsers require CT for new certificates
    const currentYear = new Date().getFullYear();
    
    // Assume CT is present for modern sites
    if (window.location.protocol === 'https:') {
      this.analysis.certificate.transparencyLikely = true;
    }
  }

  processSecurityHeaders(headers) {
    const importantHeaders = {
      'Strict-Transport-Security': { score: 20, critical: true },
      'Content-Security-Policy': { score: 25, critical: true },
      'X-Content-Type-Options': { score: 10, critical: false },
      'X-Frame-Options': { score: 10, critical: false },
      'X-XSS-Protection': { score: 5, critical: false },
      'Referrer-Policy': { score: 5, critical: false },
      'Permissions-Policy': { score: 10, critical: false }
    };
    
    let totalScore = 0;
    let maxScore = 0;
    
    for (const [header, config] of Object.entries(importantHeaders)) {
      maxScore += config.score;
      
      if (headers[header]) {
        this.analysis.securityHeaders[header] = {
          present: true,
          value: headers[header],
          score: config.score
        };
        totalScore += config.score;
      } else if (config.critical) {
        this.analysis.issues.push({
          severity: 'high',
          message: `Missing ${header} header`,
          impact: this.getHeaderImpact(header)
        });
      }
    }
    
    this.analysis.headerScore = Math.round((totalScore / maxScore) * 100);
  }

  getHeaderImpact(header) {
    const impacts = {
      'Strict-Transport-Security': 'Site can be downgraded to HTTP',
      'Content-Security-Policy': 'Vulnerable to XSS and injection attacks',
      'X-Content-Type-Options': 'Vulnerable to MIME sniffing attacks',
      'X-Frame-Options': 'Vulnerable to clickjacking',
      'X-XSS-Protection': 'No XSS filter in older browsers',
      'Referrer-Policy': 'Leaks referrer information',
      'Permissions-Policy': 'No control over browser features'
    };
    return impacts[header] || 'Security weakness';
  }

  calculateGrade() {
    let score = 100;
    
    // Deduct for missing headers
    const missingCriticalHeaders = this.analysis.issues.filter(
      i => i.message.includes('Missing') && i.severity === 'high'
    ).length;
    score -= missingCriticalHeaders * 15;
    
    // Deduct for security issues
    this.analysis.issues.forEach(issue => {
      if (issue.severity === 'critical') score -= 30;
      else if (issue.severity === 'high') score -= 15;
      else if (issue.severity === 'medium') score -= 10;
      else if (issue.severity === 'low') score -= 5;
    });
    
    // Bonus for good practices
    if (this.analysis.securityHeaders['Subresource-Integrity']) score += 5;
    if (this.analysis.securityHeaders['CSP-Nonce']) score += 5;
    
    score = Math.max(0, Math.min(100, score));
    
    // Assign grade
    if (score >= 90) this.analysis.grade = 'A+';
    else if (score >= 80) this.analysis.grade = 'A';
    else if (score >= 70) this.analysis.grade = 'B';
    else if (score >= 60) this.analysis.grade = 'C';
    else if (score >= 50) this.analysis.grade = 'D';
    else this.analysis.grade = 'F';
    
    this.analysis.score = score;
  }

  generateRecommendations() {
    const recs = [];
    
    if (this.analysis.protocol !== 'https:') {
      recs.push({
        priority: 'critical',
        action: 'Enable HTTPS',
        benefit: 'Encrypt all data transmission'
      });
    }
    
    if (!this.analysis.securityHeaders['Strict-Transport-Security']) {
      recs.push({
        priority: 'high',
        action: 'Add Strict-Transport-Security header',
        benefit: 'Force HTTPS connections',
        implementation: 'Strict-Transport-Security: max-age=31536000; includeSubDomains'
      });
    }
    
    if (!this.analysis.securityHeaders['Content-Security-Policy']) {
      recs.push({
        priority: 'high',
        action: 'Implement Content Security Policy',
        benefit: 'Prevent XSS attacks',
        implementation: "Content-Security-Policy: default-src 'self'"
      });
    }
    
    if (this.analysis.certificate.mixedContent) {
      recs.push({
        priority: 'high',
        action: 'Fix mixed content issues',
        benefit: 'Ensure full HTTPS protection',
        details: `Update ${this.analysis.certificate.insecureResources} HTTP resources to HTTPS`
      });
    }
    
    this.analysis.recommendations = recs;
  }

  storeAnalysis() {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}_ssl`;
    
    chrome.storage.local.set({
      [storageKey]: {
        ...this.analysis,
        timestamp: Date.now(),
        url: window.location.href
      }
    });
    
    console.log('[SSL Analyzer] Analysis complete:', this.analysis);
  }
}

// Initialize
const sslAnalyzer = new SSLAnalyzer();
console.log('[Dr. DOM] SSL analyzer active');