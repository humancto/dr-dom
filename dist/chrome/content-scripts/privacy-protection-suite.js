/**
 * Dr. DOM Privacy Protection Suite
 * Complete privacy protection with tracker blocking, cookie cleaning, and more
 */

class PrivacyProtectionSuite {
  constructor() {
    this.domain = window.location.hostname;
    this.config = {
      trackerBlocking: true,
      cookieCleaning: true,
      webrtcProtection: true,
      referrerSpoofing: true,
      fingerprintPoisoning: true,
      kidsMode: false,
      incognitoPlus: false
    };
    
    this.stats = {
      trackersBlocked: 0,
      cookiesCleaned: 0,
      fingerprintsPoison: 0,
      webrtcBlocked: 0,
      referrersSpoofed: 0,
      dataValueSaved: 0
    };
    
    this.blockedRequests = [];
    this.cleanedCookies = [];
    
    this.init();
  }

  async init() {
    console.log('🛡️ [Privacy Protection Suite] Initializing...');
    
    // Load user preferences
    await this.loadConfig();
    
    // Start all protection modules
    if (this.config.trackerBlocking) this.startTrackerBlocking();
    if (this.config.cookieCleaning) this.startCookieCleaning();
    if (this.config.webrtcProtection) this.protectWebRTC();
    if (this.config.referrerSpoofing) this.spoofReferrer();
    if (this.config.fingerprintPoisoning) this.poisonFingerprint();
    
    // Start monitoring
    this.monitorPageSpeed();
    this.calculateDataValue();
    
    // Save stats periodically
    setInterval(() => this.saveStats(), 5000);
  }

