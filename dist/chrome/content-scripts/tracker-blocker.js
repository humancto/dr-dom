/**
 * Tracker Blocker - Actually blocks trackers instead of just detecting them
 * Works with Enhanced Tracker Detection to provide real privacy protection
 */

class TrackerBlocker {
  constructor() {
    this.enabled = true;
    this.blockedCount = 0;
    this.blockedRequests = [];
    this.whitelist = new Set();
    this.blockPatterns = {
      // Advertising & Tracking
      googleAnalytics: /google-analytics\.com|googletagmanager\.com|google\.com\/recaptcha|gstatic\.com\/recaptcha/i,
      facebook: /facebook\.com\/tr|facebook\.com\/plugins|fbcdn\.net|connect\.facebook\.net/i,
      amazon: /amazon-adsystem\.com|amazonads\.com|assoc-amazon\.com/i,
      doubleclick: /doubleclick\.net|googlesyndication\.com|googleadservices\.com/i,
      
      // Analytics
      adobe: /omniture\.com|omtrdc\.net|demdex\.net|everesttech\.net/i,
      mixpanel: /mixpanel\.com|mxpnl\.com/i,
      segment: /segment\.io|segment\.com/i,
      hotjar: /hotjar\.com|hotjar\.io/i,
      
      // Social Media Trackers
      twitter: /ads-twitter\.com|analytics\.twitter\.com/i,
      linkedin: /ads\.linkedin\.com|analytics\.linkedin\.com/i,
      pinterest: /analytics\.pinterest\.com|pinterest\.com\/v3/i,
      tiktok: /analytics\.tiktok\.com|tiktok\.com\/i\/api/i,
      
      // Data Brokers
      oracle: /bluekai\.com|bkrtx\.com|addthis\.com/i,
      salesforce: /krxd\.net|nexac\.com/i,
      acxiom: /acxiom\.com|liveramp\.com/i,
      
      // Fingerprinting Services
      fingerprintjs: /fingerprintjs\.com|fpjs\.io/i,
      maxmind: /maxmind\.com|mmapiws\.com/i,
      threatmetrix: /threatmetrix\.com|online-metrix\.net/i,
      
      // Ad Networks
      criteo: /criteo\.com|criteo\.net/i,
      taboola: /taboola\.com|taboolasyndication\.com/i,
      outbrain: /outbrain\.com|outbrainimg\.com/i,
      mediamath: /mediamath\.com|mathtag\.com/i,
      appnexus: /appnexus\.com|adnxs\.com/i,
      rubicon: /rubiconproject\.com|adsrvr\.org/i,
      
      // Other Trackers
      scorecard: /scorecardresearch\.com|scomsc\.net/i,
      quantserve: /quantserve\.com|quantcount\.com/i,
      comscore: /comscore\.com|comscoreresearch\.com/i,
      newrelic: /newrelic\.com|nr-data\.net/i
    };
    
    this.init();
  }

