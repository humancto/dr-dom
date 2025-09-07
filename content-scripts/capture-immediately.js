/**
 * CAPTURE EVERYTHING IMMEDIATELY - NO DELAYS, NO WAITING
 * This runs at document_start before ANYTHING else
 */

(() => {
  'use strict';
  
  // Create global storage if not exists
  if (!window.__drDOM) {
    window.__drDOM = {
      requests: [],
      errors: [],
      console: [],
      startTime: performance.now(),
      ready: false
    };
  }
  
  // Function to save captured data to chrome.storage
  function saveToStorage() {
    try {
      const data = {
        url: window.location.href,
        hostname: window.location.hostname,
        timestamp: Date.now(),
        requests: window.__drDOM.requests,
        errors: window.__drDOM.errors,
        console: window.__drDOM.console,
        startTime: window.__drDOM.startTime
      };
      
      // Save directly to chrome.storage.local
      const domain = window.location.hostname;
      const storageKey = `drDOM_${domain}`;
      
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ 
          [storageKey]: data,
          'drDOM_currentDomain': domain 
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('[Dr. DOM] Storage error:', chrome.runtime.lastError);
          } else {
            console.log(`[Dr. DOM] 💾 Saved ${data.requests.length} requests to storage for ${domain}`);
          }
        });
      }
    } catch (e) {
      console.error('[Dr. DOM] Failed to save to storage:', e);
    }
  }

  console.log(`[Dr. DOM] Capturing started at ${performance.now()}ms - document state: ${document.readyState}`);

  // CAPTURE FETCH IMMEDIATELY
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
      timestamp: Date.now()
    };
    
    window.__drDOM.requests.push(requestData);
    console.log(`[Dr. DOM] Captured fetch: ${requestData.method} ${requestData.url}`);
    saveToStorage(); // Save after capture
    
    return originalFetch.apply(this, args).then(response => {
      requestData.status = response.status;
      requestData.duration = performance.now() - startTime;
      requestData.completed = true;
      saveToStorage(); // Save after completion
      return response;
    }).catch(error => {
      requestData.error = error.message;
      requestData.duration = performance.now() - startTime;
      requestData.failed = true;
      saveToStorage(); // Save after error
      throw error;
    });
  };

  // CAPTURE XHR IMMEDIATELY
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
      body: body ? String(body).substring(0, 1000) : null
    };
    
    window.__drDOM.requests.push(requestData);
    console.log(`[Dr. DOM] Captured XHR: ${requestData.method} ${requestData.url}`);
    saveToStorage(); // Save after capture
    
    this.addEventListener('loadend', function() {
      requestData.status = this.status;
      requestData.duration = performance.now() - requestData.startTime;
      requestData.completed = true;
      saveToStorage(); // Save after completion
    });
    
    this.addEventListener('error', function() {
      requestData.error = 'Network error';
      requestData.failed = true;
      saveToStorage(); // Save after error
    });
    
    return XHRSend.apply(this, arguments);
  };

  // CAPTURE ERRORS IMMEDIATELY
  window.addEventListener('error', (event) => {
    const errorData = {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      timestamp: Date.now()
    };
    window.__drDOM.errors.push(errorData);
    console.log(`[Dr. DOM] Captured error: ${event.message}`);
    saveToStorage(); // Save after error capture
  }, true);

  // CAPTURE CONSOLE IMMEDIATELY
  ['log', 'error', 'warn', 'info'].forEach(method => {
    const original = console[method];
    console[method] = function(...args) {
      window.__drDOM.console.push({
        method,
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
        timestamp: Date.now()
      });
      return original.apply(console, args);
    };
  });

  // CAPTURE WEBSOCKETS
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    console.log(`[Dr. DOM] WebSocket connection: ${url}`);
    
    const ws = new OriginalWebSocket(url, protocols);
    const wsData = {
      id: Date.now() + '_ws_' + Math.random(),
      type: 'websocket',
      url: url,
      protocols: protocols,
      timestamp: Date.now(),
      messages: [],
      status: 'connecting'
    };
    
    window.__drDOM.requests.push(wsData);
    
    // Monitor WebSocket events
    ws.addEventListener('open', () => {
      wsData.status = 'open';
      wsData.openTime = Date.now();
      console.log(`[Dr. DOM] WebSocket opened: ${url}`);
      saveToStorage();
    });
    
    ws.addEventListener('message', (event) => {
      wsData.messages.push({
        direction: 'incoming',
        data: event.data,
        timestamp: Date.now()
      });
      // Only keep last 100 messages to avoid memory issues
      if (wsData.messages.length > 100) {
        wsData.messages = wsData.messages.slice(-100);
      }
      saveToStorage();
    });
    
    ws.addEventListener('error', () => {
      wsData.status = 'error';
      wsData.errorTime = Date.now();
      saveToStorage();
    });
    
    ws.addEventListener('close', () => {
      wsData.status = 'closed';
      wsData.closeTime = Date.now();
      saveToStorage();
    });
    
    // Intercept send
    const originalSend = ws.send;
    ws.send = function(data) {
      wsData.messages.push({
        direction: 'outgoing',
        data: data,
        timestamp: Date.now()
      });
      return originalSend.apply(ws, arguments);
    };
    
    return ws;
  };
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  window.WebSocket.prototype.constructor = window.WebSocket;

  // CAPTURE EVENT SOURCES (Server-Sent Events)
  const OriginalEventSource = window.EventSource;
  if (OriginalEventSource) {
    window.EventSource = function(url, config) {
      console.log(`[Dr. DOM] EventSource connection: ${url}`);
      
      const es = new OriginalEventSource(url, config);
      const esData = {
        id: Date.now() + '_es_' + Math.random(),
        type: 'eventsource',
        url: url,
        timestamp: Date.now(),
        events: [],
        status: 'connecting'
      };
      
      window.__drDOM.requests.push(esData);
      
      es.addEventListener('open', () => {
        esData.status = 'open';
        saveToStorage();
      });
      
      es.addEventListener('message', (event) => {
        esData.events.push({
          data: event.data,
          timestamp: Date.now()
        });
        // Keep last 100 events
        if (esData.events.length > 100) {
          esData.events = esData.events.slice(-100);
        }
        saveToStorage();
      });
      
      es.addEventListener('error', () => {
        esData.status = 'error';
        saveToStorage();
      });
      
      return es;
    };
  }

  // CAPTURE RESOURCES VIA PERFORMANCE OBSERVER
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' || entry.entryType === 'navigation') {
            window.__drDOM.requests.push({
              id: Date.now() + '_' + Math.random(),
              type: 'resource',
              subType: entry.initiatorType || entry.entryType,
              url: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
              size: entry.transferSize || 0,
              timestamp: Date.now()
            });
            console.log(`[Dr. DOM] Captured resource: ${entry.name}`);
            saveToStorage(); // Save after resource capture
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource', 'navigation'] });
    } catch (e) {
      console.warn('[Dr. DOM] PerformanceObserver failed:', e);
    }
  }

  // Mark as ready
  window.__drDOM.ready = true;
  console.log(`[Dr. DOM] ✅ Capture system ready! Already captured ${window.__drDOM.requests.length} requests`);
  
  // Save initial state to storage
  saveToStorage();
  
  // Auto-save every 2 seconds
  setInterval(saveToStorage, 2000);
  
  // Listen for page unload to save final state
  window.addEventListener('beforeunload', () => {
    saveToStorage();
  });
  
  // Monitor DOM changes for dynamic content
  if (window.MutationObserver) {
    let mutationCount = 0;
    const observer = new MutationObserver(() => {
      mutationCount++;
      // Save every 50 mutations to avoid excessive saves
      if (mutationCount % 50 === 0) {
        saveToStorage();
      }
    });
    
    // Start observing when DOM is ready
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true
        });
      });
    }
  }
})();