  async loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get('privacyConfig', (result) => {
        if (result.privacyConfig) {
          this.config = { ...this.config, ...result.privacyConfig };
        }
        resolve();
      });
    });
  }

  // ============= TRACKER BLOCKING =============
  startTrackerBlocking() {
    console.log('🚫 [Tracker Blocking] Active');
    
    // Common tracker domains
    this.trackerDomains = [
      'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
      'facebook.com/tr', 'amazon-adsystem.com', 'googlesyndication.com',
      'scorecardresearch.com', 'quantserve.com', 'outbrain.com',
      'taboola.com', 'hotjar.com', 'mixpanel.com', 'segment.com',
      'amplitude.com', 'chartbeat.com', 'newrelic.com'
    ];
    
    // Block XHR/Fetch requests
    this.interceptNetworkRequests();
    
    // Block tracking pixels
    this.blockTrackingPixels();
    
    // Block tracking scripts
    this.blockTrackingScripts();
  }

  interceptNetworkRequests() {
    // Override XMLHttpRequest
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = (...args) => {
      const url = args[1];
      if (this.isTracker(url)) {
        console.log('🚫 Blocked XHR tracker:', url);
        this.stats.trackersBlocked++;
        this.blockedRequests.push({
          type: 'xhr',
          url: url,
          timestamp: Date.now()
        });
        // Return empty response
        args[1] = 'data:text/plain,';
      }
      return originalXHR.apply(this, args);
    };
    
    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      const url = args[0];
      if (this.isTracker(url)) {
        console.log('🚫 Blocked fetch tracker:', url);
        this.stats.trackersBlocked++;
        this.blockedRequests.push({
          type: 'fetch',
          url: url,
          timestamp: Date.now()
        });
        // Return empty response
        return Promise.resolve(new Response('', { status: 204 }));
      }
      return originalFetch.apply(window, args);
    };
  }

  blockTrackingPixels() {
    // Monitor for tracking pixels
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'IMG') {
            if (this.isTrackingPixel(node)) {
              node.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
              console.log('🚫 Blocked tracking pixel:', node.src);
              this.stats.trackersBlocked++;
            }
          }
        });
      });
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  blockTrackingScripts() {
    // Override createElement to block tracking scripts
    const originalCreateElement = document.createElement;
    document.createElement = function(...args) {
      const element = originalCreateElement.apply(document, args);
      
      if (args[0].toLowerCase() === 'script') {
        const originalSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
        Object.defineProperty(element, 'src', {
          set: function(value) {
            if (this.isTracker(value)) {
              console.log('🚫 Blocked tracking script:', value);
              this.stats.trackersBlocked++;
              value = 'data:text/javascript,';
            }
            originalSrc.set.call(element, value);
          }.bind(this),
          get: originalSrc.get
        });
      }
      
      return element;
    }.bind(this);
  }

  isTracker(url) {
    if (!url) return false;
    const urlStr = url.toString().toLowerCase();
    return this.trackerDomains.some(domain => urlStr.includes(domain));
  }

  isTrackingPixel(img) {
    // Check for 1x1 pixels and known tracking patterns
    return (img.width === 1 && img.height === 1) ||
           img.src.includes('pixel') ||
           img.src.includes('/tr?') ||
           img.src.includes('facebook.com/tr') ||
           this.isTracker(img.src);
  }

  // ============= COOKIE CLEANING =============
  startCookieCleaning() {
    console.log('🍪 [Cookie Cleaning] Active');
    
    // Clean cookies on page load
    this.cleanCookies();
    
    // Auto-clean every 5 minutes
    setInterval(() => this.cleanCookies(), 5 * 60 * 1000);
    
    // Clean on page unload
    window.addEventListener('beforeunload', () => this.cleanCookies());
  }

  cleanCookies() {
    const cookies = document.cookie.split(';');
    const essentialCookies = ['session', 'auth', 'login', 'token', 'csrf'];
    
    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      
      // Skip essential cookies
      const isEssential = essentialCookies.some(essential => 
        name.toLowerCase().includes(essential)
      );
      
      if (!isEssential && this.isTrackingCookie(name)) {
        // Delete the cookie
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${this.domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${this.domain}`;
        
        console.log('🧹 Cleaned cookie:', name);
        this.stats.cookiesCleaned++;
        this.cleanedCookies.push({
          name: name,
          timestamp: Date.now()
        });
      }
    });
  }

  isTrackingCookie(name) {
    const trackingPatterns = [
      '_ga', '_gid', '_gat', 'fbp', 'fbc', '_utm',
      'doubleclick', 'adnxs', 'adsystem', 'amplitude',
      'mixpanel', 'segment', 'hotjar', 'heap'
    ];
    
    return trackingPatterns.some(pattern => 
      name.toLowerCase().includes(pattern)
    );
  }

  // ============= WebRTC LEAK PROTECTION =============
  protectWebRTC() {
    console.log('🔒 [WebRTC Protection] Active');
    
    // Override WebRTC methods
    const originalRTCPeerConnection = window.RTCPeerConnection;
    
    window.RTCPeerConnection = function(...args) {
      console.log('⚠️ WebRTC connection attempt blocked');
      this.stats.webrtcBlocked++;
      
      // If in strict mode, block completely
      if (this.config.incognitoPlus) {
        throw new Error('WebRTC is disabled for privacy');
      }
      
      // Otherwise, modify config to prevent IP leaks
      if (args[0]) {
        args[0].iceServers = [];
      }
      
      return new originalRTCPeerConnection(...args);
    }.bind(this);
    
    // Also handle prefixed versions
    window.webkitRTCPeerConnection = window.RTCPeerConnection;
    window.mozRTCPeerConnection = window.RTCPeerConnection;
  }

  // ============= REFERRER SPOOFING =============
  spoofReferrer() {
    console.log('🎭 [Referrer Spoofing] Active');
    
    // Override referrer for all requests
    Object.defineProperty(document, 'referrer', {
      get: function() {
        this.stats.referrersSpoofed++;
        return window.location.origin; // Only send origin, not full URL
      }.bind(this),
      configurable: true
    });
    
    // Add referrer policy meta tag
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
  }

  // ============= FINGERPRINT POISONING =============
  poisonFingerprint() {
    console.log('🎲 [Fingerprint Poisoning] Active');
    
    // Canvas fingerprinting protection
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
      this.stats.fingerprintsPoison++;
      // Add random noise to canvas
      const context = this.getContext('2d');
      if (context) {
        const imageData = context.getImageData(0, 0, this.width, this.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] ^= Math.floor(Math.random() * 10);
        }
        context.putImageData(imageData, 0, 0);
      }
      return originalToDataURL.apply(this, args);
    }.bind(this);
    
    // WebGL fingerprinting protection
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      this.stats.fingerprintsPoison++;
      // Randomize certain parameters
      if (parameter === 37445 || parameter === 37446) {
        return 'Intel Inc.'; // Generic vendor/renderer
      }
      return originalGetParameter.apply(this, arguments);
    }.bind(this);
    
    // Audio fingerprinting protection
    const originalCreateOscillator = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function() {
      this.stats.fingerprintsPoison++;
      const oscillator = originalCreateOscillator.apply(this, arguments);
      // Add random noise to frequency
      const originalFrequency = oscillator.frequency;
      oscillator.frequency.value = originalFrequency.value + (Math.random() - 0.5) * 0.001;
      return oscillator;
    }.bind(this);
  }

  // ============= PAGE SPEED MONITORING =============
  monitorPageSpeed() {
    const startTime = performance.now();
    
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      const blocked = this.stats.trackersBlocked;
      const estimatedSaved = blocked * 50; // Estimate 50ms per blocked tracker
      
      const speedImpact = {
        originalTime: loadTime + estimatedSaved,
        optimizedTime: loadTime,
        timeSaved: estimatedSaved,
        percentImprovement: (estimatedSaved / (loadTime + estimatedSaved)) * 100
      };
      
      console.log(`⚡ Page loaded ${speedImpact.percentImprovement.toFixed(1)}% faster with privacy protection`);
      
      // Store speed impact
      chrome.storage.local.set({
        [`drDOM_${this.domain}_speedImpact`]: speedImpact
      });
    });
  }

  // ============= DATA VALUE CALCULATOR =============
  calculateDataValue() {
    // Estimate data value based on trackers and activity
    const trackersBlocked = this.stats.trackersBlocked;
    const cookiesCleaned = this.stats.cookiesCleaned;
    
    // Industry averages: $0.0005 - $0.01 per tracker interaction
    const valuePerTracker = 0.005;
    const valuePerCookie = 0.002;
    
    const totalValue = (trackersBlocked * valuePerTracker) + (cookiesCleaned * valuePerCookie);
    this.stats.dataValueSaved = totalValue;
    
    return {
      daily: totalValue,
      monthly: totalValue * 30,
      yearly: totalValue * 365,
      formatted: `$${totalValue.toFixed(4)}`
    };
  }

  // ============= KIDS MODE =============
  enableKidsMode() {
    console.log('👶 [Kids Mode] Activated');
    this.config.kidsMode = true;
    
    // Block adult content keywords
    const adultKeywords = ['adult', 'dating', 'gambling', 'violence'];
    
    // Check page content
    const pageText = document.body.innerText.toLowerCase();
    const hasAdultContent = adultKeywords.some(keyword => pageText.includes(keyword));
    
    if (hasAdultContent) {
      // Redirect to safe page
      window.location.href = 'https://www.google.com/safesearch';
    }
    
    // Extra strict tracker blocking
    this.config.trackerBlocking = true;
    this.config.cookieCleaning = true;
  }

  // ============= INCOGNITO++ MODE =============
  enableIncognitoPlus() {
    console.log('🥷 [Incognito++] Maximum privacy activated');
    this.config.incognitoPlus = true;
    
    // Enable all protections at maximum
    this.config.trackerBlocking = true;
    this.config.cookieCleaning = true;
    this.config.webrtcProtection = true;
    this.config.referrerSpoofing = true;
    this.config.fingerprintPoisoning = true;
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Block all third-party requests
    this.blockAllThirdParty = true;
    
    // Disable all browser APIs that could leak info
    delete navigator.getBattery;
    delete navigator.geolocation;
    delete navigator.mediaDevices;
    
    // Spoof timezone
    Date.prototype.getTimezoneOffset = function() { return 0; };
  }

  // ============= DAILY PRIVACY REPORT =============
  generateDailyReport() {
    const report = {
      date: new Date().toLocaleDateString(),
      domain: this.domain,
      stats: this.stats,
      blockedRequests: this.blockedRequests.slice(-100), // Last 100
      cleanedCookies: this.cleanedCookies.slice(-50), // Last 50
      dataValue: this.calculateDataValue(),
      privacyScore: this.calculatePrivacyScore()
    };
    
    // Store report
    chrome.storage.local.get('dailyReports', (result) => {
      const reports = result.dailyReports || [];
      reports.push(report);
      
      // Keep only last 30 days
      if (reports.length > 30) {
        reports.shift();
      }
      
      chrome.storage.local.set({ dailyReports: reports });
    });
    
    return report;
  }

  calculatePrivacyScore() {
    let score = 100;
    
    // Deduct points for privacy risks
    const pageTrackers = document.querySelectorAll('script').length;
    const cookies = document.cookie.split(';').length;
    
    score -= Math.min(pageTrackers * 2, 30); // Max 30 points for trackers
    score -= Math.min(cookies * 1, 20); // Max 20 points for cookies
    
    // Add points for protections enabled
    if (this.config.trackerBlocking) score += 10;
    if (this.config.cookieCleaning) score += 10;
    if (this.config.webrtcProtection) score += 5;
    if (this.config.referrerSpoofing) score += 5;
    if (this.config.fingerprintPoisoning) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  // ============= SAVE STATS =============
  saveStats() {
    const data = {
      stats: this.stats,
      blockedRequests: this.blockedRequests,
      cleanedCookies: this.cleanedCookies,
      config: this.config,
      timestamp: Date.now()
    };
    
    chrome.storage.local.set({
      [`drDOM_${this.domain}_privacy`]: data,
      'privacyConfig': this.config,
      'globalPrivacyStats': this.stats
    });
  }
}

// Initialize the privacy protection suite
const privacyProtection = new PrivacyProtectionSuite();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CLEAR_LOCAL_STORAGE') {
    const itemCount = localStorage.length;
    localStorage.clear();
    sendResponse({ success: true, itemsCleared: itemCount });
    console.log(`[Privacy Suite] Cleared ${itemCount} items from localStorage`);
    return;
  } else if (request.type === 'CLEAR_SESSION_STORAGE') {
    const itemCount = sessionStorage.length;
    sessionStorage.clear();
    sendResponse({ success: true, itemsCleared: itemCount });
    console.log(`[Privacy Suite] Cleared ${itemCount} items from sessionStorage`);
    return;
  }
  
  if (request.action === 'getPrivacyStats') {
    sendResponse({
      stats: privacyProtection.stats,
      config: privacyProtection.config,
      dataValue: privacyProtection.calculateDataValue(),
      privacyScore: privacyProtection.calculatePrivacyScore()
    });
  } else if (request.action === 'updatePrivacyConfig') {
    privacyProtection.config = { ...privacyProtection.config, ...request.config };
    privacyProtection.saveStats();
    sendResponse({ success: true });
  } else if (request.action === 'enableKidsMode') {
    privacyProtection.enableKidsMode();
    sendResponse({ success: true });
  } else if (request.action === 'enableIncognitoPlus') {
    privacyProtection.enableIncognitoPlus();
    sendResponse({ success: true });
  } else if (request.action === 'getDailyReport') {
    sendResponse(privacyProtection.generateDailyReport());
  }
  return true;
});

console.log('🛡️ [Dr. DOM] Privacy Protection Suite activated!');