  async init() {
    console.log('[Tracker Blocker] Initializing...');
    
    // Load settings from storage
    await this.loadSettings();
    
    // Set up request interception
    this.setupInterception();
    
    // Update badge with blocked count
    this.updateBadge();
    
    // Listen for setting changes
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'TOGGLE_BLOCKING') {
        this.enabled = request.enabled;
        this.saveSettings();
        sendResponse({ success: true, enabled: this.enabled });
      } else if (request.type === 'GET_BLOCKING_STATS') {
        sendResponse({
          enabled: this.enabled,
          blockedCount: this.blockedCount,
          recentBlocks: this.blockedRequests.slice(-10)
        });
      } else if (request.type === 'WHITELIST_DOMAIN') {
        this.whitelist.add(request.domain);
        this.saveSettings();
        sendResponse({ success: true });
      }
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['blocker_settings']);
      if (result.blocker_settings) {
        this.enabled = result.blocker_settings.enabled !== false;
        this.whitelist = new Set(result.blocker_settings.whitelist || []);
        this.blockedCount = result.blocker_settings.totalBlocked || 0;
      }
    } catch (error) {
      console.error('[Tracker Blocker] Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        blocker_settings: {
          enabled: this.enabled,
          whitelist: Array.from(this.whitelist),
          totalBlocked: this.blockedCount,
          lastUpdated: Date.now()
        }
      });
    } catch (error) {
      console.error('[Tracker Blocker] Error saving settings:', error);
    }
  }

  setupInterception() {
    // Intercept XHR requests
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (trackerBlocker.shouldBlock(url)) {
        console.log('[Tracker Blocker] Blocked XHR:', url);
        trackerBlocker.recordBlock(url, 'xhr');
        // Return empty response
        this.addEventListener('loadstart', function() {
          Object.defineProperty(this, 'status', { value: 204 });
          Object.defineProperty(this, 'statusText', { value: 'Blocked by Dr. DOM' });
          Object.defineProperty(this, 'response', { value: '' });
          Object.defineProperty(this, 'responseText', { value: '' });
          this.dispatchEvent(new Event('load'));
          this.dispatchEvent(new Event('loadend'));
        });
        return;
      }
      return originalXHROpen.call(this, method, url, ...args);
    };

    // Intercept Fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(url, ...args) {
      const urlString = typeof url === 'string' ? url : url.url;
      if (trackerBlocker.shouldBlock(urlString)) {
        console.log('[Tracker Blocker] Blocked Fetch:', urlString);
        trackerBlocker.recordBlock(urlString, 'fetch');
        // Return empty response
        return Promise.resolve(new Response('', {
          status: 204,
          statusText: 'Blocked by Dr. DOM'
        }));
      }
      return originalFetch.call(this, url, ...args);
    };

    // Block tracking pixels (1x1 images)
    const originalImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      set: function(value) {
        if (value && trackerBlocker.shouldBlock(value)) {
          console.log('[Tracker Blocker] Blocked Image:', value);
          trackerBlocker.recordBlock(value, 'image');
          // Set to transparent 1x1 pixel instead
          value = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
        return originalImageSrc.set.call(this, value);
      },
      get: originalImageSrc.get
    });

    // Block tracking scripts
    const originalScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
    Object.defineProperty(HTMLScriptElement.prototype, 'src', {
      set: function(value) {
        if (value && trackerBlocker.shouldBlock(value)) {
          console.log('[Tracker Blocker] Blocked Script:', value);
          trackerBlocker.recordBlock(value, 'script');
          // Don't load the script
          return;
        }
        return originalScriptSrc.set.call(this, value);
      },
      get: originalScriptSrc.get
    });

    // Block iframes from trackers
    const originalIframeSrc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
    Object.defineProperty(HTMLIFrameElement.prototype, 'src', {
      set: function(value) {
        if (value && trackerBlocker.shouldBlock(value)) {
          console.log('[Tracker Blocker] Blocked iFrame:', value);
          trackerBlocker.recordBlock(value, 'iframe');
          // Set to about:blank
          value = 'about:blank';
        }
        return originalIframeSrc.set.call(this, value);
      },
      get: originalIframeSrc.get
    });
  }

  shouldBlock(url) {
    if (!this.enabled) return false;
    if (!url) return false;

    // Check if domain is whitelisted
    try {
      const urlObj = new URL(url, window.location.origin);
      if (this.whitelist.has(urlObj.hostname)) {
        return false;
      }
    } catch (e) {
      // Invalid URL
    }

    // Check against block patterns
    for (const [category, pattern] of Object.entries(this.blockPatterns)) {
      if (pattern.test(url)) {
        return true;
      }
    }

    return false;
  }

  recordBlock(url, type) {
    this.blockedCount++;
    
    const blockData = {
      url: url,
      type: type,
      timestamp: Date.now(),
      domain: window.location.hostname
    };
    
    this.blockedRequests.push(blockData);
    
    // Keep only last 100 blocks in memory
    if (this.blockedRequests.length > 100) {
      this.blockedRequests.shift();
    }
    
    // Update badge
    this.updateBadge();
    
    // Save to storage
    this.saveBlockData(blockData);
  }

  async saveBlockData(blockData) {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}_blocked`;
    
    try {
      const result = await chrome.storage.local.get([storageKey]);
      const existingBlocks = result[storageKey] || [];
      existingBlocks.push(blockData);
      
      // Keep only last 50 per domain
      if (existingBlocks.length > 50) {
        existingBlocks.shift();
      }
      
      await chrome.storage.local.set({ [storageKey]: existingBlocks });
    } catch (error) {
      console.error('[Tracker Blocker] Error saving block data:', error);
    }
  }

  updateBadge() {
    // Send message to background script to update badge
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      count: this.blockedCount
    });
  }

  // Get blocking statistics
  getStats() {
    return {
      enabled: this.enabled,
      totalBlocked: this.blockedCount,
      recentBlocks: this.blockedRequests.slice(-10),
      categoriesBlocked: this.getCategoriesBlocked(),
      savingsEstimate: this.estimateSavings()
    };
  }

  getCategoriesBlocked() {
    const categories = {};
    this.blockedRequests.forEach(block => {
      for (const [category, pattern] of Object.entries(this.blockPatterns)) {
        if (pattern.test(block.url)) {
          categories[category] = (categories[category] || 0) + 1;
          break;
        }
      }
    });
    return categories;
  }

  estimateSavings() {
    // Estimate bandwidth and time saved
    const avgTrackerSize = 15 * 1024; // 15KB average
    const avgTrackerTime = 200; // 200ms average
    
    return {
      bandwidth: (this.blockedCount * avgTrackerSize / 1024 / 1024).toFixed(2) + ' MB',
      time: (this.blockedCount * avgTrackerTime / 1000).toFixed(1) + ' seconds',
      battery: (this.blockedCount * 0.001).toFixed(2) + '% battery' // Rough estimate
    };
  }
}

// Initialize
const trackerBlocker = new TrackerBlocker();
console.log('[Dr. DOM] Tracker Blocker initialized - Active protection enabled!');

// Export for other modules
window.trackerBlocker = trackerBlocker;