/**
 * Dr. DOM Network Monitor
 * Intercepts and analyzes network requests with fun visual feedback
 * Makes network analysis accessible for everyone! 🚀
 */

class DrDOMNetworkMonitor {
  constructor() {
    this.isMonitoring = false;
    this.requests = [];
    this.webSocketConnections = [];
    this.originalFetch = null;
    this.originalXHR = null;
    
    // Performance metrics
    this.metrics = {
      totalRequests: 0,
      failedRequests: 0,
      slowRequests: 0,
      dataTransferred: 0,
      averageResponseTime: 0
    };
    
    // Filter settings
    this.filters = {
      showImages: true,
      showScripts: true,
      showStylesheets: true,
      showXHR: true,
      showFetch: true,
      showWebSockets: true,
      showErrors: true,
      minDuration: 0
    };
    
    this.init();
  }

  init() {
    this.setupRequestInterception();
    this.setupWebSocketMonitoring();
    console.log('🌐 Network Monitor initialized - watching all requests!');
  }

  setupRequestInterception() {
    // Intercept Fetch API
    this.originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      const options = args[1] || {};
      
      const requestData = {
        id: this.generateId(),
        type: 'fetch',
        url: typeof url === 'string' ? url : url.url,
        method: options.method || 'GET',
        headers: this.extractHeaders(options.headers),
        body: this.extractBody(options.body),
        startTime,
        status: null,
        statusText: null,
        responseHeaders: {},
        responseBody: null,
        duration: null,
        size: 0,
        timestamp: Date.now()
      };

      if (this.isMonitoring) {
        this.addRequest(requestData);
      }

      try {
        const response = await this.originalFetch.apply(this, args);
        const endTime = performance.now();
        
        // Update request data with response info
        requestData.status = response.status;
        requestData.statusText = response.statusText;
        requestData.responseHeaders = this.extractResponseHeaders(response.headers);
        requestData.duration = Math.round(endTime - startTime);
        
        // Clone response to read body without consuming it
        const responseClone = response.clone();
        try {
          const text = await responseClone.text();
          requestData.responseBody = this.truncateBody(text);
          requestData.size = text.length;
        } catch (e) {
          requestData.responseBody = '[Unable to read response body]';
        }

        if (this.isMonitoring) {
          this.updateRequest(requestData);
          this.updateMetrics(requestData);
          this.showRequestNotification(requestData);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        requestData.status = 0;
        requestData.statusText = error.message;
        requestData.duration = Math.round(endTime - startTime);
        requestData.error = error.message;

        if (this.isMonitoring) {
          this.updateRequest(requestData);
          this.updateMetrics(requestData);
          this.showErrorNotification(requestData);
        }

        throw error;
      }
    };

    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      this._drDomRequestData = {
        id: this.generateId ? this.generateId() : Math.random().toString(36).substr(2, 9),
        type: 'xhr',
        method,
        url,
        async: async !== false,
        startTime: null,
        status: null,
        statusText: null,
        responseHeaders: {},
        responseBody: null,
        duration: null,
        size: 0,
        timestamp: Date.now()
      };

      return originalXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
      if (!this._drDomRequestData) return originalXHRSend.apply(this, arguments);

      const requestData = this._drDomRequestData;
      requestData.startTime = performance.now();
      requestData.body = body;

      if (window.drDOMNetworkMonitor?.isMonitoring) {
        window.drDOMNetworkMonitor.addRequest(requestData);
      }

      this.addEventListener('load', () => {
        const endTime = performance.now();
        requestData.status = this.status;
        requestData.statusText = this.statusText;
        requestData.responseHeaders = this.getAllResponseHeaders();
        requestData.responseBody = this.responseText || this.response;
        requestData.duration = Math.round(endTime - requestData.startTime);
        requestData.size = (requestData.responseBody || '').length;

        if (window.drDOMNetworkMonitor?.isMonitoring) {
          window.drDOMNetworkMonitor.updateRequest(requestData);
          window.drDOMNetworkMonitor.updateMetrics(requestData);
          window.drDOMNetworkMonitor.showRequestNotification(requestData);
        }
      });

      this.addEventListener('error', () => {
        const endTime = performance.now();
        requestData.status = this.status || 0;
        requestData.statusText = this.statusText || 'Network Error';
        requestData.duration = Math.round(endTime - requestData.startTime);
        requestData.error = 'Network request failed';

        if (window.drDOMNetworkMonitor?.isMonitoring) {
          window.drDOMNetworkMonitor.updateRequest(requestData);
          window.drDOMNetworkMonitor.updateMetrics(requestData);
          window.drDOMNetworkMonitor.showErrorNotification(requestData);
        }
      });

      return originalXHRSend.apply(this, arguments);
    };

