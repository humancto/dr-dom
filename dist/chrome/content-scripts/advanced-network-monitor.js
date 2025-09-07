/**
 * Dr. DOM Advanced Network Monitor
 * Comprehensive HTTP analysis with detailed request tracking, performance metrics,
 * and intelligent insights for professional web analysis
 */

class DrDOMAdvancedNetworkMonitor {
  constructor() {
    this.isMonitoring = false;
    this.requests = new Map(); // Use Map for better performance
    this.requestsByDomain = new Map();
    this.requestsByEndpoint = new Map();
    this.performanceEntries = new Map();
    
    // Comprehensive metrics
    this.metrics = {
      totalRequests: 0,
      uniqueEndpoints: 0,
      uniqueDomains: 0,
      totalDataTransferred: 0,
      totalDataReceived: 0,
      averageResponseTime: 0,
      fastestRequest: null,
      slowestRequest: null,
      statusCodes: {
        '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0
      },
      requestTypes: {
        xhr: 0, fetch: 0, document: 0, script: 0, 
        stylesheet: 0, image: 0, font: 0, other: 0
      },
      securityMetrics: {
        httpsRequests: 0,
        httpRequests: 0,
        mixedContent: 0,
        corsRequests: 0,
        thirdPartyRequests: 0
      },
      performanceMetrics: {
        slowRequests: 0, // > 2s
        failedRequests: 0,
        cachedRequests: 0,
        redundantRequests: 0
      }
    };
    
    // Request patterns and intelligence
    this.patterns = {
      apis: new Map(),
      graphqlQueries: [],
      webSocketConnections: [],
      repeatedUrls: new Map(),
      errorPatterns: new Map()
    };
    
    // Timing breakdown for each request
    this.timingAnalysis = new Map();
    
    this.init();
  }

  init() {
    this.setupAdvancedInterception();
    this.setupPerformanceObserver();
    this.setupResourceTimingObserver();
    console.log('🌐 Advanced Network Monitor initialized - comprehensive analysis ready!');
  }

