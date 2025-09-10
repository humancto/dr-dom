/**
 * Privacy Scoring System for Dr. DOM
 * Transparent, rule-based privacy grading
 */

class PrivacyScorer {
  constructor() {
    // Penalty weights for different violations
    this.PENALTIES = {
      // Tracker types (per tracker)
      fingerprinting: 15,  // Most severe - uniquely identifies you
      dataBrokers: 10,     // Sell your data
      advertising: 5,      // Build ad profiles
      analytics: 3,        // Track behavior
      social: 4,           // Connect identity across sites
      cdp: 2,              // Customer data platforms
      
      // Company diversity
      companies: {
        low: 0,      // 1-3 companies
        medium: 5,   // 4-5 companies
        high: 10,    // 6-10 companies
        extreme: 15, // 11-20 companies
        nightmare: 20 // 20+ companies
      },
      
      // Cookie violations
      trackingCookie: 2,   // Per tracking cookie (max 20)
      noConsent: 8,        // No consent mechanism
      
      // Security issues
      httpRequests: 5,     // Non-HTTPS
      mixedContent: 3      // Mixed HTTP/HTTPS
    };
    
    // Grade thresholds
    this.GRADES = {
      'A+': { min: 95, color: '#0d7e0d', label: 'Privacy Champion' },
      'A': { min: 90, color: '#4CAF50', label: 'Privacy Respecting' },
      'B': { min: 75, color: '#8BC34A', label: 'Reasonable Privacy' },
      'C': { min: 60, color: '#FFC107', label: 'Average Privacy' },
      'D': { min: 40, color: '#FF9800', label: 'Poor Privacy' },
      'F': { min: 0, color: '#F44336', label: 'Privacy Nightmare' }
    };
  }
  
