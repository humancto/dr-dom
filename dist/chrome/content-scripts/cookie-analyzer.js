/**
 * Cookie Analyzer - GDPR/CCPA Compliance Checking
 * Analyzes cookies for privacy compliance and categorization
 */

class CookieAnalyzer {
  constructor() {
    this.cookieCategories = {
      essential: [
        'session', 'sessionid', 'csrftoken', 'csrf', 'auth', 'authorization',
        'login', 'secure', 'security', '__Host-', '__Secure-'
      ],
      functional: [
        'preference', 'language', 'lang', 'locale', 'timezone', 'currency',
        'theme', 'font', 'accessibility'
      ],
      analytics: [
        '_ga', '_gid', '_gat', 'analytics', 'stats', 'metrics', 'tracking',
        '_utm', 'amplitude', 'mixpanel', 'segment', 'heap', 'plausible'
      ],
      marketing: [
        'fbp', 'fbc', 'facebook', 'doubleclick', 'adsense', 'adwords',
        'campaign', 'affiliate', 'partner', 'referral', 'promo'
      ],
      tracking: [
        'pixel', 'beacon', 'track', 'visitor', 'user_id', 'client_id',
        'device_id', 'fingerprint', 'uuid'
      ]
    };
  }

  async analyzeCookies() {
    const cookies = await this.getAllCookies();
    const categorized = this.categorizeCookies(cookies);
    const compliance = this.checkCompliance(categorized);
    const risks = this.assessPrivacyRisks(cookies);
    
    return {
      total: cookies.length,
      categorized,
      compliance,
      risks,
      details: cookies
    };
  }

  async getAllCookies() {
    return new Promise((resolve) => {
      if (chrome?.cookies?.getAll) {
        // Extension context with cookies API
        chrome.cookies.getAll({}, (cookies) => {
          resolve(cookies.map(cookie => this.normalizeCookie(cookie)));
        });
      } else {
        // Content script context - use document.cookie
        const cookies = this.parseDocumentCookies();
        resolve(cookies);
      }
    });
  }

