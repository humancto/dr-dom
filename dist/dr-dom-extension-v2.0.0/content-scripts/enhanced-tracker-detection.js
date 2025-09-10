/**
 * Enhanced Tracker Detection - REAL tracking detection
 * Uses actual pattern matching against real network requests
 * No fake data - if we can't detect it, we say so
 */

class EnhancedTrackerDetection {
  constructor() {
    this.detectedTrackers = new Map();
    this.networkRequests = [];
    this.patterns = {
      // REAL tracker patterns - these ACTUALLY work
      googleAnalytics: /google-analytics\.com|googletagmanager\.com|google\.com\/analytics/i,
      facebook: /facebook\.com\/tr|fbcdn\.net|facebook-pixel/i,
      amazon: /amazon-adsystem\.com|amazonads/i,
      doubleclick: /doubleclick\.net|googlesyndication\.com/i,
      twitter: /twitter\.com\/i\/adsct|ads-twitter\.com/i,
      linkedin: /linkedin\.com\/li\/track|linkedin\.com\/px/i,
      pinterest: /pinterest\.com\/v3|pinimg\.com\/ct/i,
      reddit: /reddit\.com\/pixel|redditmedia\.com\/ads/i,
      tiktok: /tiktok\.com\/pixel|analytics\.tiktok/i,
      microsoft: /clarity\.ms|microsoftadvertising/i,
      adobe: /demdex\.net|omtrdc\.net/i,
      oracle: /bluekai\.com|bkrtx\.com/i,
      salesforce: /krxd\.net|nexac\.com/i,
      // Ad networks
      taboola: /taboola\.com|trc\.taboola/i,
      outbrain: /outbrain\.com|outbrainimg/i,
      criteo: /criteo\.com|criteo\.net/i,
      rubicon: /rubiconproject\.com/i,
      pubmatic: /pubmatic\.com/i,
      openx: /openx\.net/i,
      appnexus: /appnexus\.com|adnxs\.com/i,
      // Analytics
      mixpanel: /mixpanel\.com|mxpnl\.com/i,
      segment: /segment\.io|segment\.com/i,
      amplitude: /amplitude\.com/i,
      heap: /heap\.io|heapanalytics/i,
      hotjar: /hotjar\.com|hotjar\.io/i,
      fullstory: /fullstory\.com/i,
      // Fingerprinting
      fingerprintjs: /fingerprintjs|fpjs/i,
      maxmind: /maxmind\.com/i,
      ipify: /ipify\.org/i
    };
    
    this.categories = {
      advertising: ['doubleclick', 'amazon', 'taboola', 'outbrain', 'criteo', 'rubicon', 'pubmatic', 'openx', 'appnexus'],
      analytics: ['googleAnalytics', 'mixpanel', 'segment', 'amplitude', 'heap', 'hotjar', 'fullstory'],
      social: ['facebook', 'twitter', 'linkedin', 'pinterest', 'reddit', 'tiktok'],
      fingerprinting: ['fingerprintjs', 'maxmind', 'ipify'],
      dataBroker: ['adobe', 'oracle', 'salesforce', 'bluekai']
    };
    
    this.init();
  }

  init() {
    console.log('🎯 [Enhanced Tracker Detection] Starting REAL tracker detection...');
    
    // Intercept ALL network requests
    this.interceptNetworkRequests();
    
    // Monitor cookies
    this.monitorCookies();
    
    // Monitor pixels
    this.detectTrackingPixels();
    
    // Check localStorage
    this.checkLocalStorage();
    
    // Display results
    setTimeout(() => this.displayResults(), 5000);
  }

  interceptNetworkRequests() {
    // Intercept XHR
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
      this.checkForTracker(url, 'XHR');
      return originalXHR.apply(this, arguments);
    }.bind(this);
    
    // Intercept Fetch
    const originalFetch = window.fetch;
    window.fetch = (url, options) => {
      this.checkForTracker(url.toString(), 'Fetch');
      return originalFetch(url, options);
    };
    
    // Monitor image loads
    const originalImage = window.Image;
    window.Image = function() {
      const img = new originalImage();
      const originalSrc = Object.getOwnPropertyDescriptor(window.Image.prototype, 'src');
      
      Object.defineProperty(img, 'src', {
        set: function(value) {
          this.checkForTracker(value, 'Image');
          originalSrc.set.call(img, value);
        }.bind(this)
      });
      
      return img;
    }.bind(this);
    