  setupAdvancedInterception() {
    // Enhanced Fetch API interception
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const requestId = this.generateRequestId();
      const startTime = performance.now();
      const startTimestamp = Date.now();
      
      const requestData = this.createAdvancedRequestData(args, 'fetch', requestId, startTime, startTimestamp);
      
      if (this.isMonitoring) {
        this.addRequest(requestData);
      }

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        
        await this.processAdvancedResponse(requestData, response, endTime);
        
        if (this.isMonitoring) {
          this.updateRequestWithResponse(requestData);
          this.analyzeRequest(requestData);
        }

        return response;
        
      } catch (error) {
        const endTime = performance.now();
        this.processRequestError(requestData, error, endTime);
        
        if (this.isMonitoring) {
          this.updateRequestWithError(requestData);
        }
        
        throw error;
      }
    };

    // Enhanced XMLHttpRequest interception
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const requestId = this.generateRequestId ? this.generateRequestId() : 'xhr_' + Date.now();
      let requestData = null;
      let startTime = 0;

      // Override open method
      const originalOpen = xhr.open;
      xhr.open = function(method, url, async, user, password) {
        startTime = performance.now();
        requestData = window.drDOMAdvancedNetworkMonitor?.createXHRRequestData(
          method, url, requestId, startTime
        );
        
        if (window.drDOMAdvancedNetworkMonitor?.isMonitoring && requestData) {
          window.drDOMAdvancedNetworkMonitor.addRequest(requestData);
        }
        
        return originalOpen.call(this, method, url, async, user, password);
      };

      // Override send method
      const originalSend = xhr.send;
      xhr.send = function(body) {
        if (requestData && body) {
          requestData.requestBody = window.drDOMAdvancedNetworkMonitor?.extractBody(body) || '';
          requestData.requestSize = body.toString().length;
        }
        
        return originalSend.call(this, body);
      };

      // Monitor response
      xhr.addEventListener('loadend', function() {
        if (requestData && window.drDOMAdvancedNetworkMonitor?.isMonitoring) {
          const endTime = performance.now();
          window.drDOMAdvancedNetworkMonitor.processXHRResponse(requestData, xhr, endTime);
        }
      });

      return xhr;
    };
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        // Navigation timing
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.analyzeNavigationTiming(entry);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });

        // Resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              this.analyzeResourceTiming(entry);
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

      } catch (error) {
        console.warn('PerformanceObserver setup failed:', error);
      }
    }
  }

  setupResourceTimingObserver() {
    // Monitor resource loading with detailed timing
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.correlateResourceTiming(entry);
          }
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource timing observer failed:', error);
      }
    }
  }

  createAdvancedRequestData(fetchArgs, type, id, startTime, timestamp) {
    const url = typeof fetchArgs[0] === 'string' ? fetchArgs[0] : fetchArgs[0].url;
    const options = fetchArgs[1] || {};
    const urlObj = new URL(url, window.location.origin);
    
    const requestData = {
      // Basic info
      id,
      type,
      method: options.method || 'GET',
      url,
      urlObj,
      domain: urlObj.hostname,
      pathname: urlObj.pathname,
      search: urlObj.search,
      
      // Timing
      startTime,
      endTime: null,
      duration: null,
      timestamp,
      
      // Request details
      requestHeaders: this.extractHeaders(options.headers),
      requestBody: this.extractBody(options.body),
      requestSize: this.calculateRequestSize(options),
      
      // Response details (filled later)
      status: null,
      statusText: null,
      responseHeaders: {},
      responseBody: null,
      responseSize: 0,
      contentType: null,
      
      // Advanced analysis
      isThirdParty: this.isThirdPartyRequest(urlObj.hostname),
      isSecure: urlObj.protocol === 'https:',
      hasCacheHeaders: false,
      cacheStatus: 'unknown',
      
      // Performance flags
      isSlowRequest: false,
      isCriticalPath: false,
      isRedundant: false,
      
      // Detailed timing breakdown (filled from resource timing)
      timingBreakdown: {
        dns: 0,
        connect: 0,
        ssl: 0,
        send: 0,
        wait: 0, // TTFB
        receive: 0
      },
      
      // Error info
      error: null,
      errorType: null,
      
      // Context
      initiator: this.detectInitiator(),
      stackTrace: this.captureStackTrace(),
      
      // Security analysis
      securityIssues: [],
      privacyIssues: []
    };
    
    return requestData;
  }

  createXHRRequestData(method, url, id, startTime) {
    const urlObj = new URL(url, window.location.origin);
    
    return {
      id,
      type: 'xhr',
      method: method.toUpperCase(),
      url,
      urlObj,
      domain: urlObj.hostname,
      pathname: urlObj.pathname,
      search: urlObj.search,
      startTime,
      timestamp: Date.now(),
      requestHeaders: {},
      requestBody: '',
      requestSize: 0,
      isThirdParty: this.isThirdPartyRequest(urlObj.hostname),
      isSecure: urlObj.protocol === 'https:',
      timingBreakdown: { dns: 0, connect: 0, ssl: 0, send: 0, wait: 0, receive: 0 },
      securityIssues: [],
      privacyIssues: [],
      stackTrace: this.captureStackTrace()
    };
  }

  async processAdvancedResponse(requestData, response, endTime) {
    requestData.endTime = endTime;
    requestData.duration = Math.round(endTime - requestData.startTime);
    requestData.status = response.status;
    requestData.statusText = response.statusText;
    
    // Extract response headers
    requestData.responseHeaders = this.extractResponseHeaders(response.headers);
    requestData.contentType = response.headers.get('content-type') || 'unknown';
    
    // Analyze cache headers
    this.analyzeCacheHeaders(requestData, requestData.responseHeaders);
    
    // Security analysis
    this.analyzeSecurityHeaders(requestData, requestData.responseHeaders);
    
    // Try to read response body
    try {
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      requestData.responseBody = this.processResponseBody(responseText, requestData.contentType);
      requestData.responseSize = responseText.length;
      
      // Detect API patterns
      this.detectAPIPatterns(requestData, responseText);
      
    } catch (error) {
      requestData.responseBody = '[Unable to read response body]';
      requestData.responseSize = 0;
    }
    
    // Performance flags
    requestData.isSlowRequest = requestData.duration > 2000;
  }

  processXHRResponse(requestData, xhr, endTime) {
    requestData.endTime = endTime;
    requestData.duration = Math.round(endTime - requestData.startTime);
    requestData.status = xhr.status;
    requestData.statusText = xhr.statusText;
    
    // Get response headers
    const responseHeaders = {};
    try {
      const headerString = xhr.getAllResponseHeaders();
      if (headerString) {
        headerString.split('\r\n').forEach(line => {
          const parts = line.split(': ');
          if (parts.length === 2) {
            responseHeaders[parts[0].toLowerCase()] = parts[1];
          }
        });
      }
    } catch (error) {
      console.warn('Failed to get XHR headers:', error);
    }
    
    requestData.responseHeaders = responseHeaders;
    requestData.contentType = responseHeaders['content-type'] || 'unknown';
    
    // Get response body
    try {
      requestData.responseBody = this.processResponseBody(xhr.responseText || xhr.response, requestData.contentType);
      requestData.responseSize = (xhr.responseText || '').length;
    } catch (error) {
      requestData.responseBody = '[Unable to read XHR response]';
      requestData.responseSize = 0;
    }
    
    // Analyze cache and security
    this.analyzeCacheHeaders(requestData, responseHeaders);
    this.analyzeSecurityHeaders(requestData, responseHeaders);
    
    // Update request
    this.updateRequestWithResponse(requestData);
    this.analyzeRequest(requestData);
  }

  processRequestError(requestData, error, endTime) {
    requestData.endTime = endTime;
    requestData.duration = Math.round(endTime - requestData.startTime);
    requestData.error = error.message;
    requestData.errorType = error.name;
    requestData.status = 0;
    requestData.statusText = 'Network Error';
    
    // Analyze error type
    if (error.name === 'TypeError' && error.message.includes('CORS')) {
      requestData.securityIssues.push('CORS Error');
    } else if (error.message.includes('net::ERR_')) {
      requestData.errorType = 'Network Error';
    }
  }

  addRequest(requestData) {
    this.requests.set(requestData.id, requestData);
    
    // Track by domain
    const domainRequests = this.requestsByDomain.get(requestData.domain) || [];
    domainRequests.push(requestData.id);
    this.requestsByDomain.set(requestData.domain, domainRequests);
    
    // Track by endpoint
    const endpoint = `${requestData.method} ${requestData.pathname}`;
    const endpointRequests = this.requestsByEndpoint.get(endpoint) || [];
    endpointRequests.push(requestData.id);
    this.requestsByEndpoint.set(endpoint, endpointRequests);
    
    // Check for redundant requests
    const urlCounts = this.patterns.repeatedUrls.get(requestData.url) || 0;
    this.patterns.repeatedUrls.set(requestData.url, urlCounts + 1);
    if (urlCounts > 0) {
      requestData.isRedundant = true;
    }
    
    this.updateMetrics();
    
    // Notify UI of new request
    if (window.drDOMCoordinator) {
      window.drDOMCoordinator.onNetworkActivity('request_started', requestData);
    }
  }

  updateRequestWithResponse(requestData) {
    // Update the stored request
    this.requests.set(requestData.id, requestData);
    this.updateMetrics();
    
    // Notify UI of completed request
    if (window.drDOMCoordinator) {
      window.drDOMCoordinator.onNetworkActivity('request_completed', requestData);
    }
  }

  updateRequestWithError(requestData) {
    this.requests.set(requestData.id, requestData);
    this.updateMetrics();
    
    // Track error patterns
    const errorPattern = `${requestData.errorType}: ${requestData.domain}`;
    const errorCount = this.patterns.errorPatterns.get(errorPattern) || 0;
    this.patterns.errorPatterns.set(errorPattern, errorCount + 1);
    
    if (window.drDOMCoordinator) {
      window.drDOMCoordinator.onNetworkActivity('request_failed', requestData);
    }
  }

  analyzeRequest(requestData) {
    // Detect API endpoints
    if (this.isAPIRequest(requestData)) {
      const apiInfo = {
        endpoint: requestData.pathname,
        method: requestData.method,
        domain: requestData.domain,
        responseSchema: this.extractAPISchema(requestData.responseBody, requestData.contentType),
        authType: this.detectAuthType(requestData.requestHeaders),
        lastSeen: Date.now()
      };
      
      const apiKey = `${requestData.method} ${requestData.pathname}`;
      this.patterns.apis.set(apiKey, apiInfo);
    }
    
    // Detect GraphQL
    if (this.isGraphQLRequest(requestData)) {
      try {
        const query = this.extractGraphQLQuery(requestData.requestBody);
        if (query) {
          this.patterns.graphqlQueries.push({
            query,
            variables: this.extractGraphQLVariables(requestData.requestBody),
            timestamp: Date.now(),
            requestId: requestData.id
          });
        }
      } catch (error) {
        console.warn('Failed to parse GraphQL:', error);
      }
    }
    
    // Security analysis
    this.performSecurityAnalysis(requestData);
    
    // Privacy analysis
    this.performPrivacyAnalysis(requestData);
  }

  updateMetrics() {
    const requests = Array.from(this.requests.values());
    
    // Basic counts
    this.metrics.totalRequests = requests.length;
    this.metrics.uniqueEndpoints = this.requestsByEndpoint.size;
    this.metrics.uniqueDomains = this.requestsByDomain.size;
    
    // Calculate data transfer
    this.metrics.totalDataTransferred = requests.reduce((sum, r) => sum + (r.requestSize || 0), 0);
    this.metrics.totalDataReceived = requests.reduce((sum, r) => sum + (r.responseSize || 0), 0);
    
    // Response times
    const completedRequests = requests.filter(r => r.duration !== null);
    if (completedRequests.length > 0) {
      const totalTime = completedRequests.reduce((sum, r) => sum + r.duration, 0);
      this.metrics.averageResponseTime = Math.round(totalTime / completedRequests.length);
      
      const sortedByTime = completedRequests.sort((a, b) => a.duration - b.duration);
      this.metrics.fastestRequest = sortedByTime[0];
      this.metrics.slowestRequest = sortedByTime[sortedByTime.length - 1];
    }
    
    // Status code distribution
    this.metrics.statusCodes = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    requests.forEach(r => {
      if (r.status) {
        const range = Math.floor(r.status / 100) + 'xx';
        if (this.metrics.statusCodes[range] !== undefined) {
          this.metrics.statusCodes[range]++;
        }
      }
    });
    
    // Request types
    this.metrics.requestTypes = {
      xhr: 0, fetch: 0, document: 0, script: 0,
      stylesheet: 0, image: 0, font: 0, other: 0
    };
    
    requests.forEach(r => {
      if (r.type === 'xhr' || r.type === 'fetch') {
        this.metrics.requestTypes[r.type]++;
      } else {
        // Determine type from content-type or URL
        const type = this.categorizeRequestType(r);
        this.metrics.requestTypes[type]++;
      }
    });
    
    // Security metrics
    this.metrics.securityMetrics = {
      httpsRequests: requests.filter(r => r.isSecure).length,
      httpRequests: requests.filter(r => !r.isSecure).length,
      mixedContent: requests.filter(r => !r.isSecure && window.location.protocol === 'https:').length,
      corsRequests: requests.filter(r => r.securityIssues.includes('CORS')).length,
      thirdPartyRequests: requests.filter(r => r.isThirdParty).length
    };
    
    // Performance metrics
    this.metrics.performanceMetrics = {
      slowRequests: requests.filter(r => r.isSlowRequest).length,
      failedRequests: requests.filter(r => r.error).length,
      cachedRequests: requests.filter(r => r.cacheStatus === 'hit').length,
      redundantRequests: requests.filter(r => r.isRedundant).length
    };
  }

  // Helper methods
  generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  extractHeaders(headers) {
    const result = {};
    if (!headers) return result;
    
    if (headers instanceof Headers) {
      for (const [key, value] of headers.entries()) {
        result[key.toLowerCase()] = value;
      }
    } else if (typeof headers === 'object') {
      Object.entries(headers).forEach(([key, value]) => {
        result[key.toLowerCase()] = value;
      });
    }
    
    return result;
  }

  extractResponseHeaders(headers) {
    const result = {};
    if (headers instanceof Headers) {
      for (const [key, value] of headers.entries()) {
        result[key.toLowerCase()] = value;
      }
    }
    return result;
  }

  extractBody(body) {
    if (!body) return '';
    if (typeof body === 'string') return body.substring(0, 10000); // Truncate large bodies
    if (body instanceof FormData) {
      try {
        return '[FormData object]';
      } catch (e) {
        return '[FormData - unable to serialize]';
      }
    }
    if (body instanceof URLSearchParams) {
      return body.toString();
    }
    try {
      return JSON.stringify(body).substring(0, 10000);
    } catch (e) {
      return '[Unable to serialize body]';
    }
  }

  processResponseBody(body, contentType) {
    if (!body) return '';
    
    const maxLength = 50000; // Limit response body size
    const truncatedBody = body.length > maxLength ? body.substring(0, maxLength) + '...[truncated]' : body;
    
    // Try to parse and format JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        const parsed = JSON.parse(truncatedBody);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return truncatedBody;
      }
    }
    
    return truncatedBody;
  }

  calculateRequestSize(options) {
    let size = 0;
    
    // Headers size estimation
    if (options.headers) {
      const headerString = JSON.stringify(options.headers);
      size += headerString.length;
    }
    
    // Body size
    if (options.body) {
      if (typeof options.body === 'string') {
        size += options.body.length;
      } else {
        size += 1000; // Estimate for non-string bodies
      }
    }
    
    return size;
  }

  isThirdPartyRequest(hostname) {
    return hostname !== window.location.hostname;
  }

  detectInitiator() {
    // Try to detect what initiated this request
    const stack = new Error().stack;
    if (stack) {
      const lines = stack.split('\n');
      for (const line of lines) {
        if (line.includes('XMLHttpRequest') || line.includes('fetch')) {
          continue;
        }
        if (line.includes('.js:')) {
          const match = line.match(/([^\/]+\.js):(\d+)/);
          if (match) {
            return { type: 'script', file: match[1], line: match[2] };
          }
        }
      }
    }
    return { type: 'unknown' };
  }

  captureStackTrace() {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(0, 10).join('\n') : '';
  }

  analyzeCacheHeaders(requestData, headers) {
    const cacheHeaders = ['cache-control', 'etag', 'expires', 'last-modified'];
    requestData.hasCacheHeaders = cacheHeaders.some(header => headers[header]);
    
    // Determine cache status
    if (headers['cache-control']) {
      if (headers['cache-control'].includes('no-cache') || headers['cache-control'].includes('no-store')) {
        requestData.cacheStatus = 'no-cache';
      } else if (headers['cache-control'].includes('max-age')) {
        requestData.cacheStatus = 'cacheable';
      }
    }
    
    if (headers['cf-cache-status'] || headers['x-cache']) {
      requestData.cacheStatus = 'hit';
    }
  }

  analyzeSecurityHeaders(requestData, headers) {
    const securityHeaders = [
      'strict-transport-security',
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection'
    ];
    
    const missingHeaders = securityHeaders.filter(header => !headers[header]);
    if (missingHeaders.length > 0) {
      requestData.securityIssues.push(`Missing security headers: ${missingHeaders.join(', ')}`);
    }
    
    // Check for mixed content
    if (!requestData.isSecure && window.location.protocol === 'https:') {
      requestData.securityIssues.push('Mixed content (HTTP request from HTTPS page)');
    }
  }

  performSecurityAnalysis(requestData) {
    // Check for sensitive data in URLs
    const sensitivePatterns = [
      /api[_-]?key/i,
      /access[_-]?token/i,
      /secret/i,
      /password/i,
      /auth/i
    ];
    
    const fullUrl = requestData.url + requestData.search;
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(fullUrl)) {
        requestData.securityIssues.push('Potential sensitive data in URL');
      }
    });
    
    // Check request body for sensitive data
    if (requestData.requestBody) {
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(requestData.requestBody)) {
          requestData.privacyIssues.push('Potential sensitive data in request body');
        }
      });
    }
  }

  performPrivacyAnalysis(requestData) {
    // Detect tracking domains
    const trackingDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com',
      'doubleclick.net',
      'adsystem.com'
    ];
    
    if (trackingDomains.some(domain => requestData.domain.includes(domain))) {
      requestData.privacyIssues.push('Request to tracking domain');
    }
    
    // Check for personal data patterns
    const personalDataPatterns = [
      /email/i,
      /phone/i,
      /address/i,
      /ssn/i,
      /credit[_-]?card/i
    ];
    
    const searchableContent = (requestData.requestBody || '') + (requestData.responseBody || '');
    personalDataPatterns.forEach(pattern => {
      if (pattern.test(searchableContent)) {
        requestData.privacyIssues.push('Potential personal data detected');
      }
    });
  }

  isAPIRequest(requestData) {
    // Heuristics to detect API requests
    const apiIndicators = [
      requestData.pathname.includes('/api/'),
      requestData.pathname.includes('/v1/'),
      requestData.pathname.includes('/v2/'),
      requestData.contentType && requestData.contentType.includes('application/json'),
      requestData.method !== 'GET',
      requestData.responseHeaders['content-type'] && requestData.responseHeaders['content-type'].includes('application/json')
    ];
    
    return apiIndicators.some(indicator => indicator);
  }

  isGraphQLRequest(requestData) {
    return requestData.pathname.includes('/graphql') ||
           (requestData.requestBody && requestData.requestBody.includes('"query"'));
  }

  extractAPISchema(responseBody, contentType) {
    if (!contentType || !contentType.includes('application/json') || !responseBody) {
      return null;
    }
    
    try {
      const parsed = JSON.parse(responseBody);
      return this.generateSchema(parsed);
    } catch (e) {
      return null;
    }
  }

  generateSchema(obj, depth = 0) {
    if (depth > 3) return '...'; // Prevent infinite recursion
    
    if (obj === null) return 'null';
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return `[${this.generateSchema(obj[0], depth + 1)}]`;
    }
    if (typeof obj === 'object') {
      const schema = {};
      Object.keys(obj).slice(0, 10).forEach(key => { // Limit to first 10 keys
        schema[key] = this.generateSchema(obj[key], depth + 1);
      });
      if (Object.keys(obj).length > 10) {
        schema['...'] = `... ${Object.keys(obj).length - 10} more properties`;
      }
      return schema;
    }
    return typeof obj;
  }

  detectAuthType(headers) {
    if (headers.authorization) {
      if (headers.authorization.startsWith('Bearer ')) return 'Bearer Token';
      if (headers.authorization.startsWith('Basic ')) return 'Basic Auth';
      return 'Custom Authorization';
    }
    if (headers['x-api-key'] || headers['api-key']) return 'API Key';
    return 'None detected';
  }

  extractGraphQLQuery(requestBody) {
    try {
      const parsed = JSON.parse(requestBody);
      return parsed.query;
    } catch (e) {
      return null;
    }
  }

  extractGraphQLVariables(requestBody) {
    try {
      const parsed = JSON.parse(requestBody);
      return parsed.variables;
    } catch (e) {
      return null;
    }
  }

  categorizeRequestType(requestData) {
    const contentType = requestData.contentType || '';
    const url = requestData.url.toLowerCase();
    
    if (contentType.includes('image/')) return 'image';
    if (contentType.includes('javascript') || url.endsWith('.js')) return 'script';
    if (contentType.includes('css') || url.endsWith('.css')) return 'stylesheet';
    if (contentType.includes('font') || url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (contentType.includes('text/html')) return 'document';
    
    return 'other';
  }

  analyzeNavigationTiming(entry) {
    // Store navigation timing for overall page analysis
    this.navigationTiming = {
      domainLookupTime: entry.domainLookupEnd - entry.domainLookupStart,
      connectionTime: entry.connectEnd - entry.connectStart,
      tlsTime: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      requestTime: entry.responseStart - entry.requestStart,
      responseTime: entry.responseEnd - entry.responseStart,
      domProcessingTime: entry.domContentLoadedEventStart - entry.responseEnd,
      loadEventTime: entry.loadEventEnd - entry.loadEventStart
    };
  }

  analyzeResourceTiming(entry) {
    // Store detailed timing for correlation with requests
    const timingData = {
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      domainLookupTime: entry.domainLookupEnd - entry.domainLookupStart,
      connectionTime: entry.connectEnd - entry.connectStart,
      tlsTime: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      requestTime: entry.responseStart - entry.requestStart,
      responseTime: entry.responseEnd - entry.responseStart,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize
    };
    
    this.performanceEntries.set(entry.name, timingData);
  }

  correlateResourceTiming(entry) {
    // Try to match resource timing with our request data
    const matchingRequest = Array.from(this.requests.values()).find(req => 
      req.url === entry.name || req.url.endsWith(entry.name.split('/').pop())
    );
    
    if (matchingRequest) {
      matchingRequest.timingBreakdown = {
        dns: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
        connect: Math.round(entry.connectEnd - entry.connectStart),
        ssl: entry.secureConnectionStart > 0 ? Math.round(entry.connectEnd - entry.secureConnectionStart) : 0,
        send: Math.round(entry.responseStart - entry.requestStart),
        wait: Math.round(entry.responseStart - entry.requestStart),
        receive: Math.round(entry.responseEnd - entry.responseStart)
      };
      
      matchingRequest.transferSize = entry.transferSize;
      matchingRequest.encodedBodySize = entry.encodedBodySize;
      matchingRequest.decodedBodySize = entry.decodedBodySize;
    }
  }

  // Public API methods
  startMonitoring() {
    this.isMonitoring = true;
    console.log('🌐 Advanced Network Monitor - Started with pre-captured data');
    
    // Don't clear data - keep what was captured!
    // Process any pending requests that were captured by 00-immediate-start.js
    if (window.__drDOMPendingRequests && window.__drDOMPendingRequests.length > 0) {
      console.log(`📦 Processing ${window.__drDOMPendingRequests.length} requests captured from page load!`);
      
      window.__drDOMPendingRequests.forEach(request => {
        // Add each pre-captured request
        if (request.url && request.id) {
          this.requests.set(request.id, request);
          this.analyzeRequest(request);
          
          // Update metrics
          this.metrics.totalRequests++;
          if (request.status) {
            const statusCategory = this.categorizeStatus(request.status);
            this.metrics.statusCodes[statusCategory]++;
          }
        }
      });
      
      console.log(`✅ Processed all pre-captured requests - continuing live monitoring`);
    }
    this.patterns.errorPatterns.clear();
    
    this.updateMetrics();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('🌐 Advanced Network Monitor - Stopped analysis');
  }

  getComprehensiveReport() {
    return {
      summary: {
        totalRequests: this.metrics.totalRequests,
        uniqueEndpoints: this.metrics.uniqueEndpoints,
        uniqueDomains: this.metrics.uniqueDomains,
        averageResponseTime: this.metrics.averageResponseTime,
        dataTransferred: this.metrics.totalDataTransferred + this.metrics.totalDataReceived,
        errorRate: this.metrics.performanceMetrics.failedRequests / this.metrics.totalRequests * 100
      },
      metrics: this.metrics,
      requests: Array.from(this.requests.values()),
      topEndpoints: this.getTopEndpoints(),
      topDomains: this.getTopDomains(),
      slowestRequests: this.getSlowestRequests(),
      failedRequests: this.getFailedRequests(),
      apis: Array.from(this.patterns.apis.values()),
      graphqlQueries: this.patterns.graphqlQueries,
      securityIssues: this.getSecurityIssues(),
      privacyIssues: this.getPrivacyIssues(),
      performanceInsights: this.getPerformanceInsights(),
      redundantRequests: this.getRedundantRequests()
    };
  }

  getTopEndpoints(limit = 10) {
    return Array.from(this.requestsByEndpoint.entries())
      .map(([endpoint, requestIds]) => ({
        endpoint,
        count: requestIds.length,
        requests: requestIds.map(id => this.requests.get(id)).filter(Boolean)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopDomains(limit = 10) {
    return Array.from(this.requestsByDomain.entries())
      .map(([domain, requestIds]) => ({
        domain,
        count: requestIds.length,
        isThirdParty: domain !== window.location.hostname,
        requests: requestIds.map(id => this.requests.get(id)).filter(Boolean)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getSlowestRequests(limit = 10) {
    return Array.from(this.requests.values())
      .filter(req => req.duration !== null)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getFailedRequests() {
    return Array.from(this.requests.values()).filter(req => req.error || req.status >= 400);
  }

  getSecurityIssues() {
    const issues = [];
    this.requests.forEach(req => {
      req.securityIssues.forEach(issue => {
        issues.push({ requestId: req.id, url: req.url, issue });
      });
    });
    return issues;
  }

  getPrivacyIssues() {
    const issues = [];
    this.requests.forEach(req => {
      req.privacyIssues.forEach(issue => {
        issues.push({ requestId: req.id, url: req.url, issue });
      });
    });
    return issues;
  }

  getPerformanceInsights() {
    const insights = [];
    
    // Slow requests
    const slowRequests = this.getSlowestRequests(5);
    if (slowRequests.length > 0) {
      insights.push({
        type: 'performance',
        severity: 'warning',
        title: 'Slow Requests Detected',
        description: `${slowRequests.length} requests are taking longer than 2 seconds`,
        details: slowRequests.map(r => `${r.method} ${r.url} (${r.duration}ms)`)
      });
    }
    
    // Too many requests to same endpoint
    const redundantEndpoints = this.getTopEndpoints(5).filter(ep => ep.count > 5);
    if (redundantEndpoints.length > 0) {
      insights.push({
        type: 'optimization',
        severity: 'info',
        title: 'Potential Request Optimization',
        description: 'Some endpoints are being called multiple times',
        details: redundantEndpoints.map(ep => `${ep.endpoint}: ${ep.count} calls`)
      });
    }
    
    // Mixed content
    if (this.metrics.securityMetrics.mixedContent > 0) {
      insights.push({
        type: 'security',
        severity: 'error',
        title: 'Mixed Content Detected',
        description: `${this.metrics.securityMetrics.mixedContent} HTTP requests from HTTPS page`,
        details: ['This can cause security warnings and blocked requests']
      });
    }
    
    return insights;
  }

  getRedundantRequests() {
    return Array.from(this.patterns.repeatedUrls.entries())
      .filter(([url, count]) => count > 1)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// Initialize and expose globally
window.drDOMAdvancedNetworkMonitor = new DrDOMAdvancedNetworkMonitor();
console.log('🌐 Dr. DOM Advanced Network Monitor ready - comprehensive HTTP analysis enabled!');