  calculateScore(data) {
    let score = 100;
    const details = {
      violations: [],
      positives: [],
      breakdown: {},
      badges: []
    };
    
    // 1. TRACKER PENALTIES
    const trackers = data.trackers || [];
    const categories = this.categorizeTrackers(trackers);
    
    // Fingerprinting (Critical)
    if (categories.fingerprinting > 0) {
      const penalty = categories.fingerprinting * this.PENALTIES.fingerprinting;
      score -= penalty;
      details.violations.push({
        type: 'critical',
        message: `🚨 CRITICAL: ${categories.fingerprinting} fingerprinting attempts detected!`,
        detail: 'Your device is being uniquely identified',
        penalty: penalty
      });
    }
    
    // Data Brokers (High)
    if (categories.dataBrokers > 0) {
      const penalty = Math.min(categories.dataBrokers * this.PENALTIES.dataBrokers, 30);
      score -= penalty;
      details.violations.push({
        type: 'high',
        message: `⚠️ ${categories.dataBrokers} data brokers are harvesting your information`,
        detail: 'Your data may be sold to third parties',
        penalty: penalty
      });
    }
    
    // Advertising (High)
    if (categories.advertising > 0) {
      const penalty = Math.min(categories.advertising * this.PENALTIES.advertising, 25);
      score -= penalty;
      details.violations.push({
        type: 'high',
        message: `📢 ${categories.advertising} advertising networks tracking you`,
        detail: 'Building profiles for targeted ads',
        penalty: penalty
      });
    }
    
    // Analytics (Medium)
    if (categories.analytics > 0) {
      const penalty = Math.min(categories.analytics * this.PENALTIES.analytics, 15);
      score -= penalty;
      details.violations.push({
        type: 'medium',
        message: `📊 ${categories.analytics} analytics services monitoring behavior`,
        detail: 'Tracking your interactions and patterns',
        penalty: penalty
      });
    }
    
    // Social (Medium)
    if (categories.social > 0) {
      const penalty = Math.min(categories.social * this.PENALTIES.social, 12);
      score -= penalty;
      details.violations.push({
        type: 'medium',
        message: `👥 ${categories.social} social media trackers present`,
        detail: 'Connecting your identity across platforms',
        penalty: penalty
      });
    }
    
    // 2. COMPANY DIVERSITY PENALTY
    const companies = this.getUniqueCompanies(trackers);
    let companyPenalty = 0;
    
    if (companies.size > 20) {
      companyPenalty = this.PENALTIES.companies.nightmare;
      details.violations.push({
        type: 'high',
        message: `🏢 ${companies.size} different companies tracking you!`,
        detail: 'Massive surveillance network',
        penalty: companyPenalty
      });
    } else if (companies.size > 10) {
      companyPenalty = this.PENALTIES.companies.extreme;
      details.violations.push({
        type: 'high',
        message: `🏢 ${companies.size} companies monitoring your activity`,
        detail: 'Extensive tracking ecosystem',
        penalty: companyPenalty
      });
    } else if (companies.size > 5) {
      companyPenalty = this.PENALTIES.companies.high;
      details.violations.push({
        type: 'medium',
        message: `🏢 ${companies.size} companies collecting your data`,
        detail: 'Moderate tracking network',
        penalty: companyPenalty
      });
    } else if (companies.size > 3) {
      companyPenalty = this.PENALTIES.companies.medium;
    }
    
    score -= companyPenalty;
    
    // 3. COOKIE VIOLATIONS
    const cookies = data.cookies || [];
    const trackingCookies = this.identifyTrackingCookies(cookies);
    
    if (trackingCookies.length > 0) {
      const penalty = Math.min(trackingCookies.length * this.PENALTIES.trackingCookie, 20);
      score -= penalty;
      details.violations.push({
        type: 'medium',
        message: `🍪 ${trackingCookies.length} tracking cookies found`,
        detail: 'Persistent tracking across sessions',
        penalty: penalty
      });
    }
    
    // 4. SECURITY ISSUES
    if (data.hasHTTP) {
      score -= this.PENALTIES.httpRequests;
      details.violations.push({
        type: 'security',
        message: '🔓 Insecure HTTP connections detected',
        detail: 'Data transmitted without encryption',
        penalty: this.PENALTIES.httpRequests
      });
    }
    
    // 5. POSITIVE SIGNALS
    if (score >= 90) {
      details.positives.push('✅ Excellent privacy practices');
    }
    
    if (!data.hasHTTP && data.requests?.length > 0) {
      details.positives.push('🔒 All connections encrypted (HTTPS)');
    }
    
    if (companies.size <= 3 && trackers.length > 0) {
      details.positives.push('👍 Minimal third-party sharing');
    }
    
    if (trackers.length === 0) {
      details.positives.push('🎉 No trackers detected!');
      details.badges.push('tracking-free');
    }
    
    // 6. SPECIAL BADGES
    if (categories.fingerprinting > 0 && categories.dataBrokers > 3 && trackers.length > 30) {
      details.badges.push('surveillance-capitalism');
    }
    
    if (trackingCookies.length > 10 && !data.hasConsent) {
      details.badges.push('gdpr-concern');
    }
    
    if (score >= 90) {
      details.badges.push('privacy-friendly');
    }
    
    // 7. CALCULATE FINAL GRADE
    score = Math.max(0, Math.min(100, score));
    const grade = this.getGrade(score);
    
    // 8. GENERATE SUMMARY
    let summary = '';
    if (score >= 90) {
      summary = `Excellent privacy! Only ${trackers.length} trackers from ${companies.size} companies.`;
    } else if (score >= 75) {
      summary = `Reasonable privacy. ${trackers.length} trackers from ${companies.size} companies detected.`;
    } else if (score >= 60) {
      summary = `Average privacy. ${trackers.length} trackers from ${companies.size} companies monitoring you.`;
    } else if (score >= 40) {
      summary = `Poor privacy! ${trackers.length} trackers from ${companies.size} companies harvesting data.`;
    } else {
      summary = `Privacy nightmare! ${trackers.length} trackers from ${companies.size} companies surveilling you.`;
    }
    
    // 9. RECOMMENDATIONS
    const recommendations = this.getRecommendations(score, categories);
    
    return {
      score: score,
      grade: grade.grade,
      gradeColor: grade.color,
      gradeLabel: grade.label,
      summary: summary,
      trackerCount: trackers.length,
      companyCount: companies.size,
      details: details,
      breakdown: {
        fingerprinting: categories.fingerprinting,
        dataBrokers: categories.dataBrokers,
        advertising: categories.advertising,
        analytics: categories.analytics,
        social: categories.social,
        trackingCookies: trackingCookies.length
      },
      recommendations: recommendations
    };
  }
  
