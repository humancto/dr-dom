/**
 * Dr. DOM Unified Tracker Data Manager
 * Centralizes all tracker, cookie, and pixel detection data
 * Ensures consistency across all UI components
 */

class UnifiedTrackerData {
  constructor() {
    this.data = {
      // Cookies
      cookies: {
        all: [],
        essential: [],
        tracking: [],
        analytics: [],
        marketing: [],
        functional: []
      },
      
      // Trackers
      trackers: {
        all: new Set(),
        analytics: new Set(),
        advertising: new Set(),
        social: new Set(),
        fingerprinting: new Set()
      },
      
      // Pixels
      pixels: {
        all: new Set(),
        facebook: new Set(),
        google: new Set(),
        amazon: new Set(),
        other: new Set()
      },
      
      // Technologies (if we want to restore this)
      technologies: {
        frameworks: [],
        analytics: [],
        cms: [],
        cdn: []
      },
      
      // Stats
      stats: {
        privacyScore: 100,
        trackersBlocked: 0,
        cookiesCleaned: 0,
        pixelsDetected: 0,
        dataValueSaved: 0,
        fingerprintAttempts: 0
      }
    };
    
    this.init();
  }

  init() {
    console.log('📊 [Unified Tracker Data] Initializing...');
    
    // Monitor cookies
    this.monitorCookies();
    
    // Monitor network requests for trackers
    this.monitorTrackers();
    
    // Monitor pixels
    this.monitorPixels();
    
    // Calculate privacy score
    this.calculatePrivacyScore();
    
    // Sync data every 2 seconds
    setInterval(() => {
      this.syncData();
      this.calculatePrivacyScore();
    }, 2000);
  }

  monitorCookies() {
    // Analyze current cookies
    const cookieString = document.cookie;
    const cookies = cookieString.split(';').filter(c => c.trim());
    
    this.data.cookies.all = [];
    this.data.cookies.tracking = [];
    this.data.cookies.essential = [];
    this.data.cookies.analytics = [];
    this.data.cookies.marketing = [];
    
    cookies.forEach(cookie => {
      const [name, value] = cookie.split('=').map(s => s.trim());
      if (!name) return;
      
      const cookieData = {
        name,
        value: value || '',
        domain: window.location.hostname,
        category: this.categorizeCookie(name)
      };
      
      this.data.cookies.all.push(cookieData);
      
      // Categorize
      switch(cookieData.category) {
        case 'tracking':
          this.data.cookies.tracking.push(cookieData);
          break;
        case 'analytics':
          this.data.cookies.analytics.push(cookieData);
          break;
        case 'marketing':
          this.data.cookies.marketing.push(cookieData);
          break;
        case 'essential':
          this.data.cookies.essential.push(cookieData);
          break;
        default:
          this.data.cookies.functional.push(cookieData);
      }
    });
  }

  categorizeCookie(name) {
    const lowerName = name.toLowerCase();
    
    // Tracking cookies
    if (lowerName.includes('track') || lowerName.includes('_ga') || 
        lowerName.includes('_gid') || lowerName.includes('fbp') ||
        lowerName.includes('_gcl') || lowerName.includes('utm')) {
      return 'tracking';
    }
    
    // Analytics
    if (lowerName.includes('analytic') || lowerName.includes('_ga') ||
        lowerName.includes('gtm') || lowerName.includes('matomo')) {
      return 'analytics';
    }
    
    // Marketing
    if (lowerName.includes('campaign') || lowerName.includes('market') ||
        lowerName.includes('advert') || lowerName.includes('doubleclick')) {
      return 'marketing';
    }
    
    // Essential
    if (lowerName.includes('session') || lowerName.includes('auth') ||
        lowerName.includes('csrf') || lowerName.includes('security')) {
      return 'essential';
    }
    
    return 'functional';
  }

  monitorTrackers() {
    // Intercept XHR
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
      const url = arguments[1];
      if (url && typeof url === 'string') {
        window.unifiedTrackerData?.detectTracker(url);
      }
      return originalXHR.apply(this, arguments);
    };
    
