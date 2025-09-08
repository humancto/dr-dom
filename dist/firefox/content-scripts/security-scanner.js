/**
 * Dr. DOM Security Scanner
 * Detects malicious scripts, tracking pixels, and generates safety scores
 */

const SecurityScanner = {
  // Known malicious patterns and indicators
  MALICIOUS_PATTERNS: {
    // Obfuscation patterns
    obfuscation: [
      /eval\s*\(/gi,
      /Function\s*\(['"`]/gi,
      /document\.write\s*\(/gi,
      /unescape\s*\(/gi,
      /String\.fromCharCode/gi,
      /atob\s*\(/gi,
      /btoa\s*\(/gi
    ],
    
    // Crypto mining patterns
    cryptoMining: [
      /coinhive/gi,
      /cryptonight/gi,
      /monero/gi,
      /coinimp/gi,
      /webminer/gi,
      /mineralt/gi,
      /webminepool/gi
    ],
    
    // Keylogger patterns
    keylogger: [
      /keypress|keydown|keyup/gi,
      /addEventListener.*key/gi,
      /onkeypress|onkeydown|onkeyup/gi
    ],
    
    // Data exfiltration
    dataTheft: [
      /document\.cookie/gi,
      /localStorage\./gi,
      /sessionStorage\./gi,
      /navigator\.clipboard/gi,
      /getUserMedia/gi
    ],
    
    // Suspicious redirects
    redirect: [
      /window\.location\s*=/gi,
      /location\.href\s*=/gi,
      /location\.replace/gi,
      /meta.*refresh/gi
    ],
    
    // Known malicious domains
    maliciousDomains: [
      'malware-domain.com',
      'phishing-site.net',
      'exploit-kit.org',
      // Add more from threat intelligence feeds
    ]
  },

  // Tracking pixel patterns
  TRACKING_PIXELS: {
    facebook: {
      patterns: ['facebook.com/tr', 'connect.facebook.net/en_US/fbevents.js'],
      name: 'Facebook Pixel',
      category: 'social'
    },
    google: {
      patterns: ['google-analytics.com/analytics.js', 'googletagmanager.com/gtag', 'google-analytics.com/ga.js', 'googleadservices.com/pagead/conversion'],
      name: 'Google Analytics/Ads',
      category: 'analytics'
    },
    linkedin: {
      patterns: ['px.ads.linkedin.com/collect', 'snap.licdn.com/li.lms-analytics'],
      name: 'LinkedIn Insight',
      category: 'professional'
    },
    twitter: {
      patterns: ['static.ads-twitter.com/uwt.js', 'analytics.twitter.com'],
      name: 'Twitter Pixel',
      category: 'social'
    },
    tiktok: {
      patterns: ['analytics.tiktok.com/i18n/pixel'],
      name: 'TikTok Pixel',
      category: 'social'
    },
    pinterest: {
      patterns: ['ct.pinterest.com/v3', 'assets.pinterest.com/js/pinit.js'],
      name: 'Pinterest Tag',
      category: 'social'
    },
    amazon: {
      patterns: ['amazon-adsystem.com/aax2/apstag'],
      name: 'Amazon Pixel',
      category: 'ecommerce'
    },
    hotjar: {
      patterns: ['static.hotjar.com/c/hotjar'],
      name: 'Hotjar',
      category: 'heatmap'
    },
    mixpanel: {
      patterns: ['cdn.mxpnl.com/libs/mixpanel', 'api.mixpanel.com'],
      name: 'Mixpanel',
      category: 'analytics'
    },
    segment: {
      patterns: ['cdn.segment.com/analytics.js'],
      name: 'Segment',
      category: 'analytics'
    },
    hubspot: {
      patterns: ['js.hs-scripts.com', 'track.hubspot.com'],
      name: 'HubSpot',
      category: 'marketing'
    },
    drift: {
      patterns: ['js.driftt.com/include'],
      name: 'Drift',
      category: 'chat'
    },
    intercom: {
      patterns: ['widget.intercom.io/widget'],
      name: 'Intercom',
      category: 'chat'
    },
    crisp: {
      patterns: ['client.crisp.chat'],
      name: 'Crisp',
      category: 'chat'
    }
  },

  // Known vulnerable libraries
  VULNERABLE_LIBRARIES: {
    'jquery': {
      vulnerable: ['1.', '2.0', '2.1', '2.2'],
      cve: ['CVE-2020-11022', 'CVE-2019-11358'],
      severity: 'medium'
    },
    'angular': {
      vulnerable: ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5'],
      cve: ['CVE-2020-7676'],
      severity: 'high'
    },
    'lodash': {
      vulnerable: ['4.17.0', '4.17.1', '4.17.2', '4.17.3', '4.17.4'],
      cve: ['CVE-2019-10744'],
      severity: 'high'
    },
    'moment': {
      vulnerable: ['2.29.0', '2.29.1'],
      cve: ['CVE-2022-31129'],
      severity: 'high'
    }
  },

  /**
   * Scan a script for malicious patterns
   */
  scanScript(scriptContent, scriptUrl = '') {
    const findings = {
      malicious: [],
      suspicious: [],
      obfuscation: 0,
      riskLevel: 'safe',
      score: 100
    };

    // Check for obfuscation
    this.MALICIOUS_PATTERNS.obfuscation.forEach(pattern => {
      const matches = scriptContent.match(pattern);
      if (matches) {
        findings.obfuscation += matches.length;
        findings.suspicious.push({
          type: 'obfuscation',
          pattern: pattern.source,
          count: matches.length
        });
      }
    });

    // Check for crypto mining
    this.MALICIOUS_PATTERNS.cryptoMining.forEach(pattern => {
      if (pattern.test(scriptContent)) {
        findings.malicious.push({
          type: 'crypto_mining',
          pattern: pattern.source,
          severity: 'critical'
        });
        findings.score -= 50;
      }
    });

    // Check for keyloggers
    const keyloggerMatches = scriptContent.match(/keypress|keydown|keyup/gi);
    if (keyloggerMatches && keyloggerMatches.length > 5) {
      findings.suspicious.push({
        type: 'potential_keylogger',
        count: keyloggerMatches.length,
        severity: 'high'
      });
      findings.score -= 20;
    }

    // Check for data theft patterns
    this.MALICIOUS_PATTERNS.dataTheft.forEach(pattern => {
      const matches = scriptContent.match(pattern);
      if (matches && matches.length > 3) {
        findings.suspicious.push({
          type: 'data_access',
          pattern: pattern.source,
          count: matches.length
        });
        findings.score -= 10;
      }
    });

    // Check against malicious domains
    this.MALICIOUS_PATTERNS.maliciousDomains.forEach(domain => {
      if (scriptUrl.includes(domain) || scriptContent.includes(domain)) {
        findings.malicious.push({
          type: 'known_malicious_domain',
          domain: domain,
          severity: 'critical'
        });
        findings.score -= 70;
      }
    });

    // Determine risk level
    if (findings.score < 30) {
      findings.riskLevel = 'critical';
    } else if (findings.score < 50) {
      findings.riskLevel = 'high';
    } else if (findings.score < 70) {
      findings.riskLevel = 'medium';
    } else if (findings.score < 90) {
      findings.riskLevel = 'low';
    } else {
      findings.riskLevel = 'safe';
    }

    return findings;
  },

  /**
   * Detect tracking pixels in requests
   */
  detectTrackingPixel(url) {
    const detectedPixels = [];
    
    for (const [key, pixel] of Object.entries(this.TRACKING_PIXELS)) {
      for (const pattern of pixel.patterns) {
        if (url.includes(pattern)) {
          detectedPixels.push({
            platform: key,
            name: pixel.name,
            category: pixel.category,
            url: url,
            timestamp: Date.now()
          });
          break;
        }
      }
    }
    
    return detectedPixels;
  },

  /**
   * Check for vulnerable libraries
   */
  checkVulnerableLibraries(scriptUrl, scriptContent) {
    const vulnerabilities = [];
    
    for (const [library, info] of Object.entries(this.VULNERABLE_LIBRARIES)) {
      // Check URL for library name and version
      const versionMatch = scriptUrl.match(new RegExp(`${library}[\\-\\.]?(\\d+\\.\\d+\\.?\\d*)`));
      if (versionMatch) {
        const version = versionMatch[1];
        const isVulnerable = info.vulnerable.some(v => version.startsWith(v));
        
        if (isVulnerable) {
          vulnerabilities.push({
            library: library,
            version: version,
            cve: info.cve,
            severity: info.severity
          });
        }
      }
      
      // Also check script content for version strings
      const contentMatch = scriptContent.match(new RegExp(`${library}.*v?(\\d+\\.\\d+\\.?\\d*)`));
      if (contentMatch) {
        const version = contentMatch[1];
        const isVulnerable = info.vulnerable.some(v => version.startsWith(v));
        
        if (isVulnerable) {
          vulnerabilities.push({
            library: library,
            version: version,
            cve: info.cve,
            severity: info.severity
          });
        }
      }
    }
    
    return vulnerabilities;
  },

  /**
   * Calculate overall safety score for the page
   */
  calculateSafetyScore(data) {
    let score = 100;
    const issues = [];
    
    // Check for malicious scripts
    const scripts = data.scripts || [];
    scripts.forEach(script => {
      const scanResult = this.scanScript(script.content || '', script.src || '');
      if (scanResult.riskLevel === 'critical') {
        score -= 30;
        issues.push({ type: 'malicious_script', severity: 'critical' });
      } else if (scanResult.riskLevel === 'high') {
        score -= 20;
        issues.push({ type: 'suspicious_script', severity: 'high' });
      }
    });
    
    // Check for tracking pixels (privacy impact)
    const requests = data.requests || [];
    const trackingPixels = [];
    requests.forEach(req => {
      const pixels = this.detectTrackingPixel(req.url);
      trackingPixels.push(...pixels);
    });
    
    // Deduct points based on number of trackers
    if (trackingPixels.length > 10) {
      score -= 20;
      issues.push({ type: 'excessive_tracking', count: trackingPixels.length, severity: 'medium' });
    } else if (trackingPixels.length > 5) {
      score -= 10;
      issues.push({ type: 'moderate_tracking', count: trackingPixels.length, severity: 'low' });
    }
    
    // Check for vulnerable libraries
    scripts.forEach(script => {
      const vulnerabilities = this.checkVulnerableLibraries(script.src || '', script.content || '');
      vulnerabilities.forEach(vuln => {
        if (vuln.severity === 'critical') {
          score -= 25;
        } else if (vuln.severity === 'high') {
          score -= 15;
        } else {
          score -= 5;
        }
        issues.push({ type: 'vulnerable_library', ...vuln });
      });
    });
    
    // Check for HTTPS
    const hasHttpResources = requests.some(req => req.url && req.url.startsWith('http://'));
    if (hasHttpResources) {
      score -= 15;
      issues.push({ type: 'mixed_content', severity: 'medium' });
    }
    
    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));
    
    return {
      score,
      grade: this.getGrade(score),
      issues,
      trackingPixels,
      summary: this.getSafetyS summary(score, issues)
    };
  },

  getGrade(score) {
    if (score >= 90) return { letter: 'A', color: '#10b981', emoji: '🛡️' };
    if (score >= 80) return { letter: 'B', color: '#84cc16', emoji: '✅' };
    if (score >= 70) return { letter: 'C', color: '#eab308', emoji: '⚠️' };
    if (score >= 60) return { letter: 'D', color: '#f97316', emoji: '⚡' };
    return { letter: 'F', color: '#ef4444', emoji: '🚨' };
  },

  getSafetySummary(score, issues) {
    if (score >= 90) return "Excellent! This site appears safe and respects privacy.";
    if (score >= 80) return "Good. Minor privacy concerns detected.";
    if (score >= 70) return "Fair. Several tracking mechanisms and potential issues found.";
    if (score >= 60) return "Poor. Multiple security or privacy concerns detected.";
    return "Critical! Serious security or privacy issues found. Exercise caution.";
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityScanner;
}