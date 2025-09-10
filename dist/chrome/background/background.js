/**
 * Dr. DOM Background Service Worker
 * Handles extension-level monitoring and coordination
 */

class DrDOMBackground {
  constructor() {
    this.activeMonitoring = new Set();
    this.networkRequests = new Map();
    this.debugSessions = new Map();
    
    this.init();
  }

  init() {
    this.setupNetworkInterception();
    this.setupDebuggerEvents();
    this.setupMessageHandling();
    this.setupContextMenus();
    this.setupTabMonitoring();
    
    console.log('🔧 Dr. DOM Background Service initialized');
  }
  
  setupTabMonitoring() {
    // Automatically monitor all tabs
    chrome.tabs.onCreated.addListener((tab) => {
      console.log('New tab created, starting monitoring:', tab.id);
      this.activeMonitoring.add(tab.id);
    });
    
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading') {
        console.log('Tab navigating, ensuring monitoring active:', tabId);
        this.activeMonitoring.add(tabId);
      }
    });
    
    chrome.tabs.onRemoved.addListener((tabId) => {
      console.log('Tab closed, cleaning up:', tabId);
      this.activeMonitoring.delete(tabId);
      // Clean up stored data for this tab
      const keysToDelete = [];
      this.networkRequests.forEach((value, key) => {
        if (value.tabId === tabId) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.networkRequests.delete(key));
    });
    
    // Monitor existing tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        console.log('Monitoring existing tab:', tab.id);
        this.activeMonitoring.add(tab.id);
      });
    });
  }

  setupNetworkInterception() {
    // Listen to all network requests at browser level
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        if (this.activeMonitoring.has(details.tabId)) {
          this.logNetworkRequest('request', details);
        }
      },
      { urls: ['<all_urls>'] },
      ['requestBody']
    );

    chrome.webRequest.onBeforeSendHeaders.addListener(
      (details) => {
        if (this.activeMonitoring.has(details.tabId)) {
          this.logNetworkRequest('headers', details);
        }
      },
      { urls: ['<all_urls>'] },
      ['requestHeaders']
    );

    chrome.webRequest.onHeadersReceived.addListener(
      (details) => {
        if (this.activeMonitoring.has(details.tabId)) {
          this.logNetworkRequest('response', details);
        }
      },
      { urls: ['<all_urls>'] },
      ['responseHeaders']
    );

    chrome.webRequest.onCompleted.addListener(
      (details) => {
        if (this.activeMonitoring.has(details.tabId)) {
          this.logNetworkRequest('completed', details);
          this.analyzeRequest(details);
        }
      },
      { urls: ['<all_urls>'] }
    );

    chrome.webRequest.onErrorOccurred.addListener(
      (details) => {
        if (this.activeMonitoring.has(details.tabId)) {
          this.logNetworkRequest('error', details);
          this.handleNetworkError(details);
        }
      },
      { urls: ['<all_urls>'] }
    );
  }

  setupDebuggerEvents() {
    chrome.debugger.onEvent.addListener((source, method, params) => {
      const tabId = source.tabId;
      
      if (!this.activeMonitoring.has(tabId)) return;

      switch (method) {
        case 'Network.responseReceived':
          this.handleNetworkResponse(tabId, params);
          break;
        case 'Runtime.consoleAPICalled':
          this.handleConsoleMessage(tabId, params);
          break;
        case 'Runtime.exceptionThrown':
          this.handleJavaScriptError(tabId, params);
          break;
        case 'Performance.metrics':
          this.handlePerformanceMetrics(tabId, params);
          break;
      }
    });

    chrome.debugger.onDetach.addListener((source, reason) => {
      console.log(\`Debugger detached from tab \${source.tabId}: \${reason}\`);
      this.activeMonitoring.delete(source.tabId);
    });
  }

  setupMessageHandling() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('[Background] Message received:', request.action || request.type, request);
      
      // Handle both action and type fields for compatibility
      const messageType = request.action || request.type;
      
      switch (messageType) {
        case 'getSecurityHeaders':
          // Get security headers for SSL analyzer
          this.getSecurityHeaders(request.url)
            .then(headers => sendResponse({ headers }))
            .catch(error => sendResponse({ error: error.message }));
          return true; // Keep message channel open for async response
          
        case 'checkURLhaus':
          // Check URL with URLhaus API (no CORS in background)
          this.checkURLhaus(request.url)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Keep message channel open for async response
          
        case 'checkPhishTank':
          // PhishTank check (free but needs simple registration)
          // For now, using local detection
          this.checkPhishingLocal(request.url)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;
          
        case 'checkToSDR':
          // ToS;DR API (completely free, no key needed)
          this.checkToSDR(request.domain)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;
          
        case 'checkCryptoScam':
          // CryptoScamDB (free, open source)
          this.checkCryptoScam(request.domain)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;
          
        case 'checkMozillaObservatory':
          // Mozilla Observatory (FREE, no key needed)
          this.checkMozillaObservatory(request.domain)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;
          
        case 'checkOpenPhish':
          // OpenPhish (FREE, no key needed)
          this.checkOpenPhish(request.url)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;
          
        case 'saveCapturedData':
          // Save data from content script to chrome.storage by domain
          if (request.data && sender.tab) {
            const domain = request.data.hostname || new URL(sender.tab.url).hostname;
            const storageKey = `drDOM_${domain}`;
            
            // Also save current tab mapping
            chrome.storage.local.set({ 
              [storageKey]: request.data,
              'drDOM_currentTab': { tabId: sender.tab.id, domain: domain }
            }, () => {
              console.log(`Saved data for ${domain}: ${request.data.requests.length} requests`);
            });
          }
          sendResponse({ success: true });
          break;
        case 'startBackgroundMonitoring':
          this.startMonitoring(request.tabId);
          sendResponse({ success: true });
          break;

        case 'stopBackgroundMonitoring':
          this.stopMonitoring(request.tabId);
          sendResponse({ success: true });
          break;

        case 'getNetworkData':
          sendResponse(this.getNetworkData(request.tabId));
          break;

        case 'exportData':
          this.exportData(request.tabId, request.format)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Keep message channel open for async response

        case 'generateReport':
          this.generateReport(request.tabId)
            .then(report => sendResponse({ success: true, report }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;

        case 'CLEAN_COOKIES':
          this.cleanCookies(request.domain, request.trackingPatterns, request.essentialPatterns)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;

        case 'CLEAN_SPECIFIC_COOKIES':
          // Use the tab from the request if provided (from popup), otherwise use sender.tab (from content script)
          const tabToClean = request.tab || sender.tab;
          if (!tabToClean) {
            sendResponse({ success: false, error: 'No tab information provided' });
            return true;
          }
          this.cleanSpecificCookies(tabToClean, request.cleanType)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;

        case 'URLHAUS_UPDATE':
          this.downloadURLhausDatabase(request.url)
            .then(data => sendResponse({ success: true, data: data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;

        default:
          console.log('[Background] Unknown message type:', messageType);
          sendResponse({ error: 'Unknown action: ' + messageType });
      }
    });
  }
  
  async downloadURLhausDatabase(url) {
    try {
      console.log('[URLhaus] Downloading database from:', url);
      
      // Download the database
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log(`[URLhaus] Downloaded ${text.length} bytes`);
      
      return text;
    } catch (error) {
      console.error('[URLhaus] Failed to download database:', error);
      throw error;
    }
  }

  async cleanCookies(domain, trackingPatterns, essentialPatterns) {
    let cleaned = 0;
    
    try {
      // Get all cookies for the domain
      const cookies = await chrome.cookies.getAll({ domain: domain });
      
      // Convert string patterns back to RegExp
      const trackingRegexes = trackingPatterns.map(p => new RegExp(p.slice(1, -2), p.slice(-1)));
      const essentialRegexes = essentialPatterns.map(p => new RegExp(p.slice(1, -2), p.slice(-1)));
      
      for (const cookie of cookies) {
        // Check if cookie is essential (whitelist)
        const isEssential = essentialRegexes.some(pattern => pattern.test(cookie.name));
        if (isEssential) continue;
        
        // Check if cookie is tracking (blacklist)
        const isTracking = trackingRegexes.some(pattern => pattern.test(cookie.name));
        
        if (isTracking) {
          // Remove the cookie
          const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
          await chrome.cookies.remove({
            url: url,
            name: cookie.name
          });
          cleaned++;
          console.log(`[Cookie Cleaner] Removed tracking cookie: ${cookie.name}`);
        }
      }
      
      return { success: true, cleaned: cleaned };
    } catch (error) {
      console.error('[Cookie Cleaner] Error cleaning cookies:', error);
      return { success: false, error: error.message, cleaned: 0 };
    }
  }

  async cleanSpecificCookies(tab, cleanType) {
    console.log('[Cookie Cleaner] Starting cleanup:', { cleanType, url: tab.url });
    
    const results = {
      cleaned: 0,
      type: cleanType,
      details: []
    };
    
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      console.log('[Cookie Cleaner] Domain:', domain);
      
      switch(cleanType) {
        case 'ALL_COOKIES':
          // Get ALL cookies and filter for this domain
          const allCookies = await chrome.cookies.getAll({});
          console.log('[Cookie Cleaner] Total cookies found:', allCookies.length);
          
          for (const cookie of allCookies) {
            // Normalize domain for comparison
            const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
            
            // Check if cookie belongs to this domain (exact match or subdomain)
            const belongsToThisDomain = (
              domain === cookieDomain ||
              domain.endsWith('.' + cookieDomain) ||
              cookieDomain.endsWith('.' + domain) ||
              cookie.domain === '.' + domain
            );
            
            if (belongsToThisDomain) {
              console.log('[Cookie Cleaner] Found matching cookie:', cookie.name, 'from', cookie.domain);
              // Build URL for cookie removal - must match the cookie's domain exactly
              const protocol = cookie.secure ? 'https' : 'http';
              // Use the actual domain from the cookie (with or without the leading dot)
              const cookieUrl = `${protocol}://${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;
              
              console.log(`[Cookie Cleaner] Attempting to remove ${cookie.name} with URL: ${cookieUrl}`);
              
              try {
                await chrome.cookies.remove({
                  url: cookieUrl,
                  name: cookie.name,
                  storeId: cookie.storeId || "0"
                });
                results.cleaned++;
                results.details.push(cookie.name);
                console.log(`[Cookie Cleaner] ✅ Successfully removed: ${cookie.name}`);
              } catch (err) {
                console.error(`[Cookie Cleaner] ❌ Failed to remove ${cookie.name}:`, err);
                // Try without storeId
                try {
                  await chrome.cookies.remove({
                    url: cookieUrl,
                    name: cookie.name
                  });
                  results.cleaned++;
                  results.details.push(cookie.name);
                  console.log(`[Cookie Cleaner] ✅ Removed (no storeId): ${cookie.name}`);
                } catch (err2) {
                  console.error(`[Cookie Cleaner] ❌ Still failed:`, err2);
                }
              }
            }
          }
          break;
          
        case 'TRACKING_COOKIES':
          // Remove only known tracking cookies
          const trackingPatterns = [
            /_ga$|^_ga_|^_gid$|^_gat|^__utm|^_gcl|^_gac_/i,
            /^fbm_|^fbsr_|^fbs_|^act$|^c_user|^datr/i,
            /^_clck|^_clsk|^MUID|^MC1|^MS0/i,
            /^_fbp$|^_fbc$|^fr$|^tr$/i,
            /^IDE$|^NID$|^ANID$|^1P_JAR/i,
            /^_pinterest_|^_pin_unauth/i,
            /^mp_|^mixpanel|^amplitude|^segment/i
          ];
          
          const cookies = await chrome.cookies.getAll({});
          for (const cookie of cookies) {
            // Check if cookie belongs to this domain
            if (cookie.domain.includes(domain) || 
                cookie.domain === `.${domain}` || 
                cookie.domain === domain ||
                domain.includes(cookie.domain.replace('.', ''))) {
              
              const isTracking = trackingPatterns.some(pattern => pattern.test(cookie.name));
              if (isTracking) {
                const cookieUrl = `http${cookie.secure ? 's' : ''}://${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;
                
                try {
                  await chrome.cookies.remove({
                    url: cookieUrl,
                    name: cookie.name
                  });
                  results.cleaned++;
                  results.details.push(cookie.name);
                  console.log(`[Cookie Cleaner] Removed tracking cookie: ${cookie.name}`);
                } catch (err) {
                  console.error(`[Cookie Cleaner] Failed to remove ${cookie.name}:`, err);
                }
              }
            }
          }
          break;
          
        case 'THIRD_PARTY':
          // Remove third-party cookies
          const thirdPartyCookies = await chrome.cookies.getAll({});
          for (const cookie of thirdPartyCookies) {
            if (!cookie.domain.includes(domain) && cookie.domain !== `.${domain}`) {
              const cookieUrl = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
              await chrome.cookies.remove({
                url: cookieUrl,
                name: cookie.name
              });
              results.cleaned++;
              results.details.push(`${cookie.name} (${cookie.domain})`);
            }
          }
          break;
          
        case 'LOCAL_STORAGE':
          // Clear localStorage via content script
          await chrome.tabs.sendMessage(tab.id, {
            type: 'CLEAR_LOCAL_STORAGE'
          });
          results.cleaned = 'cleared';
          break;
          
        case 'SESSION_STORAGE':
          // Clear sessionStorage via content script
          await chrome.tabs.sendMessage(tab.id, {
            type: 'CLEAR_SESSION_STORAGE'
          });
          results.cleaned = 'cleared';
          break;
      }
      
      return { success: true, results: results };
    } catch (error) {
      console.error('[Cookie Cleaner] Error in cleanSpecificCookies:', error);
      return { success: false, error: error.message, results: results };
    }
  }

  setupContextMenus() {
    chrome.contextMenus.create({
      id: 'dr-dom-inspect',
      title: '🔍 Inspect with Dr. DOM',
      contexts: ['page', 'selection', 'link', 'image']
    });

    chrome.contextMenus.create({
      id: 'dr-dom-export',
      title: '📄 Export Page Analysis',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'dr-dom-performance',
      title: '⚡ Analyze Performance',
      contexts: ['page']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      switch (info.menuItemId) {
        case 'dr-dom-inspect':
          this.inspectElement(tab.id, info);
          break;
        case 'dr-dom-export':
          this.quickExport(tab.id);
          break;
        case 'dr-dom-performance':
          this.analyzePerformance(tab.id);
          break;
      }
    });
  }

  async startMonitoring(tabId) {
    try {
      this.activeMonitoring.add(tabId);
      
      // Attach debugger for advanced monitoring
      await chrome.debugger.attach({ tabId }, '1.3');
      
      // Enable necessary domains
      await Promise.all([
        chrome.debugger.sendCommand({ tabId }, 'Network.enable'),
        chrome.debugger.sendCommand({ tabId }, 'Runtime.enable'),
        chrome.debugger.sendCommand({ tabId }, 'Performance.enable')
      ]);

      console.log(\`🔍 Started monitoring tab \${tabId}\`);
      
      // Notify content script
      chrome.tabs.sendMessage(tabId, {
        action: 'backgroundMonitoringStarted'
      });
      
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      this.activeMonitoring.delete(tabId);
      throw error;
    }
  }

  async stopMonitoring(tabId) {
    try {
      this.activeMonitoring.delete(tabId);
      
      // Detach debugger
      await chrome.debugger.detach({ tabId });
      
      console.log(\`⏹️ Stopped monitoring tab \${tabId}\`);
      
      // Notify content script
      chrome.tabs.sendMessage(tabId, {
        action: 'backgroundMonitoringStopped'
      });
      
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  }

  logNetworkRequest(phase, details) {
    const key = \`\${details.tabId}-\${details.requestId}\`;
    
    if (!this.networkRequests.has(key)) {
      this.networkRequests.set(key, {
        tabId: details.tabId,
        requestId: details.requestId,
        url: details.url,
        method: details.method,
        type: details.type,
        timestamp: details.timeStamp,
        phases: {}
      });
    }
    
    const request = this.networkRequests.get(key);
    request.phases[phase] = {
      timestamp: details.timeStamp,
      details: this.sanitizeDetails(details)
    };
  }

  sanitizeDetails(details) {
    // Remove sensitive information and large data
    const sanitized = {
      url: details.url,
      method: details.method,
      statusCode: details.statusCode,
      statusLine: details.statusLine,
      type: details.type,
      timeStamp: details.timeStamp
    };
    
    if (details.requestHeaders) {
      sanitized.requestHeaders = details.requestHeaders;
    }
    
    if (details.responseHeaders) {
      sanitized.responseHeaders = details.responseHeaders;
    }
    
    if (details.error) {
      sanitized.error = details.error;
    }
    
    return sanitized;
  }

  analyzeRequest(details) {
    // Analyze the request for insights
    const insights = [];
    
    if (details.statusCode >= 400) {
      insights.push({
        type: 'error',
        message: \`Request failed with status \${details.statusCode}\`,
        suggestion: 'Check server response and network connectivity'
      });
    }
    
    if (details.type === 'image' && details.statusCode === 200) {
      insights.push({
        type: 'optimization',
        message: 'Image loaded successfully',
        suggestion: 'Consider using WebP format or lazy loading for better performance'
      });
    }
    
    if (details.url.includes('api') && details.statusCode === 200) {
      insights.push({
        type: 'success',
        message: 'API request completed successfully',
        suggestion: 'Monitor response time for user experience'
      });
    }
    
    // Send insights to content script
    chrome.tabs.sendMessage(details.tabId, {
      action: 'networkInsight',
      requestId: details.requestId,
      insights: insights
    });
  }

  handleNetworkError(details) {
    console.error(\`Network error for \${details.url}: \${details.error}\`);
    
    // Send error notification to content script
    chrome.tabs.sendMessage(details.tabId, {
      action: 'networkError',
      error: {
        url: details.url,
        error: details.error,
        type: details.type,
        timestamp: details.timeStamp
      }
    });
  }

  handleNetworkResponse(tabId, params) {
    // Process network response from debugger
    const response = params.response;
    
    // Send detailed response data to content script
    chrome.tabs.sendMessage(tabId, {
      action: 'networkResponse',
      response: {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        mimeType: response.mimeType,
        timing: response.timing
      }
    });
  }

  handleConsoleMessage(tabId, params) {
    // Forward console messages with enhanced context
    chrome.tabs.sendMessage(tabId, {
      action: 'consoleMessage',
      message: {
        type: params.type,
        args: params.args,
        timestamp: params.timestamp,
        stackTrace: params.stackTrace
      }
    });
  }

  handleJavaScriptError(tabId, params) {
    // Process JavaScript errors
    const error = params.exceptionDetails;
    
    chrome.tabs.sendMessage(tabId, {
      action: 'javascriptError',
      error: {
        message: error.text,
        source: error.url,
        line: error.lineNumber,
        column: error.columnNumber,
        stackTrace: error.stackTrace,
        timestamp: Date.now()
      }
    });
  }

  handlePerformanceMetrics(tabId, params) {
    // Process performance metrics
    chrome.tabs.sendMessage(tabId, {
      action: 'performanceMetrics',
      metrics: params.metrics
    });
  }

  getNetworkData(tabId) {
    const tabRequests = Array.from(this.networkRequests.values())
      .filter(request => request.tabId === tabId);
    
    return {
      requests: tabRequests,
      summary: this.generateNetworkSummary(tabRequests)
    };
  }

  generateNetworkSummary(requests) {
    const total = requests.length;
    const errors = requests.filter(req => 
      req.phases.completed?.details?.statusCode >= 400).length;
    
    const byType = {};
    requests.forEach(req => {
      const type = req.type || 'other';
      byType[type] = (byType[type] || 0) + 1;
    });
    
    return {
      totalRequests: total,
      errorRate: total > 0 ? (errors / total * 100).toFixed(1) + '%' : '0%',
      requestsByType: byType,
      insights: this.generateNetworkInsights(requests)
    };
  }

  generateNetworkInsights(requests) {
    const insights = [];
    
    const imageRequests = requests.filter(req => req.type === 'image');
    if (imageRequests.length > 10) {
      insights.push('📷 Many image requests detected - consider image optimization');
    }
    
    const slowRequests = requests.filter(req => {
      const completed = req.phases.completed;
      const started = req.phases.request;
      if (completed && started) {
        return completed.timestamp - started.timestamp > 2000;
      }
      return false;
    });
    
    if (slowRequests.length > 0) {
      insights.push(\`🐌 \${slowRequests.length} slow requests (>2s) detected\`);
    }
    
    return insights;
  }

  async exportData(tabId, format = 'json') {
    const networkData = this.getNetworkData(tabId);
    const tab = await chrome.tabs.get(tabId);
    
    const exportData = {
      metadata: {
        url: tab.url,
        title: tab.title,
        timestamp: new Date().toISOString(),
        userAgent: 'Dr. DOM Extension'
      },
      network: networkData,
      analysis: await this.generateAnalysis(tabId)
    };
    
    switch (format.toLowerCase()) {
      case 'csv':
        return this.convertToCSV(exportData);
      case 'html':
        return this.convertToHTML(exportData);
      default:
        return JSON.stringify(exportData, null, 2);
    }
  }

  async generateAnalysis(tabId) {
    // Generate human-friendly analysis
    const networkData = this.getNetworkData(tabId);
    const requests = networkData.requests;
    
    const analysis = {
      summary: \`Analyzed \${requests.length} network requests\`,
      performance: this.analyzePerformance(requests),
      security: this.analyzeSecurityHeaders(requests),
      optimization: this.suggestOptimizations(requests),
      accessibility: this.checkAccessibility(requests)
    };
    
    return analysis;
  }

  analyzePerformance(requests) {
    const completed = requests.filter(req => req.phases.completed);
    const totalTime = completed.reduce((sum, req) => {
      const start = req.phases.request?.timestamp || 0;
      const end = req.phases.completed?.timestamp || 0;
      return sum + (end - start);
    }, 0);
    
    const avgTime = completed.length > 0 ? totalTime / completed.length : 0;
    
    return {
      averageResponseTime: Math.round(avgTime) + 'ms',
      slowRequests: completed.filter(req => {
        const duration = (req.phases.completed?.timestamp || 0) - (req.phases.request?.timestamp || 0);
        return duration > 2000;
      }).length,
      recommendation: avgTime > 1000 ? 
        'Consider optimizing server response times or using caching' : 
        'Response times look good!'
    };
  }

  analyzeSecurityHeaders(requests) {
    // Analyze security headers in responses
    const securityIssues = [];
    
    requests.forEach(req => {
      const headers = req.phases.response?.details?.responseHeaders || [];
      const headerMap = {};
      headers.forEach(h => headerMap[h.name.toLowerCase()] = h.value);
      
      if (!headerMap['x-frame-options'] && !headerMap['content-security-policy']) {
        securityIssues.push('Missing clickjacking protection');
      }
      
      if (!headerMap['x-content-type-options']) {
        securityIssues.push('Missing MIME type sniffing protection');
      }
      
      if (!headerMap['strict-transport-security'] && req.url.startsWith('https')) {
        securityIssues.push('Missing HTTPS enforcement header');
      }
    });
    
    return {
      issues: [...new Set(securityIssues)],
      recommendation: securityIssues.length > 0 ? 
        'Consider adding security headers to improve protection' : 
        'Security headers look good!'
    };
  }

  suggestOptimizations(requests) {
    const suggestions = [];
    
    const imageRequests = requests.filter(req => req.type === 'image');
    if (imageRequests.length > 15) {
      suggestions.push('Consider lazy loading images or using image sprites');
    }
    
    const jsRequests = requests.filter(req => req.type === 'script');
    if (jsRequests.length > 10) {
      suggestions.push('Consider bundling JavaScript files to reduce requests');
    }
    
    const cssRequests = requests.filter(req => req.type === 'stylesheet');
    if (cssRequests.length > 5) {
      suggestions.push('Consider combining CSS files');
    }
    
    return suggestions.length > 0 ? suggestions : ['Website is well optimized!'];
  }

  checkAccessibility(requests) {
    // Basic accessibility checks based on requests
    const findings = [];
    
    const hasImages = requests.some(req => req.type === 'image');
    if (hasImages) {
      findings.push('Reminder: Ensure all images have alt text for screen readers');
    }
    
    const hasFonts = requests.some(req => req.url.includes('font') || req.type === 'font');
    if (hasFonts) {
      findings.push('Custom fonts detected - ensure fallback fonts for accessibility');
    }
    
    return findings.length > 0 ? findings : ['No obvious accessibility issues detected'];
  }

  convertToCSV(data) {
    // Convert network data to CSV format
    const headers = ['URL', 'Method', 'Type', 'Status', 'Timestamp'];
    let csv = headers.join(',') + '\\n';
    
    data.network.requests.forEach(req => {
      const status = req.phases.completed?.details?.statusCode || 'Unknown';
      const row = [
        this.escapeCSV(req.url),
        req.method || 'GET',
        req.type || 'unknown',
        status,
        new Date(req.timestamp).toISOString()
      ];
      csv += row.join(',') + '\\n';
    });
    
    return csv;
  }

  convertToHTML(data) {
    return \`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dr. DOM Analysis Report</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #f8fafc; 
        }
        .header { 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white; 
            padding: 30px; 
            border-radius: 12px; 
            text-align: center; 
            margin-bottom: 30px; 
        }
        .section { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .metric { 
            display: inline-block; 
            margin: 10px 20px 10px 0; 
            text-align: center; 
        }
        .metric-value { 
            font-size: 2rem; 
            font-weight: bold; 
            color: #667eea; 
        }
        .metric-label { 
            font-size: 0.875rem; 
            color: #64748b; 
            text-transform: uppercase; 
            letter-spacing: 0.05em; 
        }
        .insight { 
            background: #f0f9ff; 
            border-left: 4px solid #0ea5e9; 
            padding: 15px; 
            margin: 10px 0; 
        }
        .warning { 
            background: #fefce8; 
            border-left-color: #eab308; 
        }
        .success { 
            background: #f0fdf4; 
            border-left-color: #22c55e; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e2e8f0; 
        }
        th { 
            background: #f1f5f9; 
            font-weight: 600; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Dr. DOM Analysis Report</h1>
        <p><strong>Website:</strong> \${data.metadata.url}</p>
        <p><strong>Generated:</strong> \${new Date(data.metadata.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h2>📊 Summary</h2>
        <div class="metric">
            <div class="metric-value">\${data.network.summary.totalRequests}</div>
            <div class="metric-label">Total Requests</div>
        </div>
        <div class="metric">
            <div class="metric-value">\${data.network.summary.errorRate}</div>
            <div class="metric-label">Error Rate</div>
        </div>
    </div>
    
    <div class="section">
        <h2>💡 Key Insights</h2>
        \${data.analysis.performance.recommendation ? 
          \`<div class="insight">🚀 <strong>Performance:</strong> \${data.analysis.performance.recommendation}</div>\` : ''
        }
        \${data.analysis.security.recommendation ? 
          \`<div class="insight">🔒 <strong>Security:</strong> \${data.analysis.security.recommendation}</div>\` : ''
        }
        \${data.analysis.optimization.map(opt => 
          \`<div class="insight">⚡ <strong>Optimization:</strong> \${opt}</div>\`
        ).join('')}
    </div>
    
    <div class="section">
        <h2>🌐 Network Requests</h2>
        <table>
            <thead>
                <tr>
                    <th>URL</th>
                    <th>Method</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                \${data.network.requests.slice(0, 50).map(req => {
                  const status = req.phases.completed?.details?.statusCode || 'Unknown';
                  const timestamp = new Date(req.timestamp).toLocaleTimeString();
                  return \`
                    <tr>
                        <td title="\${req.url}">\${req.url.substring(0, 60)}\${req.url.length > 60 ? '...' : ''}</td>
                        <td>\${req.method || 'GET'}</td>
                        <td>\${req.type || 'unknown'}</td>
                        <td>\${status}</td>
                        <td>\${timestamp}</td>
                    </tr>
                  \`;
                }).join('')}
            </tbody>
        </table>
        \${data.network.requests.length > 50 ? 
          \`<p><em>Showing first 50 requests. Full data available in JSON export.</em></p>\` : ''
        }
    </div>
    
    <footer style="text-align: center; margin-top: 40px; color: #64748b;">
        <p>Generated by Dr. DOM Browser Extension</p>
    </footer>
</body>
</html>
    \`;
  }

  escapeCSV(str) {
    if (typeof str !== 'string') return str;
    return '"' + str.replace(/"/g, '""') + '"';
  }

  async getSecurityHeaders(url) {
    // Get security headers from the last response for this URL
    const tabId = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
    if (!tabId) return {};
    
    // Find matching request
    const matchingRequests = Array.from(this.networkRequests.values())
      .filter(req => req.url === url && req.tabId === tabId);
    
    if (matchingRequests.length === 0) return {};
    
    const lastRequest = matchingRequests[matchingRequests.length - 1];
    const responseHeaders = lastRequest.phases.response?.details?.responseHeaders || [];
    
    // Convert headers array to object
    const headers = {};
    responseHeaders.forEach(h => {
      headers[h.name] = h.value;
    });
    
    return headers;
  }

  async checkURLhaus(url) {
    // Check URL with URLhaus API for malware (FREE, no key needed)
    try {
      const formData = new URLSearchParams();
      formData.append('url', url);
      
      const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });
      
      if (!response.ok) {
        console.warn('[URLhaus] API response not OK:', response.status);
        return null;
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.warn('[URLhaus] API error:', error);
      return null;
    }
  }

  async checkPhishingLocal(url) {
    // Local phishing detection using patterns (no API needed)
    const phishingPatterns = [
      // Common phishing patterns
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
      /bit\.ly|tinyurl|short\.link|goo\.gl/, // URL shorteners
      /-{2,}/, // Multiple hyphens
      /[a-z]+(paypal|amazon|google|microsoft|apple|bank)[a-z]+\./, // Typosquatting
      /secure.*update.*[a-z]+\.com/, // Fake security updates
      /[0-9]{2,}\..*\.(tk|ml|ga|cf)/, // Suspicious TLDs
    ];
    
    const suspiciousWords = [
      'verify', 'suspended', 'locked', 'expired', 'refund', 'urgent',
      'confirm', 'update', 'validate', 'secure', 'alert', 'warning'
    ];
    
    let score = 0;
    const urlLower = url.toLowerCase();
    
    // Check patterns
    for (const pattern of phishingPatterns) {
      if (pattern.test(urlLower)) score += 2;
    }
    
    // Check suspicious words
    for (const word of suspiciousWords) {
      if (urlLower.includes(word)) score += 1;
    }
    
    return {
      in_database: score > 3,
      verified: score > 5,
      phish_score: score,
      detection_method: 'local_patterns'
    };
  }

  async checkToSDR(domain) {
    // Terms of Service; Didn't Read API (COMPLETELY FREE)
    try {
      // Clean the domain
      const cleanDomain = domain.replace('www.', '').split('.')[0];
      
      const response = await fetch(`https://tosdr.org/api/1/service/${cleanDomain}.json`);
      
      if (!response.ok) {
        // Service not in database
        return null;
      }
      
      const data = await response.json();
      
      // Parse the response
      return {
        class: data.class || 'N/A', // A, B, C, D, E
        points: data.points || {},
        badges: data.badges || [],
        urls: data.urls || []
      };
      
    } catch (error) {
      console.warn('[ToS;DR] API error:', error);
      return null;
    }
  }

  async checkCryptoScam(domain) {
    // CryptoScamDB (FREE, open source)
    try {
      // Use their GitHub raw data (always up to date)
      const response = await fetch('https://raw.githubusercontent.com/CryptoScamDB/blacklist/master/data/urls.yaml');
      
      if (!response.ok) {
        return null;
      }
      
      const text = await response.text();
      
      // Simple check if domain is in the list
      const isScam = text.toLowerCase().includes(domain.toLowerCase());
      
      return {
        result: isScam ? 'blocked' : 'clean',
        type: isScam ? 'scam' : null,
        source: 'CryptoScamDB'
      };
      
    } catch (error) {
      // Fallback to local crypto scam patterns
      const cryptoScamPatterns = [
        'elon.*musk.*giveaway',
        'bitcoin.*doubler',
        'crypto.*investment.*guaranteed',
        'free.*ethereum',
        'airdrop.*claim'
      ];
      
      const isScam = cryptoScamPatterns.some(pattern => 
        new RegExp(pattern, 'i').test(domain)
      );
      
      return {
        result: isScam ? 'blocked' : 'clean',
        type: isScam ? 'scam_pattern' : null,
        source: 'local_patterns'
      };
    }
  }

  async checkMozillaObservatory(domain) {
    // Mozilla Observatory - FREE security analysis
    try {
      const response = await fetch(
        `https://http-observatory.security.mozilla.org/api/v1/analyze?host=${domain}`,
        { method: 'POST' }
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      // Get the detailed test results
      const testsResponse = await fetch(
        `https://http-observatory.security.mozilla.org/api/v1/getScanResults?scan=${data.scan_id}`
      );
      
      const tests = await testsResponse.json();
      
      return {
        grade: data.grade,
        score: data.score,
        tests: tests,
        likelihood_indicator: data.likelihood_indicator
      };
      
    } catch (error) {
      console.warn('[Mozilla Observatory] Check failed:', error);
      return null;
    }
  }

  async checkOpenPhish(url) {
    // OpenPhish - FREE phishing detection
    try {
      // Fetch the feed (updated every 12 hours)
      const response = await fetch('https://openphish.com/feed.txt');
      
      if (!response.ok) return null;
      
      const text = await response.text();
      const phishingUrls = text.split('\n').filter(Boolean);
      
      // Check if URL is in the list
      const isPhishing = phishingUrls.some(phishUrl => 
        url.includes(phishUrl) || phishUrl.includes(url)
      );
      
      return {
        isPhishing: isPhishing,
        source: 'OpenPhish',
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.warn('[OpenPhish] Check failed:', error);
      return null;
    }
  }

  async inspectElement(tabId, info) {
    // Quick inspect specific element
    chrome.tabs.sendMessage(tabId, {
      action: 'quickInspect',
      element: {
        pageUrl: info.pageUrl,
        linkUrl: info.linkUrl,
        srcUrl: info.srcUrl,
        selectionText: info.selectionText
      }
    });
  }

  async quickExport(tabId) {
    try {
      const htmlReport = await this.exportData(tabId, 'html');
      const blob = new Blob([htmlReport], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      chrome.downloads.download({
        url: url,
        filename: \`dr-dom-report-\${Date.now()}.html\`,
        saveAs: true
      });
    } catch (error) {
      console.error('Quick export failed:', error);
    }
  }

  async analyzePerformanceQuick(tabId) {
    chrome.tabs.sendMessage(tabId, {
      action: 'startPerformanceAnalysis'
    });
  }
}

// Initialize the background service
const drDOMBackground = new DrDOMBackground();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🎉 Dr. DOM Extension installed successfully!');
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }
});

console.log('🚀 Dr. DOM Background Service ready!');