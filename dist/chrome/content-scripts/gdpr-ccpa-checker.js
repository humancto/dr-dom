/**
 * GDPR/CCPA Compliance Checker
 * Detects privacy law compliance issues
 */

class GDPRCCPAChecker {
  constructor() {
    this.compliance = {
      gdpr: {
        compliant: null,
        score: 0,
        violations: [],
        goodPractices: []
      },
      ccpa: {
        compliant: null,
        score: 0,
        violations: [],
        goodPractices: []
      },
      cookies: {
        hasConsentBanner: false,
        consentType: null,
        preCheckedBoxes: false,
        granularControl: false
      },
      privacy: {
        hasPrivacyPolicy: false,
        privacyPolicyAccessible: false,
        hasOptOut: false,
        hasDataDeletion: false
      }
    };
    
    this.init();
  }

  init() {
    // Start checking after page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.check());
    } else {
      setTimeout(() => this.check(), 1000);
    }
  }

  check() {
    console.log('[GDPR/CCPA] Starting compliance check...');
    
    // Check cookie consent
    this.checkCookieConsent();
    
    // Check privacy policy
    this.checkPrivacyPolicy();
    
    // Check tracking without consent
    this.checkTrackingConsent();
    
    // Check opt-out mechanisms
    this.checkOptOut();
    
    // Check data rights
    this.checkDataRights();
    
    // Check dark patterns
    this.checkDarkPatterns();
    
    // Calculate compliance scores
    this.calculateCompliance();
    
    // Store results
    this.storeResults();
    
    return this.compliance;
  }

  checkCookieConsent() {
    // Look for common consent management platforms
    const consentPlatforms = {
      'OneTrust': ['onetrust', 'optanon', 'ot-sdk'],
      'Cookiebot': ['cookiebot', 'CybotCookiebot'],
      'TrustArc': ['trustarc', 'truste'],
      'Quantcast': ['qc-cmp', 'quantcast-choice'],
      'Usercentrics': ['usercentrics'],
      'CookieYes': ['cookieyes'],
      'Termly': ['termly'],
      'Osano': ['osano'],
      'Cookie Script': ['cookie-script'],
      'CIVIC': ['civic-cookie']
    };
    
    let consentFound = false;
    let platform = null;
    
    // Check for consent platforms
    for (const [name, patterns] of Object.entries(consentPlatforms)) {
      for (const pattern of patterns) {
        if (document.querySelector(`[class*="${pattern}"], [id*="${pattern}"], script[src*="${pattern}"]`)) {
          consentFound = true;
          platform = name;
          break;
        }
      }
      if (consentFound) break;
    }
    
    // Check for generic consent banners
    const genericPatterns = [
      'cookie-consent', 'cookie-banner', 'cookie-notice',
      'privacy-banner', 'consent-banner', 'gdpr-banner',
      'cookie-popup', 'cookie-bar', 'cookie-policy'
    ];
    
    if (!consentFound) {
      for (const pattern of genericPatterns) {
        const element = document.querySelector(`[class*="${pattern}"], [id*="${pattern}"]`);
        if (element && this.isVisible(element)) {
          consentFound = true;
          platform = 'Generic';
          
          // Check consent quality
          this.analyzeConsentBanner(element);
          break;
        }
      }
    }
    
    this.compliance.cookies.hasConsentBanner = consentFound;
    this.compliance.cookies.platform = platform;
    
    if (consentFound) {
      this.compliance.gdpr.goodPractices.push('Has cookie consent mechanism');
      
      // Check for granular control
      const hasReject = this.findButton(['reject', 'decline', 'deny', 'refuse']);
      const hasAccept = this.findButton(['accept', 'agree', 'allow']);
      const hasSettings = this.findButton(['settings', 'preferences', 'customize', 'manage']);
      
      if (hasReject) {
        this.compliance.cookies.hasRejectButton = true;
        this.compliance.gdpr.goodPractices.push('Provides clear reject option');
      } else {
        this.compliance.gdpr.violations.push({
          severity: 'high',
          rule: 'GDPR Article 7',
          issue: 'No clear option to reject cookies',
          recommendation: 'Add equally prominent "Reject All" button'
        });
      }
      
      if (hasSettings) {
        this.compliance.cookies.granularControl = true;
        this.compliance.gdpr.goodPractices.push('Offers granular cookie control');
      }
    } else {
      // Check if site sets tracking cookies without consent
      const trackingCookies = this.detectTrackingCookies();
      if (trackingCookies.length > 0) {
        this.compliance.gdpr.violations.push({
          severity: 'critical',
          rule: 'GDPR Article 6',
          issue: `Setting ${trackingCookies.length} tracking cookies without consent`,
          recommendation: 'Implement cookie consent before setting tracking cookies',
          details: trackingCookies
        });
      }
    }
  }

  analyzeConsentBanner(element) {
    const text = element.textContent.toLowerCase();
    
    // Check for misleading language
    if (text.includes('by continuing') || text.includes('by using this site')) {
      this.compliance.gdpr.violations.push({
        severity: 'high',
        rule: 'GDPR Article 7',
        issue: 'Implied consent through continued browsing',
        recommendation: 'Require explicit opt-in action'
      });
    }
    
    // Check for pre-checked boxes
    const checkboxes = element.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      if (checkbox.checked && !checkbox.disabled) {
        const label = checkbox.labels[0]?.textContent || '';
        if (label.toLowerCase().includes('marketing') || 
            label.toLowerCase().includes('analytics') ||
            label.toLowerCase().includes('advertising')) {
          this.compliance.cookies.preCheckedBoxes = true;
          this.compliance.gdpr.violations.push({
            severity: 'critical',
            rule: 'GDPR Article 7(2)',
            issue: 'Pre-checked consent boxes for non-essential cookies',
            recommendation: 'Remove pre-checked state from optional cookies',
            details: label
          });
        }
      }
    });
  }

  checkPrivacyPolicy() {
    // Look for privacy policy links
    const privacyPatterns = [
      'privacy policy', 'privacy notice', 'privacy statement',
      'data protection', 'datenschutz', 'politique de confidentialité',
      'privacidad', 'privacy'
    ];
    
    let privacyLink = null;
    
    for (const pattern of privacyPatterns) {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent.toLowerCase().includes(pattern) ||
            link.href.toLowerCase().includes(pattern.replace(' ', '-'))) {
          privacyLink = link;
          break;
        }
      }
      if (privacyLink) break;
    }
    
    if (privacyLink) {
      this.compliance.privacy.hasPrivacyPolicy = true;
      
      // Check if easily accessible (in footer or header)
      const footer = document.querySelector('footer');
      const header = document.querySelector('header');
      
      if ((footer && footer.contains(privacyLink)) || 
          (header && header.contains(privacyLink))) {
        this.compliance.privacy.privacyPolicyAccessible = true;
        this.compliance.gdpr.goodPractices.push('Privacy policy easily accessible');
      }
      
      // Check privacy policy content (if on same domain)
      if (privacyLink.href.includes(window.location.hostname)) {
        this.analyzePrivacyPolicy(privacyLink.href);
      }
    } else {
      this.compliance.gdpr.violations.push({
        severity: 'critical',
        rule: 'GDPR Article 13',
        issue: 'No privacy policy link found',
        recommendation: 'Add clear link to privacy policy'
      });
      
      this.compliance.ccpa.violations.push({
        severity: 'critical',
        rule: 'CCPA Section 1798.100',
        issue: 'No privacy policy link found',
        recommendation: 'Add privacy policy as required by CCPA'
      });
    }
  }

  async analyzePrivacyPolicy(url) {
    // Would need to fetch and analyze the privacy policy
    // For now, we'll note that it exists
    console.log('[GDPR/CCPA] Privacy policy found at:', url);
  }

  checkTrackingConsent() {
    // Get tracking data from storage
    const domain = window.location.hostname;
    chrome.storage.local.get(`drDOM_${domain}_privacy`, (result) => {
      const privacyData = result[`drDOM_${domain}_privacy`];
      
      if (privacyData && privacyData.trackers && privacyData.trackers.length > 0) {
        // Check if consent was given before tracking
        if (!this.compliance.cookies.hasConsentBanner) {
          this.compliance.gdpr.violations.push({
            severity: 'critical',
            rule: 'GDPR Article 6',
            issue: `${privacyData.trackers.length} trackers active without consent mechanism`,
            recommendation: 'Implement consent before loading trackers',
            details: privacyData.trackers.slice(0, 5).map(t => t.domain)
          });
        }
      }
    });
  }

  checkOptOut() {
    // Look for opt-out mechanisms
    const optOutPatterns = [
      'do not sell', 'opt-out', 'opt out', 'unsubscribe',
      'cookie settings', 'privacy settings', 'manage preferences',
      'your privacy choices', 'privacy rights'
    ];
    
    let optOutFound = false;
    
    // Check all links and buttons for opt-out text
    const allElements = document.querySelectorAll('a, button');
    for (const element of allElements) {
      const text = element.textContent.toLowerCase();
      for (const pattern of optOutPatterns) {
        if (text.includes(pattern)) {
          optOutFound = true;
          break;
        }
      }
      if (optOutFound) break;
    }
    
    // Also check body text as fallback
    if (!optOutFound) {
      const bodyText = document.body.textContent.toLowerCase();
      for (const pattern of optOutPatterns) {
        if (bodyText.includes(pattern)) {
          optOutFound = true;
          break;
        }
      }
    }
    
    // CCPA specific - look for "Do Not Sell" link
    const doNotSell = this.findText(['do not sell my personal information', 'do not sell']);
    
    if (doNotSell) {
      this.compliance.privacy.hasOptOut = true;
      this.compliance.ccpa.goodPractices.push('Has "Do Not Sell" link (CCPA requirement)');
    } else {
      // Only a violation if site likely serves California users
      if (this.likelyServesCalifornia()) {
        this.compliance.ccpa.violations.push({
          severity: 'high',
          rule: 'CCPA Section 1798.135',
          issue: 'Missing "Do Not Sell My Personal Information" link',
          recommendation: 'Add opt-out link for California residents'
        });
      }
    }
    
    this.compliance.privacy.hasOptOut = optOutFound || doNotSell;
  }

  checkDataRights() {
    // Check for data deletion/access rights
    const dataRightsPatterns = [
      'delete my data', 'delete account', 'data deletion',
      'access my data', 'download my data', 'data portability',
      'right to be forgotten', 'erasure', 'data rights'
    ];
    
    let dataRightsFound = false;
    
    for (const pattern of dataRightsPatterns) {
      if (document.body.textContent.toLowerCase().includes(pattern)) {
        dataRightsFound = true;
        break;
      }
    }
    
    if (dataRightsFound) {
      this.compliance.privacy.hasDataDeletion = true;
      this.compliance.gdpr.goodPractices.push('Mentions data subject rights');
    } else {
      this.compliance.gdpr.violations.push({
        severity: 'medium',
        rule: 'GDPR Chapter 3',
        issue: 'No clear information about data subject rights',
        recommendation: 'Add information about data access, portability, and deletion rights'
      });
    }
  }

  checkDarkPatterns() {
    // Check for deceptive UX patterns
    const darkPatterns = [];
    
    // Check for hidden decline buttons
    const acceptButton = this.findButton(['accept', 'agree']);
    const rejectButton = this.findButton(['reject', 'decline']);
    
    if (acceptButton && rejectButton) {
      const acceptStyle = window.getComputedStyle(acceptButton);
      const rejectStyle = window.getComputedStyle(rejectButton);
      
      // Check if reject is less prominent
      if (acceptStyle.backgroundColor !== rejectStyle.backgroundColor ||
          parseFloat(acceptStyle.fontSize) > parseFloat(rejectStyle.fontSize)) {
        darkPatterns.push({
          type: 'Unequal prominence',
          issue: 'Accept button more prominent than reject',
          element: 'Cookie consent'
        });
      }
    }
    
    // Check for forced action
    const modalOverlays = document.querySelectorAll('[class*="modal"], [class*="overlay"]');
    modalOverlays.forEach(modal => {
      if (this.isVisible(modal) && !modal.querySelector('[class*="close"], [class*="dismiss"]')) {
        darkPatterns.push({
          type: 'Forced action',
          issue: 'Modal without close option',
          element: 'Consent modal'
        });
      }
    });
    
    if (darkPatterns.length > 0) {
      this.compliance.gdpr.violations.push({
        severity: 'high',
        rule: 'GDPR Article 7 - Freely given consent',
        issue: 'Dark patterns detected in consent flow',
        recommendation: 'Remove deceptive UX patterns',
        details: darkPatterns
      });
    }
  }

  calculateCompliance() {
    // Calculate GDPR score
    let gdprScore = 100;
    this.compliance.gdpr.violations.forEach(violation => {
      if (violation.severity === 'critical') gdprScore -= 25;
      else if (violation.severity === 'high') gdprScore -= 15;
      else if (violation.severity === 'medium') gdprScore -= 10;
      else if (violation.severity === 'low') gdprScore -= 5;
    });
    
    // Add points for good practices
    gdprScore += this.compliance.gdpr.goodPractices.length * 5;
    
    this.compliance.gdpr.score = Math.max(0, Math.min(100, gdprScore));
    this.compliance.gdpr.compliant = gdprScore >= 70;
    
    // Calculate CCPA score
    let ccpaScore = 100;
    this.compliance.ccpa.violations.forEach(violation => {
      if (violation.severity === 'critical') ccpaScore -= 30;
      else if (violation.severity === 'high') ccpaScore -= 20;
      else if (violation.severity === 'medium') ccpaScore -= 10;
    });
    
    ccpaScore += this.compliance.ccpa.goodPractices.length * 10;
    
    this.compliance.ccpa.score = Math.max(0, Math.min(100, ccpaScore));
    this.compliance.ccpa.compliant = ccpaScore >= 60;
    
    // Overall compliance
    this.compliance.overall = {
      score: Math.round((gdprScore + ccpaScore) / 2),
      grade: this.getGrade((gdprScore + ccpaScore) / 2),
      summary: this.generateSummary()
    };
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  generateSummary() {
    const violations = this.compliance.gdpr.violations.length + this.compliance.ccpa.violations.length;
    
    if (violations === 0) {
      return 'Excellent privacy compliance!';
    } else if (violations <= 2) {
      return 'Good compliance with minor issues';
    } else if (violations <= 5) {
      return 'Several compliance issues need attention';
    } else {
      return 'Serious privacy compliance violations detected';
    }
  }

  storeResults() {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}_compliance`;
    
    chrome.storage.local.set({
      [storageKey]: {
        ...this.compliance,
        timestamp: Date.now(),
        url: window.location.href
      }
    });
    
    console.log('[GDPR/CCPA] Compliance check complete:', this.compliance);
  }

  // Helper functions
  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  findButton(patterns) {
    // Direct text search since :contains() is jQuery-specific
    const buttons = document.querySelectorAll('button, a[role="button"], a');
    for (const button of buttons) {
      const text = button.textContent.toLowerCase();
      for (const pattern of patterns) {
        if (text.includes(pattern) && this.isVisible(button)) {
          return button;
        }
      }
    }
    
    return null;
  }

  findText(patterns) {
    for (const pattern of patterns) {
      const elements = document.querySelectorAll('a, button, span, div');
      for (const element of elements) {
        if (element.textContent.toLowerCase().includes(pattern.toLowerCase())) {
          return element;
        }
      }
    }
    return null;
  }

  detectTrackingCookies() {
    const trackingPatterns = [
      '_ga', '_gid', '_gat', // Google Analytics
      '_fbp', 'fbm_', // Facebook
      '__utm', // Campaign tracking
      '_pk_', // Matomo
      '_hj', // Hotjar
      'mp_', // Mixpanel
      'ajs_' // Segment
    ];
    
    const cookies = document.cookie.split(';');
    const trackingCookies = [];
    
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      for (const pattern of trackingPatterns) {
        if (name.includes(pattern)) {
          trackingCookies.push(name);
          break;
        }
      }
    });
    
    return trackingCookies;
  }

  likelyServesCalifornia() {
    // Simple heuristic - most major sites serve CA users
    // Could be enhanced with geo-detection
    const domain = window.location.hostname;
    const majorDomains = ['.com', '.org', '.net', '.io'];
    
    return majorDomains.some(tld => domain.endsWith(tld));
  }
}

// Initialize
const complianceChecker = new GDPRCCPAChecker();
console.log('[Dr. DOM] GDPR/CCPA compliance checker active');