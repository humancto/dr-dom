/**
 * LIVE ASYNC CAPTURE - Fixed version with proper XHR/Fetch tracking
 * Runs at document_start and streams data to storage
 */

(() => {
  'use strict';
  
  // Initialize capture state
  window.__drDOM = {
    requests: [],
    errors: [],
    console: [],
    scripts: [],
    trackingPixels: [],
    securityIssues: [],
    cookies: [],
    startTime: performance.now(),
    ready: false,
    lastSaveTime: 0,
    pendingUpdates: []
  };

  const DOMAIN = window.location.hostname;
  const STORAGE_KEY = `drDOM_${DOMAIN}`;
  const BATCH_SIZE = 5;
  const SAVE_INTERVAL = 500;
  
  console.log(`[Dr. DOM Live] 🚀 Starting live capture for ${DOMAIN}`);

  // Enhanced tracking pixel patterns with Meta and more
  const TRACKING_PIXELS = {
    meta: ['facebook.com/tr', 'connect.facebook.net', 'facebook.com/en_US/fbevents.js'],
    google: ['google-analytics.com', 'googletagmanager.com', 'doubleclick.net', 'google.com/ads', 'googleadservices.com'],
    linkedin: ['px.ads.linkedin.com', 'linkedin.com/px'],
    twitter: ['analytics.twitter.com', 't.co/i/adsct'],
    tiktok: ['analytics.tiktok.com', 'analytics-sg.tiktok.com'],
    pinterest: ['ct.pinterest.com', 'pinterest.com/v3'],
    amazon: ['amazon-adsystem.com', 'amazon-adsystem.com/aax2'],
    hotjar: ['static.hotjar.com', 'script.hotjar.com'],
    mixpanel: ['cdn.mxpnl.com', 'api.mixpanel.com', 'api-js.mixpanel.com'],
    segment: ['cdn.segment.com', 'cdn.segment.io'],
    hubspot: ['js.hs-scripts.com', 'track.hubspot.com', 'js.hsforms.net'],
    clarity: ['clarity.ms', 'c.clarity.ms'],
    fullstory: ['fullstory.com/s', 'fullstory.com/rec'],
    heap: ['heap.io', 'heapanalytics.com', 'cdn.heapanalytics.com']
  };

  // Detect tracking pixels with better matching
  function detectTrackingPixel(url) {
    if (!url) return null;
    
    const urlLower = url.toLowerCase();
    for (const [platform, patterns] of Object.entries(TRACKING_PIXELS)) {
      for (const pattern of patterns) {
        if (urlLower.includes(pattern.toLowerCase())) {
          return { 
            platform, 
            url, 
            timestamp: Date.now(),
            type: 'pixel'
          };
        }
      }
    }
    return null;
  }

  // Async function to write updates to storage
  async function writeUpdate(update) {
    window.__drDOM.pendingUpdates.push(update);
    
    const shouldSave = 
      window.__drDOM.pendingUpdates.length >= BATCH_SIZE ||
      (Date.now() - window.__drDOM.lastSaveTime) > SAVE_INTERVAL;
    
    if (shouldSave) {
      flushUpdates();
    }
  }
  
  // Flush pending updates to storage
  function flushUpdates() {
    if (window.__drDOM.pendingUpdates.length === 0) return;
    
    const updates = window.__drDOM.pendingUpdates.splice(0);
    window.__drDOM.lastSaveTime = Date.now();
    
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const existingData = result[STORAGE_KEY] || {
        url: window.location.href,
        hostname: DOMAIN,
        requests: [],
        errors: [],
        console: [],
        scripts: [],
        trackingPixels: [],
        cookies: [],
        startTime: window.__drDOM.startTime,
        liveUpdates: []
      };
      
      const timestampedUpdates = updates.map(u => ({
        ...u,
        timestamp: Date.now()
      }));
      
      existingData.liveUpdates = (existingData.liveUpdates || []).concat(timestampedUpdates);
      
      updates.forEach(update => {
        if (update.type === 'request') {
          existingData.requests.push(update.data);
        } else if (update.type === 'error') {
          existingData.errors.push(update.data);
        } else if (update.type === 'console') {
          existingData.console.push(update.data);
        } else if (update.type === 'tracking') {
          existingData.trackingPixels.push(update.data);
        }
      });
      
      // Include all captured data
      existingData.trackingPixels = [...new Set([...existingData.trackingPixels, ...window.__drDOM.trackingPixels])];
      existingData.scripts = window.__drDOM.scripts || [];
      existingData.cookies = window.__drDOM.cookies || [];
      
      existingData.lastUpdate = Date.now();
      existingData.totalRequests = existingData.requests.length;
      existingData.isLive = true;
      
      chrome.storage.local.set({ 
        [STORAGE_KEY]: existingData,
        [`${STORAGE_KEY}_meta`]: {
          isCapturing: true,
          lastUpdate: Date.now(),
          requestCount: existingData.requests.length,
          trackingCount: existingData.trackingPixels.length
        }
      }, () => {
        console.log(`[Dr. DOM Live] 📦 Saved: ${existingData.requests.length} requests, ${existingData.trackingPixels.length} trackers`);
      });
    });
  }
  
  setInterval(flushUpdates, SAVE_INTERVAL);
  window.addEventListener('beforeunload', flushUpdates);

  // ENHANCED FETCH CAPTURE
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const requestId = Date.now() + '_' + Math.random();
    const startTime = performance.now();
    const [resource, config] = args;
    const url = resource.toString();
    
    const requestData = {
      id: requestId,
      type: 'fetch',
      url: url,
      method: config?.method || 'GET',
      headers: config?.headers || {},
      startTime,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    window.__drDOM.requests.push(requestData);
    
    // Check for tracking pixel
    const pixel = detectTrackingPixel(url);
    if (pixel) {
      window.__drDOM.trackingPixels.push(pixel);
      console.log(`[Dr. DOM] 🎯 Tracking pixel detected: ${pixel.platform} - ${url.substring(0, 50)}...`);
      writeUpdate({ type: 'tracking', data: pixel });
    }
    
    writeUpdate({
      type: 'request',
      data: requestData,
      phase: 'start'
    });
    
    return originalFetch.apply(this, args)
      .then(response => {
        const responseClone = response.clone();
        
        requestData.status = response.status;
        requestData.statusText = response.statusText;
        requestData.duration = performance.now() - startTime;
        requestData.completed = true;
        requestData.responseHeaders = {};
        
        // Capture response headers
        response.headers.forEach((value, key) => {
          requestData.responseHeaders[key] = value;
        });
        
        // Try to capture response body for API analysis
        if (url.includes('/api/') || url.includes('.json') || 
            response.headers.get('content-type')?.includes('application/json')) {
          responseClone.text().then(text => {
            try {
              requestData.responseBody = JSON.parse(text);
              requestData.responseSize = text.length;
            } catch {
              requestData.responseBody = text.substring(0, 1000); // First 1000 chars
              requestData.responseSize = text.length;
            }
          }).catch(() => {});
        }
        
        writeUpdate({
          type: 'request',
          data: { ...requestData },
          phase: 'complete'
        });
        
        return response;
      })
      .catch(error => {
        requestData.error = error.message;
        requestData.duration = performance.now() - startTime;
        requestData.failed = true;
        requestData.status = 0;
        
        writeUpdate({
          type: 'request',
          data: { ...requestData },
          phase: 'error'
        });
        
        throw error;
      });
  };

  // ENHANCED XHR CAPTURE
  const XHRProto = XMLHttpRequest.prototype;
  const originalOpen = XHRProto.open;
  const originalSend = XHRProto.send;
  const originalSetRequestHeader = XHRProto.setRequestHeader;
  
  XHRProto.open = function(method, url, ...args) {
    this._drDOM = {
      method,
      url: url.toString(),
      startTime: performance.now(),
      timestamp: Date.now(),
      headers: {}
    };
    return originalOpen.apply(this, [method, url, ...args]);
  };
  
  XHRProto.setRequestHeader = function(name, value) {
    if (this._drDOM) {
      this._drDOM.headers[name] = value;
    }
    return originalSetRequestHeader.apply(this, arguments);
  };
  
  XHRProto.send = function(body) {
    if (!this._drDOM) {
      return originalSend.apply(this, arguments);
    }
    
    const requestData = {
      id: Date.now() + '_' + Math.random(),
      type: 'xhr',
      ...this._drDOM,
      body: body,
      status: 'pending'
    };
    
    window.__drDOM.requests.push(requestData);
    
    // Check for tracking pixel
    const pixel = detectTrackingPixel(requestData.url);
    if (pixel) {
      window.__drDOM.trackingPixels.push(pixel);
      console.log(`[Dr. DOM] 🎯 XHR Tracking detected: ${pixel.platform}`);
      writeUpdate({ type: 'tracking', data: pixel });
    }
    
    writeUpdate({
      type: 'request',
      data: requestData,
      phase: 'start'
    });
    
    // Monitor for response
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 4) { // Complete
        requestData.status = this.status;
        requestData.statusText = this.statusText;
        requestData.duration = performance.now() - requestData.startTime;
        requestData.completed = true;
        requestData.responseHeaders = this.getAllResponseHeaders();
        
        // Capture response for API analysis
        if (requestData.url.includes('/api/') || 
            this.getResponseHeader('content-type')?.includes('json')) {
          try {
            requestData.responseBody = JSON.parse(this.responseText);
            requestData.responseSize = this.responseText.length;
          } catch {
            requestData.responseBody = this.responseText.substring(0, 1000);
            requestData.responseSize = this.responseText.length;
          }
        }
        
        writeUpdate({
          type: 'request',
          data: { ...requestData },
          phase: 'complete'
        });
      }
    });
    
    this.addEventListener('error', function() {
      requestData.error = 'Network error';
      requestData.failed = true;
      requestData.status = 0;
      
      writeUpdate({
        type: 'request',
        data: { ...requestData },
        phase: 'error'
      });
    });
    
    return originalSend.apply(this, arguments);
  };

  // CAPTURE ERRORS
  window.addEventListener('error', (event) => {
    const errorData = {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      timestamp: Date.now()
    };
    
    window.__drDOM.errors.push(errorData);
    writeUpdate({ type: 'error', data: errorData });
  }, true);

  // CAPTURE COOKIES
  function captureCookies() {
    try {
      const cookies = document.cookie.split(';').map(c => {
        const [name, value] = c.trim().split('=');
        return { name, value: value || '', size: c.length };
      }).filter(c => c.name);
      
      window.__drDOM.cookies = cookies;
      
      // Check for tracking cookies
      cookies.forEach(cookie => {
        const trackingPatterns = ['_ga', '_gid', 'fbp', 'fbc', '_utm'];
        if (trackingPatterns.some(p => cookie.name.includes(p))) {
          console.log(`[Dr. DOM] 🍪 Tracking cookie: ${cookie.name}`);
        }
      });
    } catch (e) {
      console.warn('[Dr. DOM] Cookie capture failed:', e);
    }
  }
  
  // Capture cookies periodically
  captureCookies();
  setInterval(captureCookies, 5000);

  // PERFORMANCE OBSERVER - Don't duplicate XHR/Fetch
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            // Skip XHR/Fetch as we capture them directly
            if (entry.initiatorType === 'xmlhttprequest' || 
                entry.initiatorType === 'fetch') {
              continue;
            }
            
            const resourceData = {
              id: Date.now() + '_' + Math.random(),
              type: entry.initiatorType || 'resource',
              url: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
              size: entry.transferSize || 0,
              status: entry.responseStatus || 200,
              timestamp: Date.now(),
              completed: true
            };
            
            // Check for tracking resources
            const pixel = detectTrackingPixel(entry.name);
            if (pixel) {
              window.__drDOM.trackingPixels.push(pixel);
              console.log(`[Dr. DOM] 🎯 Resource tracking: ${pixel.platform}`);
            }
            
            window.__drDOM.requests.push(resourceData);
            writeUpdate({ type: 'request', data: resourceData });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('[Dr. DOM] PerformanceObserver failed:', e);
    }
  }

  // Monitor DOM for script injections
  const domObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
          const scriptData = {
            id: Date.now() + '_' + Math.random(),
            type: 'script',
            src: node.src || 'inline',
            async: node.async,
            defer: node.defer,
            timestamp: Date.now()
          };
          
          window.__drDOM.scripts.push(scriptData);
          
          if (node.src) {
            const pixel = detectTrackingPixel(node.src);
            if (pixel) {
              window.__drDOM.trackingPixels.push({...pixel, type: 'script'});
              console.log(`[Dr. DOM] 🎯 Tracking script: ${pixel.platform}`);
            }
          }
        }
      });
    });
  });
  
  domObserver.observe(document, {
    childList: true,
    subtree: true
  });

  // Mark as ready and initial save
  window.__drDOM.ready = true;
  
  chrome.storage.local.set({
    [STORAGE_KEY]: {
      url: window.location.href,
      hostname: DOMAIN,
      requests: [],
      errors: [],
      console: [],
      trackingPixels: [],
      cookies: [],
      scripts: [],
      startTime: window.__drDOM.startTime,
      lastUpdate: Date.now(),
      isLive: true,
      liveUpdates: []
    }
  }, () => {
    console.log('[Dr. DOM Live] ✅ Ready and monitoring!');
  });

})();