    // Monitor script loads
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT' && node.src) {
            this.checkForTracker(node.src, 'Script');
          }
          if (node.nodeName === 'IFRAME' && node.src) {
            this.checkForTracker(node.src, 'iFrame');
          }
          if (node.nodeName === 'LINK' && node.href) {
            this.checkForTracker(node.href, 'Link');
          }
        });
      });
    });
    
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  checkForTracker(url, type) {
    if (!url) return;
    
    // Check against each pattern
    for (const [name, pattern] of Object.entries(this.patterns)) {
      if (pattern.test(url)) {
        // Found a REAL tracker!
        const category = this.getCategory(name);
        const domain = this.extractDomain(url);
        
        const tracker = {
          name,
          category,
          domain,
          url,
          type,
          timestamp: Date.now(),
          purpose: this.getTrackerPurpose(name)
        };
        
        // Store unique trackers
        const key = `${name}-${domain}`;
        if (!this.detectedTrackers.has(key)) {
          this.detectedTrackers.set(key, tracker);
          console.log(`🎯 [TRACKER DETECTED] ${name} (${category}) via ${type}`);
          
          // Send real-time notification
          this.notifyTrackerDetected(tracker);
        }
        
        break; // Found match, no need to check other patterns
      }
    }
    
    // Store all requests for analysis
    this.networkRequests.push({
      url,
      type,
      timestamp: Date.now()
    });
  }

  getCategory(trackerName) {
    for (const [category, trackers] of Object.entries(this.categories)) {
      if (trackers.includes(trackerName)) {
        return category;
      }
    }
    return 'other';
  }

  getTrackerPurpose(name) {
    const purposes = {
      googleAnalytics: 'Tracks page views, user behavior, and site performance',
      facebook: 'Tracks conversions, builds user profiles for ad targeting',
      amazon: 'Tracks shopping behavior and serves product ads',
      doubleclick: 'Serves targeted ads based on browsing history',
      twitter: 'Tracks conversions from Twitter ads',
      linkedin: 'Tracks professional profiles and B2B conversions',
      pinterest: 'Tracks pins and shopping interests',
      reddit: 'Tracks engagement and serves targeted content',
      tiktok: 'Tracks video engagement and user interests',
      microsoft: 'Records user sessions and behavior',
      adobe: 'Builds comprehensive user profiles across sites',
      oracle: 'Data broker - sells user profiles to advertisers',
      salesforce: 'B2B tracking and lead generation',
      mixpanel: 'Detailed user event tracking',
      segment: 'Collects and distributes data to multiple services',
      amplitude: 'Product analytics and user journey tracking',
      hotjar: 'Records mouse movements and clicks (heatmaps)',
      fingerprintjs: 'Creates unique device fingerprint for tracking'
    };
    
    return purposes[name] || 'Tracks user activity';
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      // If URL parsing fails, extract domain manually
      const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
      return match ? match[1] : url;
    }
  }

  monitorCookies() {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Known tracking cookies patterns
    const trackingCookiePatterns = {
      '_ga': 'Google Analytics',
      '_gid': 'Google Analytics',
      '_fbp': 'Facebook Pixel',
      'fr': 'Facebook',
      '_gcl': 'Google Ads',
      'IDE': 'Google DoubleClick',
      'NID': 'Google',
      'test_cookie': 'DoubleClick',
      '_pinterest': 'Pinterest',
      'personalization_id': 'Twitter',
      '_uetsid': 'Microsoft Bing',
      '_uetvid': 'Microsoft Bing'
    };
    
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      
      for (const [pattern, tracker] of Object.entries(trackingCookiePatterns)) {
        if (name.includes(pattern)) {
          const trackerInfo = {
            name: tracker,
            category: 'cookie',
            type: 'Cookie',
            cookieName: name,
            timestamp: Date.now()
          };
          
          const key = `cookie-${name}`;
          if (!this.detectedTrackers.has(key)) {
            this.detectedTrackers.set(key, trackerInfo);
            console.log(`🍪 [TRACKING COOKIE] ${tracker}: ${name}`);
          }
        }
      }
    });
  }

  detectTrackingPixels() {
    // Look for 1x1 images (tracking pixels)
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      if ((img.width === 1 && img.height === 1) || 
          (img.naturalWidth === 1 && img.naturalHeight === 1)) {
        
        const pixelInfo = {
          name: 'Tracking Pixel',
          category: 'pixel',
          type: 'Pixel',
          url: img.src,
          timestamp: Date.now()
        };
        
        const key = `pixel-${img.src}`;
        if (!this.detectedTrackers.has(key)) {
          this.detectedTrackers.set(key, pixelInfo);
          console.log(`🔴 [TRACKING PIXEL] ${img.src}`);
        }
      }
    });
  }

  checkLocalStorage() {
    // Check for tracking data in localStorage
    const suspiciousKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Check for known tracking patterns
      if (key.includes('_ga') || key.includes('_fb') || 
          key.includes('amplitude') || key.includes('mixpanel') ||
          key.includes('segment') || key.includes('tracking')) {
        
        suspiciousKeys.push(key);
        
        const storageInfo = {
          name: 'LocalStorage Tracking',
          category: 'storage',
          type: 'LocalStorage',
          key: key,
          timestamp: Date.now()
        };
        
        const trackerKey = `storage-${key}`;
        if (!this.detectedTrackers.has(trackerKey)) {
          this.detectedTrackers.set(trackerKey, storageInfo);
          console.log(`💾 [LOCALSTORAGE TRACKING] ${key}`);
        }
      }
    }
  }

  notifyTrackerDetected(tracker) {
    // Send to extension popup
    chrome.runtime.sendMessage({
      type: 'TRACKER_DETECTED',
      tracker: tracker
    });
  }

  displayResults() {
    const trackers = Array.from(this.detectedTrackers.values());
    
    if (trackers.length === 0) {
      console.log('✅ [Enhanced Tracker Detection] No trackers detected! (This is rare!)');
      return;
    }
    
    // Group by category
    const byCategory = {};
    trackers.forEach(tracker => {
      if (!byCategory[tracker.category]) {
        byCategory[tracker.category] = [];
      }
      byCategory[tracker.category].push(tracker);
    });
    
    console.log('=== TRACKER DETECTION RESULTS ===');
    console.log(`Total Trackers Found: ${trackers.length}`);
    console.log('By Category:', byCategory);
    
    // Store results
    const domain = window.location.hostname;
    chrome.storage.local.set({
      [`drDOM_${domain}_enhancedTrackers`]: {
        trackers: trackers,
        byCategory: byCategory,
        totalRequests: this.networkRequests.length,
        timestamp: Date.now(),
        url: window.location.href
      }
    });
    
    // Create visual display
    this.createTrackerDisplay(trackers, byCategory);
  }

  createTrackerDisplay(trackers, byCategory) {
    if (document.getElementById('enhanced-tracker-display')) return;
    
    const display = document.createElement('div');
    display.id = 'enhanced-tracker-display';
    display.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 350px;
      max-height: 400px;
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 2px solid #ef4444;
      border-radius: 16px;
      padding: 20px;
      z-index: 2147483647;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: white;
      overflow-y: auto;
    `;
    
    const categoryColors = {
      advertising: '#ef4444',
      analytics: '#f59e0b',
      social: '#3b82f6',
      fingerprinting: '#dc2626',
      dataBroker: '#9333ea',
      cookie: '#10b981',
      pixel: '#ec4899',
      storage: '#8b5cf6',
      other: '#6b7280'
    };
    
    display.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; font-size: 18px;">
          🎯 ${trackers.length} Trackers Detected
        </h3>
        <button id="tracker-close" style="
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 24px;
          cursor: pointer;
        ">×</button>
      </div>
      
      ${Object.entries(byCategory).map(([category, items]) => `
        <div style="margin-bottom: 15px;">
          <h4 style="
            margin: 0 0 10px 0;
            font-size: 14px;
            color: ${categoryColors[category]};
            text-transform: capitalize;
          ">
            ${category} (${items.length})
          </h4>
          ${items.slice(0, 3).map(item => `
            <div style="
              background: rgba(255,255,255,0.05);
              padding: 8px;
              margin-bottom: 5px;
              border-radius: 6px;
              font-size: 12px;
            ">
              <div style="font-weight: bold;">${item.name}</div>
              <div style="color: #94a3b8; font-size: 11px;">
                ${item.purpose || item.domain || item.key || 'Tracking your activity'}
              </div>
            </div>
          `).join('')}
          ${items.length > 3 ? `
            <div style="font-size: 11px; color: #6b7280; text-align: center;">
              +${items.length - 3} more...
            </div>
          ` : ''}
        </div>
      `).join('')}
      
      <div style="
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #374151;
        font-size: 11px;
        color: #9ca3af;
        text-align: center;
      ">
        This is REAL data - no fabrication!
      </div>
    `;
    
    document.body.appendChild(display);
    
    document.getElementById('tracker-close')?.addEventListener('click', () => {
      display.remove();
    });
  }
}

// Initialize
const enhancedTrackers = new EnhancedTrackerDetection();
console.log('🎯 [Dr. DOM] Enhanced Tracker Detection activated - Finding REAL trackers!');