  categorizeTrackers(trackers) {
    const categories = {
      fingerprinting: 0,
      dataBrokers: 0,
      advertising: 0,
      analytics: 0,
      social: 0,
      cdp: 0,
      other: 0
    };
    
    trackers.forEach(tracker => {
      const cat = tracker.category || 'other';
      if (categories.hasOwnProperty(cat)) {
        categories[cat]++;
      } else {
        categories.other++;
      }
    });
    
    return categories;
  }
  
  getUniqueCompanies(trackers) {
    const companies = new Set();
    trackers.forEach(tracker => {
      // Extract company name from domain
      const domain = tracker.domain || '';
      const company = domain.split('.')[0].toLowerCase();
      if (company) companies.add(company);
    });
    return companies;
  }
  
  identifyTrackingCookies(cookies) {
    const trackingPatterns = [
      '_ga', '_gid', '_gat', // Google
      '_fbp', 'fbm_', // Facebook
      '_pinterest', // Pinterest
      'personalization_id', // Twitter
      '__hssc', '__hstc', // HubSpot
      '_mkto_trk', // Marketo
      'optimizely', // Optimizely
      '_hjid', // Hotjar
      'mp_', // Mixpanel
      'amplitude_', // Amplitude
      'ajs_' // Segment
    ];
    
    return cookies.filter(cookie => {
      const name = (cookie.name || '').toLowerCase();
      return trackingPatterns.some(pattern => name.includes(pattern));
    });
  }
  
  getGrade(score) {
    if (score >= 95) return this.GRADES['A+'];
    if (score >= 90) return this.GRADES['A'];
    if (score >= 75) return this.GRADES['B'];
    if (score >= 60) return this.GRADES['C'];
    if (score >= 40) return this.GRADES['D'];
    return this.GRADES['F'];
  }
  
  getRecommendations(score, categories) {
    const recommendations = [];
    
    if (score >= 90) {
      recommendations.push({
        icon: '✅',
        text: 'This site respects your privacy. No additional protection needed.'
      });
    } else if (score >= 70) {
      recommendations.push({
        icon: '🛡️',
        text: 'Consider using an ad blocker for enhanced protection.',
        tools: ['uBlock Origin']
      });
    } else if (score >= 50) {
      recommendations.push({
        icon: '⚠️',
        text: 'Moderate tracking detected. Recommended tools:',
        tools: ['uBlock Origin', 'Privacy Badger']
      });
    } else if (score >= 30) {
      recommendations.push({
        icon: '🚨',
        text: 'Heavy surveillance! Use multiple privacy tools:',
        tools: ['uBlock Origin', 'Privacy Badger', 'VPN', 'Cookie AutoDelete']
      });
    } else {
      recommendations.push({
        icon: '💀',
        text: 'Extreme tracking! Consider avoiding this site or use:',
        tools: ['Tor Browser', 'VPN + uBlock Origin', 'Temporary Containers']
      });
    }
    
    // Specific recommendations
    if (categories.fingerprinting > 0) {
      recommendations.push({
        icon: '🔍',
        text: 'Fingerprinting detected! Use Firefox with resist fingerprinting enabled.'
      });
    }
    
    if (categories.dataBrokers > 2) {
      recommendations.push({
        icon: '📊',
        text: 'Data brokers present. Consider opting out at optout.aboutads.info'
      });
    }
    
    return recommendations;
  }
}

// Initialize and expose to extension
window.PrivacyScorer = new PrivacyScorer();

// Auto-calculate when privacy data is available
setInterval(() => {
  const domain = window.location.hostname;
  const storageKey = `drDOM_${domain}_privacy`;
  
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(storageKey, (result) => {
      if (result[storageKey]) {
        const score = window.PrivacyScorer.calculateScore(result[storageKey]);
        
        // Store the detailed score
        chrome.storage.local.set({
          [`${storageKey}_score`]: score
        });
        
        console.log(`[Privacy Score] ${score.grade} (${score.score}/100) - ${score.summary}`);
      }
    });
  }
}, 3000);