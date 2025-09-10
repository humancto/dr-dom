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
  const BATCH_SIZE = 5; // Save every 5 requests
  const SAVE_INTERVAL = 500; // Or every 500ms, whichever comes first
  
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
    
    // Check if we should batch save
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
    
    // Check if extension context is still valid
    if (!chrome.storage || !chrome.storage.local) {
      console.warn('[Dr. DOM] Extension context lost, stopping capture');
      return;
    }
    
    const updates = window.__drDOM.pendingUpdates.splice(0);
    window.__drDOM.lastSaveTime = Date.now();
    
    // Get current data and append new updates
    try {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        if (chrome.runtime.lastError) {
          console.warn('[Dr. DOM] Extension disconnected');
          return;
        }
      const existingData = result[STORAGE_KEY] || {
        url: window.location.href,
        hostname: DOMAIN,
        requests: [],
        errors: [],
        console: [],
        scripts: [],
        trackingPixels: [],
        startTime: window.__drDOM.startTime,
        liveUpdates: []
      };
      
      // Add timestamp to updates
      const timestampedUpdates = updates.map(u => ({
        ...u,
        timestamp: Date.now()
      }));
      
      // Append to live updates array
      existingData.liveUpdates = (existingData.liveUpdates || []).concat(timestampedUpdates);
      
      // Also update the main arrays
      updates.forEach(update => {
        if (update.type === 'request') {
          existingData.requests.push(update.data);
        } else if (update.type === 'error') {
          existingData.errors.push(update.data);
        } else if (update.type === 'console') {
          existingData.console.push(update.data);
        }
      });
      
      // Include tracking pixels
      existingData.trackingPixels = window.__drDOM.trackingPixels || [];
      
      // Save with metadata
      existingData.lastUpdate = Date.now();
      existingData.totalRequests = existingData.requests.length;
      existingData.isLive = true;
      
      chrome.storage.local.set({ 
        [STORAGE_KEY]: existingData,
        [`${STORAGE_KEY}_meta`]: {
          isCapturing: true,
          lastUpdate: Date.now(),
          requestCount: existingData.requests.length
        }
      }, () => {
        if (!chrome.runtime.lastError) {
          console.log(`[Dr. DOM Live] 📦 Flushed ${updates.length} updates (Total: ${existingData.requests.length} requests)`);
        }
      });
    });
    } catch (error) {
      console.warn('[Dr. DOM] Extension context lost:', error.message);
    }
  }
  
  // Set up periodic flush with error handling
  const flushInterval = setInterval(() => {
    if (!chrome.storage || !chrome.storage.local) {
      clearInterval(flushInterval);
      console.log('[Dr. DOM] Extension disconnected, stopping flush');
      return;
    }
    flushUpdates();
  }, SAVE_INTERVAL);
  
  // Flush on page unload
  window.addEventListener('beforeunload', flushUpdates);

  // CAPTURE FETCH with streaming updates
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
      startTime,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    window.__drDOM.requests.push(requestData);
    
    // Check for tracking pixel
    const pixel = detectTrackingPixel(requestData.url);
    if (pixel) {
      window.__drDOM.trackingPixels.push(pixel);
      console.log(`[Dr. DOM] 🎯 Tracking pixel detected: ${pixel.platform}`);
    }
    
    // Stream this update immediately
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
        const contentType = response.headers.get('content-type') || '';
        if (url.includes('/api/') || url.includes('.json') || 
            contentType.includes('application/json') ||
            contentType.includes('text/json')) {
          responseClone.text().then(text => {
            try {
              const jsonData = JSON.parse(text);
              requestData.responseBody = jsonData;
              requestData.responseSize = text.length;
              requestData.isAPI = true;
              
              // Update in storage immediately for API data
              writeUpdate({
                type: 'request',
                data: { ...requestData },
                phase: 'response_body'
              });
            } catch {
              if (text.length > 0) {
                requestData.responseBody = text.substring(0, 1000);
                requestData.responseSize = text.length;
              }
            }
          }).catch(() => {});
        }
        
        writeUpdate({
          type: 'request',
          data: { ...requestData },
          phase: 'complete'
        });
        
        return response;
    }).catch(error => {
      requestData.error = error.message;
      requestData.duration = performance.now() - startTime;
      requestData.failed = true;
      
      // Stream the error
      writeUpdate({
        type: 'request',
        data: { ...requestData },
        phase: 'error'
      });
      
      throw error;
    });
  };

  // CAPTURE XHR with streaming
  const XHROpen = XMLHttpRequest.prototype.open;
  const XHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url) {
    this._drDOM = {
      method,
      url,
      startTime: performance.now(),
      timestamp: Date.now()
    };
    return XHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    if (!this._drDOM) {
      return XHRSend.apply(this, arguments);
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
        const contentType = this.getResponseHeader('content-type') || '';
        if (requestData.url.includes('/api/') || 
            requestData.url.includes('.json') ||
            contentType.includes('json')) {
          try {
            if (this.responseText) {
              const jsonData = JSON.parse(this.responseText);
              requestData.responseBody = jsonData;
              requestData.responseSize = this.responseText.length;
              requestData.isAPI = true;
            }
          } catch {
            if (this.responseText && this.responseText.length > 0) {
              requestData.responseBody = this.responseText.substring(0, 1000);
              requestData.responseSize = this.responseText.length;
            }
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
      
      // Stream XHR error
      writeUpdate({
        type: 'request',
        data: { ...requestData },
        phase: 'error'
      });
    });
    
    return XHRSend.apply(this, arguments);
  };

  // CAPTURE ERRORS with streaming
  window.addEventListener('error', (event) => {
    const errorData = {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      timestamp: Date.now()
    };
    
    window.__drDOM.errors.push(errorData);
    
    // Stream error immediately
    writeUpdate({
      type: 'error',
      data: errorData
    });
  }, true);

  // CAPTURE RESOURCES VIA PERFORMANCE OBSERVER
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        const updates = [];
        
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' || entry.entryType === 'navigation') {
            const resourceData = {
              id: Date.now() + '_' + Math.random(),
              type: 'resource',
              subType: entry.initiatorType || entry.entryType,
              url: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
              size: entry.transferSize || 0,
              timestamp: Date.now(),
              completed: true
            };
            
            window.__drDOM.requests.push(resourceData);
            
            // Batch resource updates
            updates.push({
              type: 'request',
              data: resourceData,
              phase: 'complete'
            });
          }
        }
        
        // Stream all resource updates
        updates.forEach(update => writeUpdate(update));
      });
      
      observer.observe({ entryTypes: ['resource', 'navigation'] });
    } catch (e) {
      console.warn('[Dr. DOM Live] PerformanceObserver failed:', e);
    }
  }

  // Monitor DOM for script injections
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
          const scriptData = {
            id: Date.now() + '_' + Math.random(),
            type: 'script',
            src: node.src || 'inline',
            hasContent: !!node.textContent,
            async: node.async,
            defer: node.defer,
            timestamp: Date.now()
          };
          
          window.__drDOM.scripts.push(scriptData);
          
          // Check if it's from a tracking domain
          if (node.src) {
            const pixel = detectTrackingPixel(node.src);
            if (pixel) {
              window.__drDOM.trackingPixels.push({...pixel, type: 'script'});
              console.log(`[Dr. DOM] 🎯 Tracking script detected: ${pixel.platform}`);
            }
          }
        }
      });
    });
  });
  
  // Start observing immediately
  observer.observe(document, {
    childList: true,
    subtree: true
  });

  // Mark as ready and do initial save
  window.__drDOM.ready = true;
  
  // Initial save to establish the storage entry
  chrome.storage.local.set({
    [STORAGE_KEY]: {
      url: window.location.href,
      hostname: DOMAIN,
      requests: [],
      errors: [],
      console: [],
      startTime: window.__drDOM.startTime,
      lastUpdate: Date.now(),
      isLive: true,
      liveUpdates: []
    },
    [`${STORAGE_KEY}_meta`]: {
      isCapturing: true,
      startTime: window.__drDOM.startTime,
      lastUpdate: Date.now()
    }
  }, () => {
    console.log(`[Dr. DOM Live] ✅ Live capture initialized for ${DOMAIN}`);
  });
})();