  parseDocumentCookies() {
    const cookieString = document.cookie;
    if (!cookieString) return [];
    
    return cookieString.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return {
        name: name,
        value: value || '',
        domain: window.location.hostname,
        path: '/',
        secure: window.location.protocol === 'https:',
        httpOnly: false, // Can't detect from document.cookie
        sameSite: 'unspecified',
        size: (name + value).length,
        category: this.categorizeByName(name)
      };
    });
  }

  normalizeCookie(cookie) {
    return {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      expirationDate: cookie.expirationDate,
      size: (cookie.name + cookie.value).length,
      category: this.categorizeByName(cookie.name),
      isThirdParty: this.isThirdPartyCookie(cookie),
      lifespan: this.calculateLifespan(cookie)
    };
  }

  categorizeByName(name) {
    const lowerName = name.toLowerCase();
    
    for (const [category, patterns] of Object.entries(this.cookieCategories)) {
      if (patterns.some(pattern => lowerName.includes(pattern))) {
        return category;
      }
    }
    
    return 'unknown';
  }

  categorizeCookies(cookies) {
    const categories = {
      essential: [],
      functional: [],
      analytics: [],
      marketing: [],
      tracking: [],
      unknown: []
    };
    
    cookies.forEach(cookie => {
      const category = cookie.category || 'unknown';
      if (categories[category]) {
        categories[category].push(cookie);
      }
    });
    
    return categories;
  }

  isThirdPartyCookie(cookie) {
    if (!cookie.domain) return false;
    const currentDomain = window.location.hostname;
    return !currentDomain.includes(cookie.domain.replace(/^\./, ''));
  }

  calculateLifespan(cookie) {
    if (!cookie.expirationDate) return 'session';
    
    const now = Date.now() / 1000;
    const expiration = cookie.expirationDate;
    const daysRemaining = Math.floor((expiration - now) / (60 * 60 * 24));
    
    if (daysRemaining > 365) return 'persistent';
    if (daysRemaining > 30) return 'long-term';
    if (daysRemaining > 7) return 'medium-term';
    if (daysRemaining > 0) return 'short-term';
    return 'expired';
  }

  checkCompliance(categorizedCookies) {
    const issues = [];
    const compliance = {
      gdpr: true,
      ccpa: true,
      issues: []
    };
    
    // Check for non-essential cookies without consent mechanism
    const nonEssential = [
      ...categorizedCookies.analytics,
      ...categorizedCookies.marketing,
      ...categorizedCookies.tracking
    ];
    
    if (nonEssential.length > 0) {
      // Check for consent cookie
      const hasConsentCookie = categorizedCookies.essential.some(cookie => 
        cookie.name.toLowerCase().includes('consent') ||
        cookie.name.toLowerCase().includes('gdpr') ||
        cookie.name.toLowerCase().includes('ccpa')
      );
      
      if (!hasConsentCookie) {
        compliance.gdpr = false;
        compliance.issues.push({
          type: 'no_consent_mechanism',
          severity: 'high',
          message: `${nonEssential.length} non-essential cookies found without consent mechanism`
        });
      }
    }
    
    // Check for third-party cookies
    const thirdPartyCookies = [...Object.values(categorizedCookies).flat()]
      .filter(cookie => cookie.isThirdParty);
    
    if (thirdPartyCookies.length > 5) {
      compliance.issues.push({
        type: 'excessive_third_party',
        severity: 'medium',
        message: `${thirdPartyCookies.length} third-party cookies detected`
      });
    }
    
    // Check for tracking cookies
    if (categorizedCookies.tracking.length > 0) {
      compliance.ccpa = false;
      compliance.issues.push({
        type: 'tracking_cookies',
        severity: 'high',
        message: `${categorizedCookies.tracking.length} tracking cookies that may violate CCPA`
      });
    }
    
    // Check for insecure cookies
    const insecureCookies = [...Object.values(categorizedCookies).flat()]
      .filter(cookie => !cookie.secure && cookie.category === 'essential');
    
    if (insecureCookies.length > 0) {
      compliance.issues.push({
        type: 'insecure_cookies',
        severity: 'high',
        message: `${insecureCookies.length} essential cookies transmitted over HTTP`
      });
    }
    
    return compliance;
  }

  assessPrivacyRisks(cookies) {
    const risks = [];
    
    // Check for fingerprinting cookies
    const fingerprintingPatterns = ['fingerprint', 'fp', 'device_id', 'machine_id', 'hw_id'];
    const fingerprintingCookies = cookies.filter(cookie =>
      fingerprintingPatterns.some(pattern => 
        cookie.name.toLowerCase().includes(pattern)
      )
    );
    
    if (fingerprintingCookies.length > 0) {
      risks.push({
        type: 'fingerprinting',
        severity: 'high',
        cookies: fingerprintingCookies.map(c => c.name),
        message: 'Potential device fingerprinting detected'
      });
    }
    
    // Check for super cookies (very long expiration)
    const superCookies = cookies.filter(cookie => 
      cookie.lifespan === 'persistent'
    );
    
    if (superCookies.length > 0) {
      risks.push({
        type: 'super_cookies',
        severity: 'medium',
        cookies: superCookies.map(c => c.name),
        message: `${superCookies.length} cookies with excessive lifespan (>1 year)`
      });
    }
    
    // Check for cross-site tracking
    const crossSiteTracking = cookies.filter(cookie =>
      cookie.isThirdParty && 
      (cookie.category === 'tracking' || cookie.category === 'marketing')
    );
    
    if (crossSiteTracking.length > 0) {
      risks.push({
        type: 'cross_site_tracking',
        severity: 'high',
        cookies: crossSiteTracking.map(c => c.name),
        message: 'Cross-site tracking cookies detected'
      });
    }
    
    // Check for PII in cookies
    const piiPatterns = [
      /email/i,
      /phone/i,
      /ssn/i,
      /credit/i,
      /password/i,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email regex
    ];
    
    const piiCookies = cookies.filter(cookie => {
      const content = cookie.name + cookie.value;
      return piiPatterns.some(pattern => pattern.test(content));
    });
    
    if (piiCookies.length > 0) {
      risks.push({
        type: 'pii_exposure',
        severity: 'critical',
        cookies: piiCookies.map(c => c.name),
        message: 'Potentially sensitive personal information in cookies'
      });
    }
    
    return risks;
  }

  generatePrivacyScore(analysis) {
    let score = 100;
    
    // Deduct for compliance issues
    if (!analysis.compliance.gdpr) score -= 20;
    if (!analysis.compliance.ccpa) score -= 20;
    
    // Deduct for privacy risks
    analysis.risks.forEach(risk => {
      switch(risk.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });
    
    // Deduct for excessive cookies
    const cookieCount = analysis.total;
    if (cookieCount > 50) score -= 15;
    else if (cookieCount > 30) score -= 10;
    else if (cookieCount > 20) score -= 5;
    
    // Deduct for unknown cookies
    const unknownCount = analysis.categorized.unknown.length;
    if (unknownCount > 10) score -= 10;
    else if (unknownCount > 5) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieAnalyzer;
}