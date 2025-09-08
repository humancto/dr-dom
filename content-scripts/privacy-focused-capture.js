/**
 * Privacy-Focused Capture - The CORE value of Dr. DOM
 * Real tracker detection using community lists
 */

(() => {
  'use strict';
  
  // Initialize state
  window.__drDOM_privacy = {
    trackers: [],
    requests: [],
    cookies: [],
    privacyScore: 100,
    startTime: performance.now()
  };

  const DOMAIN = window.location.hostname;
  const STORAGE_KEY = `drDOM_privacy_${DOMAIN}`;
  
  console.log(`[Dr. DOM Privacy] 🛡️ Monitoring privacy for ${DOMAIN}`);

  // Check if URL is a tracker using background script
  async function checkTracker(url) {
    try {
      // Ask background script with real tracker database
      const response = await chrome.runtime.sendMessage({
        action: 'checkTracker',
        url: url
      });
      
      return response;
    } catch (error) {
      // Fallback to basic detection
      return basicTrackerCheck(url);
    }
  }

  // Basic fallback tracker detection
  function basicTrackerCheck(url) {
    const trackerKeywords = [
      'analytics', 'tracking', 'metrics', 'telemetry',
      'facebook', 'google-analytics', 'doubleclick',
      'segment', 'mixpanel', 'hotjar', 'amplitude',
      'adsystem', 'adsrvr', 'criteo', 'pubmatic'
    ];
    
    const urlLower = url.toLowerCase();
    for (const keyword of trackerKeywords) {
      if (urlLower.includes(keyword)) {
        return {
          isTracker: true,
          domain: keyword,
          details: { category: 'suspected' }
        };
      }
    }
    
    return { isTracker: false };
  }

  // Capture and analyze requests
  async function captureRequest(url, type, method = 'GET') {
    const requestData = {
      url: url,
      type: type,
      method: method,
      timestamp: Date.now()
    };
    
    // Check if it's a tracker
    const trackerCheck = await checkTracker(url);
    
    if (trackerCheck.isTracker) {
      const trackerData = {
        ...requestData,
        domain: trackerCheck.domain,
        company: trackerCheck.details?.company || 'Unknown',
        category: trackerCheck.details?.category || 'tracking'
      };
      
      window.__drDOM_privacy.trackers.push(trackerData);
      
      // Log for visibility
      console.log(`[Dr. DOM] 🚨 TRACKER DETECTED: ${trackerCheck.domain} (${trackerData.category})`);
      
      // Update privacy score
      updatePrivacyScore();
    }
    
    window.__drDOM_privacy.requests.push(requestData);
    
    // Save to storage
    saveData();
  }

  // Update privacy score based on trackers
  function updatePrivacyScore() {
    const trackerCount = window.__drDOM_privacy.trackers.length;
    let score = 100;
    
    // Deduct points based on tracker count and types
    const categories = {};
    window.__drDOM_privacy.trackers.forEach(tracker => {
      const cat = tracker.category || 'unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    // Heavy penalties for certain categories
    score -= (categories.Advertising || 0) * 5;
    score -= (categories.Analytics || 0) * 3;
    score -= (categories.Social || 0) * 4;
    score -= (categories.Fingerprinting || 0) * 10;
    score -= (categories.Cryptomining || 0) * 20;
    score -= (categories.unknown || 0) * 2;
    
    // Additional penalty for tracker variety
    const uniqueCompanies = new Set(window.__drDOM_privacy.trackers.map(t => t.company)).size;
    if (uniqueCompanies > 10) score -= 10;
    else if (uniqueCompanies > 5) score -= 5;
    
    window.__drDOM_privacy.privacyScore = Math.max(0, Math.min(100, score));
  }

  // Save data to storage
  function saveData() {
    const data = {
      url: window.location.href,
      hostname: DOMAIN,
      trackers: window.__drDOM_privacy.trackers,
      requests: window.__drDOM_privacy.requests,
      cookies: analyzeCookies(),
      privacyScore: window.__drDOM_privacy.privacyScore,
      timestamp: Date.now(),
      summary: generateSummary()
    };
    
    chrome.storage.local.set({ [STORAGE_KEY]: data });
  }

  // Analyze cookies for tracking
  function analyzeCookies() {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const trackingCookies = [];
    
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
      'ajs_', // Segment
    ];
    
    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      if (name) {
        for (const pattern of trackingPatterns) {
          if (name.includes(pattern)) {
            trackingCookies.push({
              name: name,
              pattern: pattern,
              category: 'tracking'
            });
            break;
          }
        }
      }
    });
    
    return trackingCookies;
  }

  // Generate privacy summary
  function generateSummary() {
    const trackers = window.__drDOM_privacy.trackers;
    const score = window.__drDOM_privacy.privacyScore;
    
    if (score >= 90) return `Excellent privacy! Only ${trackers.length} trackers found.`;
    if (score >= 70) return `Good privacy. ${trackers.length} trackers detected.`;
    if (score >= 50) return `Moderate privacy concerns. ${trackers.length} trackers active.`;
    if (score >= 30) return `Poor privacy! ${trackers.length} trackers monitoring you.`;
    return `Critical privacy issues! ${trackers.length} trackers found.`;
  }

  // INTERCEPT FETCH
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0]?.url || args[0]?.toString() || args[0];
    captureRequest(url, 'fetch', args[1]?.method || 'GET');
    return originalFetch.apply(this, args);
  };

  // INTERCEPT XHR
  const XHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._drDOM_url = url;
    this._drDOM_method = method;
    return XHROpen.apply(this, arguments);
  };
  
  const XHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    if (this._drDOM_url) {
      captureRequest(this._drDOM_url, 'xhr', this._drDOM_method);
    }
    return XHRSend.apply(this, arguments);
  };

  // MONITOR SCRIPT TAGS
  const scriptObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === 'SCRIPT' && node.src) {
          captureRequest(node.src, 'script');
        } else if (node.nodeName === 'IMG' && node.src) {
          // Check for tracking pixels (1x1 images)
          if ((node.width === 1 && node.height === 1) || 
              node.src.includes('pixel') || 
              node.src.includes('track')) {
            captureRequest(node.src, 'pixel');
          }
        }
      });
    });
  });

  scriptObserver.observe(document, {
    childList: true,
    subtree: true
  });

  // MONITOR RESOURCE TIMING
  if (window.PerformanceObserver) {
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          captureRequest(entry.name, entry.initiatorType);
        }
      }
    });
    
    try {
      perfObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('[Dr. DOM] PerformanceObserver failed:', e);
    }
  }

  // Get tracker stats from background
  chrome.runtime.sendMessage({ action: 'getTrackerStats' }, (stats) => {
    if (stats) {
      console.log(`[Dr. DOM] Tracker database loaded: ${stats.totalTrackers} domains`);
    }
  });

  // Initial save
  setTimeout(() => saveData(), 1000);
  
  // Periodic saves
  setInterval(() => saveData(), 5000);

  console.log('[Dr. DOM Privacy] ✅ Privacy monitoring active');
})();