    // Intercept Fetch
    const originalFetch = window.fetch;
    window.fetch = function() {
      const url = arguments[0];
      if (url && typeof url === 'string') {
        window.unifiedTrackerData?.detectTracker(url);
      }
      return originalFetch.apply(this, arguments);
    };
  }

  detectTracker(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Analytics trackers
      const analyticsPatterns = [
        'google-analytics', 'googletagmanager', 'analytics',
        'segment', 'mixpanel', 'amplitude', 'heap', 'matomo'
      ];
      
      // Advertising trackers
      const adPatterns = [
        'doubleclick', 'googlesyndication', 'amazon-adsystem',
        'adsystem', 'adnxs', 'adsrvr', 'pubmatic', 'criteo'
      ];
      
      // Social trackers
      const socialPatterns = [
        'facebook', 'fbcdn', 'twitter', 'linkedin', 'pinterest',
        'instagram', 'tiktok', 'snapchat'
      ];
      
      // Fingerprinting
      const fingerprintPatterns = [
        'fingerprint', 'fp-', 'device-', 'browser-id'
      ];
      
      let detected = false;
      
      // Check patterns
      analyticsPatterns.forEach(pattern => {
        if (hostname.includes(pattern) || url.includes(pattern)) {
          this.data.trackers.analytics.add(hostname);
          this.data.trackers.all.add(hostname);
          detected = true;
        }
      });
      
      adPatterns.forEach(pattern => {
        if (hostname.includes(pattern) || url.includes(pattern)) {
          this.data.trackers.advertising.add(hostname);
          this.data.trackers.all.add(hostname);
          detected = true;
        }
      });
      
      socialPatterns.forEach(pattern => {
        if (hostname.includes(pattern) || url.includes(pattern)) {
          this.data.trackers.social.add(hostname);
          this.data.trackers.all.add(hostname);
          detected = true;
        }
      });
      
      fingerprintPatterns.forEach(pattern => {
        if (url.includes(pattern)) {
          this.data.trackers.fingerprinting.add(hostname);
          this.data.trackers.all.add(hostname);
          this.data.stats.fingerprintAttempts++;
          detected = true;
        }
      });
      
      if (detected) {
        this.data.stats.trackersBlocked++;
        console.log('🎯 Tracker detected:', hostname);
      }
    } catch (e) {
      // Invalid URL
    }
  }

  monitorPixels() {
    // Monitor image loads
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'IMG') {
            this.detectPixel(node);
          }
        });
      });
    });
    
    // Check existing images
    document.querySelectorAll('img').forEach(img => {
      this.detectPixel(img);
    });
    
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  detectPixel(img) {
    const src = img.src;
    if (!src) return;
    
    // Check for tracking pixels (1x1 images, hidden, or known patterns)
    const isPixel = (img.width === 1 && img.height === 1) ||
                    (img.style.display === 'none') ||
                    (img.style.visibility === 'hidden') ||
                    src.includes('pixel') ||
                    src.includes('track') ||
                    src.includes('beacon') ||
                    src.includes('1x1') ||
                    src.includes('.gif?');
    
    if (isPixel) {
      try {
        const hostname = new URL(src).hostname;
        
        // Categorize pixel
        if (hostname.includes('facebook')) {
          this.data.pixels.facebook.add(src);
        } else if (hostname.includes('google')) {
          this.data.pixels.google.add(src);
        } else if (hostname.includes('amazon')) {
          this.data.pixels.amazon.add(src);
        } else {
          this.data.pixels.other.add(src);
        }
        
        this.data.pixels.all.add(src);
        this.data.stats.pixelsDetected++;
        console.log('👁️ Pixel detected:', hostname);
      } catch (e) {
        // Invalid URL
      }
    }
  }

  calculatePrivacyScore() {
    let score = 100;
    
    // Deduct for trackers (-5 each, max -40)
    score -= Math.min(this.data.trackers.all.size * 5, 40);
    
    // Deduct for non-essential cookies (-2 each, max -20)
    const nonEssentialCookies = this.data.cookies.tracking.length + 
                                this.data.cookies.analytics.length +
                                this.data.cookies.marketing.length;
    score -= Math.min(nonEssentialCookies * 2, 20);
    
    // Deduct for pixels (-3 each, max -20)
    score -= Math.min(this.data.pixels.all.size * 3, 20);
    
    // Deduct for fingerprinting (-10)
    if (this.data.stats.fingerprintAttempts > 0) {
      score -= 10;
    }
    
    // Bonus for HTTPS (+10)
    if (window.location.protocol === 'https:') {
      score += 10;
    }
    
    this.data.stats.privacyScore = Math.max(0, Math.min(100, score));
    
    // Calculate data value saved (rough estimate)
    this.data.stats.dataValueSaved = (this.data.stats.trackersBlocked * 0.05) + 
                                     (this.data.stats.cookiesCleaned * 0.02) +
                                     (this.data.stats.pixelsDetected * 0.03);
  }

  syncData() {
    // Save to Chrome storage for popup access
    chrome.storage.local.set({
      unifiedTrackerData: {
        cookies: {
          total: this.data.cookies.all.length,
          essential: this.data.cookies.essential.length,
          tracking: this.data.cookies.tracking.length,
          analytics: this.data.cookies.analytics.length,
          marketing: this.data.cookies.marketing.length,
          list: this.data.cookies.all.slice(0, 10) // First 10 for display
        },
        trackers: {
          total: this.data.trackers.all.size,
          analytics: this.data.trackers.analytics.size,
          advertising: this.data.trackers.advertising.size,
          social: this.data.trackers.social.size,
          fingerprinting: this.data.trackers.fingerprinting.size,
          list: Array.from(this.data.trackers.all).slice(0, 10)
        },
        pixels: {
          total: this.data.pixels.all.size,
          facebook: this.data.pixels.facebook.size,
          google: this.data.pixels.google.size,
          amazon: this.data.pixels.amazon.size,
          other: this.data.pixels.other.size,
          list: Array.from(this.data.pixels.all).slice(0, 10)
        },
        stats: this.data.stats,
        timestamp: Date.now()
      }
    });
  }

  // Get current data
  getData() {
    return {
      cookies: {
        total: this.data.cookies.all.length,
        essential: this.data.cookies.essential.length,
        tracking: this.data.cookies.tracking.length + this.data.cookies.analytics.length + this.data.cookies.marketing.length
      },
      trackers: {
        total: this.data.trackers.all.size,
        byCategory: {
          analytics: this.data.trackers.analytics.size,
          advertising: this.data.trackers.advertising.size,
          social: this.data.trackers.social.size
        }
      },
      pixels: {
        total: this.data.pixels.all.size,
        byPlatform: {
          facebook: this.data.pixels.facebook.size,
          google: this.data.pixels.google.size,
          amazon: this.data.pixels.amazon.size,
          other: this.data.pixels.other.size
        }
      },
      privacyScore: this.data.stats.privacyScore
    };
  }
}

// Initialize unified tracker data
const unifiedTrackerData = new UnifiedTrackerData();
window.unifiedTrackerData = unifiedTrackerData;

// Listen for requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getUnifiedData') {
    sendResponse(unifiedTrackerData.getData());
  }
  return true;
});

console.log('📊 [Dr. DOM] Unified Tracker Data Manager activated!');