    // Store reference for restoration
    this.originalXHR = { open: originalXHROpen, send: originalXHRSend };
  }

  setupWebSocketMonitoring() {
    const originalWebSocket = window.WebSocket;
    
    window.WebSocket = function(...args) {
      const ws = new originalWebSocket(...args);
      const wsData = {
        id: Math.random().toString(36).substr(2, 9),
        url: args[0],
        protocols: args[1],
        readyState: ws.readyState,
        messages: [],
        createdAt: Date.now(),
        connectedAt: null,
        disconnectedAt: null
      };

      if (window.drDOMNetworkMonitor?.isMonitoring) {
        window.drDOMNetworkMonitor.addWebSocket(wsData);
      }

      ws.addEventListener('open', (e) => {
        wsData.connectedAt = Date.now();
        wsData.readyState = ws.readyState;
        
        if (window.drDOMNetworkMonitor?.isMonitoring) {
          window.drDOMNetworkMonitor.updateWebSocket(wsData);
          window.drDOMNetworkMonitor.showWebSocketNotification(wsData, 'Connected');
        }
      });

      ws.addEventListener('message', (e) => {
        const message = {
          type: 'received',
          data: e.data,
          timestamp: Date.now()
        };
        wsData.messages.push(message);
        
        if (window.drDOMNetworkMonitor?.isMonitoring) {
          window.drDOMNetworkMonitor.updateWebSocket(wsData);
          window.drDOMNetworkMonitor.showWebSocketMessage(wsData, message);
        }
      });

      ws.addEventListener('close', (e) => {
        wsData.disconnectedAt = Date.now();
        wsData.readyState = ws.readyState;
        wsData.closeCode = e.code;
        wsData.closeReason = e.reason;
        
        if (window.drDOMNetworkMonitor?.isMonitoring) {
          window.drDOMNetworkMonitor.updateWebSocket(wsData);
          window.drDOMNetworkMonitor.showWebSocketNotification(wsData, 'Disconnected');
        }
      });

      ws.addEventListener('error', (e) => {
        wsData.error = e.error || 'WebSocket error';
        
        if (window.drDOMNetworkMonitor?.isMonitoring) {
          window.drDOMNetworkMonitor.updateWebSocket(wsData);
          window.drDOMNetworkMonitor.showWebSocketError(wsData);
        }
      });

      // Intercept send method
      const originalSend = ws.send;
      ws.send = function(data) {
        const message = {
          type: 'sent',
          data: data,
          timestamp: Date.now()
        };
        wsData.messages.push(message);
        
        if (window.drDOMNetworkMonitor?.isMonitoring) {
          window.drDOMNetworkMonitor.updateWebSocket(wsData);
          window.drDOMNetworkMonitor.showWebSocketMessage(wsData, message);
        }

        return originalSend.apply(this, arguments);
      };

      return ws;
    };
  }

  startMonitoring() {
    this.isMonitoring = true;
    this.requests = [];
    this.webSocketConnections = [];
    this.resetMetrics();
    console.log('🔍 Network monitoring started!');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ Network monitoring stopped');
  }

  addRequest(requestData) {
    this.requests.push(requestData);
    this.metrics.totalRequests++;
    
    // Send to Dr. DOM Inspector if available
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity('🌐', 'Network request started', 
        \`\${requestData.method} \${this.getSimpleUrl(requestData.url)}\`);
    }
  }

  updateRequest(requestData) {
    const index = this.requests.findIndex(req => req.id === requestData.id);
    if (index !== -1) {
      this.requests[index] = requestData;
    }
  }

  addWebSocket(wsData) {
    this.webSocketConnections.push(wsData);
  }

  updateWebSocket(wsData) {
    const index = this.webSocketConnections.findIndex(ws => ws.id === wsData.id);
    if (index !== -1) {
      this.webSocketConnections[index] = wsData;
    }
  }

  updateMetrics(requestData) {
    if (requestData.status >= 400) {
      this.metrics.failedRequests++;
    }
    
    if (requestData.duration > 1000) {
      this.metrics.slowRequests++;
    }
    
    this.metrics.dataTransferred += requestData.size || 0;
    
    // Calculate average response time
    const completedRequests = this.requests.filter(req => req.duration !== null);
    if (completedRequests.length > 0) {
      const totalTime = completedRequests.reduce((sum, req) => sum + req.duration, 0);
      this.metrics.averageResponseTime = Math.round(totalTime / completedRequests.length);
    }
  }

  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      failedRequests: 0,
      slowRequests: 0,
      dataTransferred: 0,
      averageResponseTime: 0
    };
  }

  showRequestNotification(requestData) {
    const status = requestData.status;
    let icon = '🌐';
    let className = 'success';
    
    if (status >= 400) {
      icon = '❌';
      className = 'error';
    } else if (status >= 300) {
      icon = '↗️';
      className = 'redirect';
    } else if (requestData.duration > 2000) {
      icon = '🐌';
      className = 'slow';
    } else if (requestData.duration < 100) {
      icon = '⚡';
      className = 'fast';
    }

    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity(icon, 
        \`Request completed (\${status})\`, 
        \`\${requestData.method} \${this.getSimpleUrl(requestData.url)} - \${requestData.duration}ms\`);
    }

    this.createFloatingNotification(requestData, icon, className);
  }

  showErrorNotification(requestData) {
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity('💥', 'Request failed', 
        \`\${requestData.method} \${this.getSimpleUrl(requestData.url)} - \${requestData.error}\`);
    }
  }

  showWebSocketNotification(wsData, action) {
    const icon = action === 'Connected' ? '🔌' : '🔌💔';
    
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity(icon, \`WebSocket \${action.toLowerCase()}\`, 
        this.getSimpleUrl(wsData.url));
    }
  }

  showWebSocketMessage(wsData, message) {
    const icon = message.type === 'sent' ? '📤' : '📥';
    
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity(icon, \`WebSocket \${message.type}\`, 
        \`\${this.truncateString(message.data, 50)}\`);
    }
  }

  showWebSocketError(wsData) {
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity('🚫', 'WebSocket error', 
        \`\${this.getSimpleUrl(wsData.url)} - \${wsData.error}\`);
    }
  }

  createFloatingNotification(requestData, icon, className) {
    const notification = document.createElement('div');
    notification.className = \`dr-dom-network-notification \${className}\`;
    notification.innerHTML = \`
      <div class="notification-icon">\${icon}</div>
      <div class="notification-text">
        <div class="notification-method">\${requestData.method}</div>
        <div class="notification-url">\${this.getSimpleUrl(requestData.url)}</div>
        <div class="notification-time">\${requestData.duration}ms</div>
      </div>
    \`;
    
    // Position randomly on screen
    notification.style.cssText = \`
      position: fixed;
      top: \${Math.random() * (window.innerHeight - 100)}px;
      left: \${Math.random() * (window.innerWidth - 300)}px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
      transform: scale(0);
      animation: dr-dom-notification 3s ease-out forwards;
      pointer-events: none;
      backdrop-filter: blur(10px);
    \`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // Utility methods
  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  extractHeaders(headers) {
    if (!headers) return {};
    
    if (headers instanceof Headers) {
      const result = {};
      headers.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }
    
    return headers;
  }

  extractBody(body) {
    if (!body) return null;
    
    if (typeof body === 'string') {
      return this.truncateBody(body);
    }
    
    if (body instanceof FormData) {
      return '[FormData]';
    }
    
    if (body instanceof URLSearchParams) {
      return body.toString();
    }
    
    if (body instanceof Blob) {
      return \`[Blob: \${body.size} bytes, type: \${body.type}]\`;
    }
    
    try {
      return JSON.stringify(body);
    } catch (e) {
      return '[Unserializable body]';
    }
  }

  extractResponseHeaders(headers) {
    const result = {};
    if (headers && headers.forEach) {
      headers.forEach((value, key) => {
        result[key] = value;
      });
    }
    return result;
  }

  truncateBody(body, maxLength = 1000) {
    if (!body || typeof body !== 'string') return body;
    
    if (body.length <= maxLength) return body;
    
    return body.substring(0, maxLength) + '... [truncated]';
  }

  truncateString(str, maxLength) {
    if (!str || typeof str !== 'string') return str;
    
    if (str.length <= maxLength) return str;
    
    return str.substring(0, maxLength) + '...';
  }

  getSimpleUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + (urlObj.search ? '?' + urlObj.search.substring(1, 20) + '...' : '');
    } catch (e) {
      return url.substring(0, 50) + (url.length > 50 ? '...' : '');
    }
  }

  // Search functionality for laypeople
  searchRequests(query) {
    if (!query.trim()) return this.requests;
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return this.requests.filter(request => {
      const searchableText = [
        request.url,
        request.method,
        request.statusText,
        JSON.stringify(request.responseBody || ''),
        this.getRequestCategory(request),
        this.getRequestDescription(request)
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // Human-friendly request categorization
  getRequestCategory(request) {
    const url = request.url.toLowerCase();
    
    if (url.includes('api') || url.includes('graphql') || request.method !== 'GET') {
      return 'API Data';
    }
    
    if (url.match(/\\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      return 'Images';
    }
    
    if (url.match(/\\.(css|scss|less)$/)) {
      return 'Stylesheets';
    }
    
    if (url.match(/\\.(js|ts|jsx|tsx)$/)) {
      return 'Scripts';
    }
    
    if (url.match(/\\.(woff|woff2|ttf|eot)$/)) {
      return 'Fonts';
    }
    
    if (url.match(/\\.(mp4|webm|avi|mov)$/)) {
      return 'Videos';
    }
    
    if (url.match(/\\.(mp3|wav|ogg)$/)) {
      return 'Audio';
    }
    
    return 'Documents';
  }

  getRequestDescription(request) {
    const category = this.getRequestCategory(request);
    const status = request.status;
    const duration = request.duration;
    
    let description = \`\${category} request\`;
    
    if (status >= 400) {
      description += \` that failed (\${status})\`;
    } else if (status >= 300) {
      description += \` that was redirected\`;
    } else {
      description += \` that succeeded\`;
    }
    
    if (duration > 2000) {
      description += \` and took a long time (\${duration}ms)\`;
    } else if (duration < 100) {
      description += \` and was very fast (\${duration}ms)\`;
    }
    
    return description;
  }

  // Export functionality for reports
  exportRequests(format = 'json') {
    const exportData = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metrics: this.metrics,
      requests: this.requests.map(req => ({
        ...req,
        category: this.getRequestCategory(req),
        description: this.getRequestDescription(req),
        humanReadableSize: this.formatBytes(req.size || 0),
        humanReadableTime: this.formatDuration(req.duration)
      })),
      webSockets: this.webSocketConnections,
      summary: this.generateSummary()
    };

    if (format === 'csv') {
      return this.exportAsCSV(exportData);
    } else if (format === 'html') {
      return this.exportAsHTML(exportData);
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  generateSummary() {
    const total = this.metrics.totalRequests;
    const failed = this.metrics.failedRequests;
    const slow = this.metrics.slowRequests;
    const avgTime = this.metrics.averageResponseTime;
    const dataSize = this.formatBytes(this.metrics.dataTransferred);
    
    return {
      totalRequests: total,
      successRate: total > 0 ? Math.round(((total - failed) / total) * 100) + '%' : '0%',
      averageResponseTime: avgTime + 'ms',
      slowRequestsPercentage: total > 0 ? Math.round((slow / total) * 100) + '%' : '0%',
      totalDataTransferred: dataSize,
      categories: this.getCategorySummary(),
      insights: this.generateInsights()
    };
  }

  getCategorySummary() {
    const categories = {};
    
    this.requests.forEach(req => {
      const category = this.getRequestCategory(req);
      if (!categories[category]) {
        categories[category] = { count: 0, totalSize: 0, avgTime: 0 };
      }
      categories[category].count++;
      categories[category].totalSize += req.size || 0;
    });
    
    // Calculate averages
    Object.values(categories).forEach(cat => {
      if (cat.count > 0) {
        cat.avgTime = Math.round(cat.avgTime / cat.count);
        cat.totalSize = this.formatBytes(cat.totalSize);
      }
    });
    
    return categories;
  }

  generateInsights() {
    const insights = [];
    const total = this.metrics.totalRequests;
    
    if (this.metrics.failedRequests > 0) {
      const failureRate = Math.round((this.metrics.failedRequests / total) * 100);
      insights.push(\`⚠️ \${failureRate}% of requests failed - this might impact user experience\`);
    }
    
    if (this.metrics.slowRequests > total * 0.2) {
      insights.push('🐌 Many requests are slow (>1s) - consider optimizing or caching');
    }
    
    if (this.metrics.dataTransferred > 5 * 1024 * 1024) { // 5MB
      insights.push('📦 Large amount of data transferred - consider compression or optimization');
    }
    
    const imageRequests = this.requests.filter(req => this.getRequestCategory(req) === 'Images');
    if (imageRequests.length > 20) {
      insights.push('🖼️ Many image requests detected - consider image sprites or lazy loading');
    }
    
    if (insights.length === 0) {
      insights.push('✅ Network performance looks good!');
    }
    
    return insights;
  }

  exportAsCSV(data) {
    const headers = [
      'URL', 'Method', 'Status', 'Duration (ms)', 'Size (bytes)', 
      'Category', 'Type', 'Start Time', 'Description'
    ];
    
    let csv = headers.join(',') + '\\n';
    
    data.requests.forEach(req => {
      const row = [
        this.csvEscape(req.url),
        req.method,
        req.status,
        req.duration || 0,
        req.size || 0,
        this.csvEscape(req.category),
        req.type,
        new Date(req.timestamp).toISOString(),
        this.csvEscape(req.description)
      ];
      csv += row.join(',') + '\\n';
    });
    
    return csv;
  }

  csvEscape(str) {
    if (typeof str !== 'string') return str;
    return '"' + str.replace(/"/g, '""') + '"';
  }

  exportAsHTML(data) {
    return \`
<!DOCTYPE html>
<html>
<head>
    <title>Dr. DOM Network Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #0066cc; }
        .metric-label { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
        .status-success { color: green; }
        .status-error { color: red; }
        .status-redirect { color: orange; }
        .insights { background: #fffbeb; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; }
    </style>
</head>
<body>
    <h1>🔍 Dr. DOM Network Analysis Report</h1>
    <p><strong>Website:</strong> \${data.url}</p>
    <p><strong>Generated:</strong> \${new Date(data.timestamp).toLocaleString()}</p>
    
    <div class="summary">
        <h2>📊 Summary</h2>
        <div class="metric">
            <div class="metric-value">\${data.summary.totalRequests}</div>
            <div class="metric-label">Total Requests</div>
        </div>
        <div class="metric">
            <div class="metric-value">\${data.summary.successRate}</div>
            <div class="metric-label">Success Rate</div>
        </div>
        <div class="metric">
            <div class="metric-value">\${data.summary.averageResponseTime}</div>
            <div class="metric-label">Avg Response Time</div>
        </div>
        <div class="metric">
            <div class="metric-value">\${data.summary.totalDataTransferred}</div>
            <div class="metric-label">Data Transferred</div>
        </div>
    </div>
    
    <div class="insights">
        <h3>💡 Insights</h3>
        \${data.summary.insights.map(insight => \`<p>\${insight}</p>\`).join('')}
    </div>
    
    <h2>📋 Detailed Requests</h2>
    <table>
        <thead>
            <tr>
                <th>URL</th>
                <th>Method</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Size</th>
                <th>Category</th>
                <th>Time</th>
            </tr>
        </thead>
        <tbody>
            \${data.requests.map(req => \`
                <tr>
                    <td title="\${req.url}">\${req.url.substring(0, 50)}\${req.url.length > 50 ? '...' : ''}</td>
                    <td>\${req.method}</td>
                    <td class="status-\${req.status >= 400 ? 'error' : req.status >= 300 ? 'redirect' : 'success'}">\${req.status}</td>
                    <td>\${req.humanReadableTime}</td>
                    <td>\${req.humanReadableSize}</td>
                    <td>\${req.category}</td>
                    <td>\${new Date(req.timestamp).toLocaleTimeString()}</td>
                </tr>
            \`).join('')}
        </tbody>
    </table>
</body>
</html>
    \`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDuration(ms) {
    if (!ms) return '0ms';
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(1) + 's';
  }

  // API methods
  getMetrics() {
    return this.metrics;
  }

  getRequests(filters = {}) {
    let filteredRequests = this.requests;
    
    if (filters.category) {
      filteredRequests = filteredRequests.filter(req => 
        this.getRequestCategory(req) === filters.category);
    }
    
    if (filters.status) {
      filteredRequests = filteredRequests.filter(req => 
        Math.floor(req.status / 100) === Math.floor(filters.status / 100));
    }
    
    if (filters.minDuration) {
      filteredRequests = filteredRequests.filter(req => 
        req.duration >= filters.minDuration);
    }
    
    return filteredRequests;
  }

  clearData() {
    this.requests = [];
    this.webSocketConnections = [];
    this.resetMetrics();
  }
}

// Initialize and expose globally
window.drDOMNetworkMonitor = new DrDOMNetworkMonitor();

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = \`
  @keyframes dr-dom-notification {
    0% { transform: scale(0); opacity: 0; }
    20% { transform: scale(1.1); opacity: 1; }
    80% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0.8); opacity: 0; }
  }
  
  .dr-dom-network-notification {
    transition: all 0.3s ease !important;
  }
  
  .dr-dom-network-notification.error {
    background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  }
  
  .dr-dom-network-notification.slow {
    background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  }
  
  .dr-dom-network-notification.fast {
    background: linear-gradient(135deg, #10b981, #059669) !important;
  }
  
  .notification-method {
    font-weight: bold;
    font-size: 10px;
  }
  
  .notification-url {
    font-size: 11px;
    opacity: 0.9;
  }
  
  .notification-time {
    font-size: 9px;
    opacity: 0.7;
  }
\`;

document.head.appendChild(notificationStyles);

console.log('🌐 Dr. DOM Network Monitor ready - making network analysis fun and accessible!');