/**
 * LIVE ASYNC CAPTURE - Writes data continuously as it happens
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

  // Tracking pixel patterns
  const TRACKING_PIXELS = {
    facebook: ['facebook.com/tr', 'connect.facebook.net'],
    google: ['google-analytics.com', 'googletagmanager.com', 'doubleclick.net'],
    linkedin: ['px.ads.linkedin.com'],
    twitter: ['analytics.twitter.com'],
    tiktok: ['analytics.tiktok.com'],
    pinterest: ['ct.pinterest.com'],
    amazon: ['amazon-adsystem.com'],
    hotjar: ['static.hotjar.com'],
    mixpanel: ['cdn.mxpnl.com', 'api.mixpanel.com'],
    segment: ['cdn.segment.com'],
    hubspot: ['js.hs-scripts.com', 'track.hubspot.com']
  };

  // Detect tracking pixels
  function detectTrackingPixel(url) {
    for (const [platform, patterns] of Object.entries(TRACKING_PIXELS)) {
      if (patterns.some(p => url.includes(p))) {
        return { platform, url, timestamp: Date.now() };
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
    
    const updates = window.__drDOM.pendingUpdates.splice(0);
    window.__drDOM.lastSaveTime = Date.now();
    
    // Get current data and append new updates
    chrome.storage.local.get(STORAGE_KEY, (result) => {
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
        console.log(`[Dr. DOM Live] 📦 Flushed ${updates.length} updates (Total: ${existingData.requests.length} requests)`);
      });
    });
  }
  
  // Set up periodic flush
  setInterval(flushUpdates, SAVE_INTERVAL);
  
  // Flush on page unload
  window.addEventListener('beforeunload', flushUpdates);

  // CAPTURE FETCH with streaming updates
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const requestId = Date.now() + '_' + Math.random();
    const startTime = performance.now();
    const [resource, config] = args;
    
    const requestData = {
      id: requestId,
      type: 'fetch',
      url: resource.toString(),
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
    
    return originalFetch.apply(this, args).then(response => {
      requestData.status = response.status;
      requestData.duration = performance.now() - startTime;
      requestData.completed = true;
      
      // Stream the completion
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
    const requestData = {
      id: Date.now() + '_' + Math.random(),
      type: 'xhr',
      ...this._drDOM,
      status: 'pending'
    };
    
    window.__drDOM.requests.push(requestData);
    
    // Check for tracking pixel
    const pixel = detectTrackingPixel(requestData.url);
    if (pixel) {
      window.__drDOM.trackingPixels.push(pixel);
      console.log(`[Dr. DOM] 🎯 Tracking pixel detected: ${pixel.platform}`);
    }
    
    // Stream XHR start
    writeUpdate({
      type: 'request',
      data: requestData,
      phase: 'start'
    });
    
    this.addEventListener('loadend', function() {
      requestData.status = this.status;
      requestData.duration = performance.now() - requestData.startTime;
      requestData.completed = true;
      
      // Stream XHR completion
      writeUpdate({
        type: 'request',
        data: { ...requestData },
        phase: 'complete'
      });
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