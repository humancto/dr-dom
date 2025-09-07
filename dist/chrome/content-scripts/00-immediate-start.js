/**
 * Dr. DOM Immediate Start
 * This script MUST run FIRST to capture everything from page load
 * Just like Chrome DevTools Network tab!
 */

// This runs IMMEDIATELY at document_start before ANY page scripts
(function() {
  'use strict';
  
  console.log('🔴 Dr. DOM IMMEDIATE START - Capturing from page load at:', document.readyState, 'Time:', performance.now() + 'ms');

// Start intercepting fetch IMMEDIATELY
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const startTime = performance.now();
  const [resource, config] = args;
  const url = resource.toString();
  const method = config?.method || 'GET';
  
  console.log(`📡 FETCH intercepted: ${method} ${url}`);
  
  // Store request data for later processing
  if (!window.__drDOMPendingRequests) {
    window.__drDOMPendingRequests = [];
  }
  
  const requestId = `fetch_${Date.now()}_${Math.random()}`;
  const requestData = {
    id: requestId,
    type: 'fetch',
    method,
    url,
    startTime,
    timestamp: Date.now()
  };
  
  window.__drDOMPendingRequests.push(requestData);
  
  try {
    const response = await originalFetch.apply(this, args);
    const endTime = performance.now();
    
    // Update request data with response
    requestData.status = response.status;
    requestData.statusText = response.statusText;
    requestData.duration = endTime - startTime;
    requestData.endTime = endTime;
    
    console.log(`✅ FETCH completed: ${method} ${url} - ${response.status} in ${Math.round(requestData.duration)}ms`);
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    requestData.error = error.message;
    requestData.duration = endTime - startTime;
    requestData.status = 0;
    
    console.log(`❌ FETCH failed: ${method} ${url} - ${error.message}`);
    throw error;
  }
};

// Start intercepting XMLHttpRequest IMMEDIATELY
const XHROpen = XMLHttpRequest.prototype.open;
const XHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url) {
  this._drDOMData = {
    method,
    url,
    startTime: performance.now(),
    timestamp: Date.now()
  };
  
  console.log(`📟 XHR intercepted: ${method} ${url}`);
  
  return XHROpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function(body) {
  if (!window.__drDOMPendingRequests) {
    window.__drDOMPendingRequests = [];
  }
  
  const requestId = `xhr_${Date.now()}_${Math.random()}`;
  const requestData = {
    id: requestId,
    type: 'xhr',
    ...this._drDOMData,
    body: body || null
  };
  
  window.__drDOMPendingRequests.push(requestData);
  
  this.addEventListener('loadend', function() {
    const endTime = performance.now();
    requestData.status = this.status;
    requestData.statusText = this.statusText;
    requestData.duration = endTime - requestData.startTime;
    requestData.endTime = endTime;
    requestData.responseSize = this.responseText?.length || 0;
    
    console.log(`✅ XHR completed: ${requestData.method} ${requestData.url} - ${this.status} in ${Math.round(requestData.duration)}ms`);
  });
  
  this.addEventListener('error', function() {
    requestData.error = 'Network error';
    requestData.status = 0;
    console.log(`❌ XHR failed: ${requestData.method} ${requestData.url}`);
  });
  
  return XHRSend.apply(this, arguments);
};

// Intercept document resource loading
if (window.PerformanceObserver) {
  try {
    const observer = new PerformanceObserver((list) => {
      if (!window.__drDOMPendingRequests) {
        window.__drDOMPendingRequests = [];
      }
      
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const requestData = {
            id: `resource_${Date.now()}_${Math.random()}`,
            type: 'resource',
            subType: entry.initiatorType,
            url: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            status: entry.responseStatus || 200,
            size: entry.transferSize || 0,
            timestamp: Date.now()
          };
          
          window.__drDOMPendingRequests.push(requestData);
          console.log(`📦 Resource loaded: ${entry.initiatorType} - ${entry.name}`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
    console.log('✅ Performance Observer active - capturing all resources');
  } catch (e) {
    console.warn('Performance Observer not available:', e);
  }
}

// Track errors from the very beginning
window.addEventListener('error', (event) => {
  if (!window.__drDOMPendingErrors) {
    window.__drDOMPendingErrors = [];
  }
  
  window.__drDOMPendingErrors.push({
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error,
    timestamp: Date.now()
  });
  
  console.log(`🐛 Error captured: ${event.message}`);
}, true);

// Track console from the beginning
const originalConsoleError = console.error;
console.error = function(...args) {
  if (!window.__drDOMPendingConsole) {
    window.__drDOMPendingConsole = [];
  }
  
  window.__drDOMPendingConsole.push({
    level: 'error',
    message: args.join(' '),
    timestamp: Date.now()
  });
  
  return originalConsoleError.apply(console, args);
};

console.log('🎯 Dr. DOM is NOW capturing ALL network requests, errors, and console messages from page load!');
console.log('📊 Pending data will be processed when components are ready');

// Flag that immediate capture is active
window.__drDOMImmediateCapture = true;

})(); // End IIFE - ensures immediate execution