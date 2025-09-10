/**
 * Dr. DOM Advanced Popup - Fixed to read from chrome.storage
 */

class DrDOMAdvancedPopup {
  constructor() {
    this.currentTab = null;
    this.activeTab = 'overview';
    this.data = {
      requests: [],
      errors: [],
      console: [],
      metrics: {}
    };
    
    console.log('🚀 Dr. DOM Advanced Popup Initializing...');
    this.init();
  }

  async init() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      if (!tab || tab.url.startsWith('chrome://')) {
        this.showEmptyState('Navigate to a website to start monitoring');
        return;
      }
      
      console.log('📍 Current tab:', tab.url);
      
      // Set up UI
      this.setupEventListeners();
      this.setupTabNavigation();
      
      // Start fetching data
      this.fetchData();
      
      // Continuous updates every 500ms
      setInterval(() => this.fetchData(), 500);
      
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  }

  async fetchData() {
    if (!this.currentTab || this.currentTab.url.startsWith('chrome://')) return;
    
    try {
      const domain = new URL(this.currentTab.url).hostname;
      const storageKey = `drDOM_${domain}`;
      
      chrome.storage.local.get([storageKey, `${storageKey}_meta`], (result) => {
        const data = result[storageKey];
        const meta = result[`${storageKey}_meta`];
        
        console.log(`📊 Data for ${domain}:`, data ? `${data.requests?.length || 0} requests` : 'No data');
        
        if (data) {
          this.data = data;
          this.updateUI(data);
          this.updateStats(data);
          this.updateRequestsTable(data.requests || []);
          this.updateActivityStream(data);
          this.updatePerformanceMetrics(data);
          this.updateSecurityAnalysis(data);
          this.updateAPIAnalysis(data);
        } else {
          this.showEmptyState('No data captured yet. Refresh the page to start monitoring.');
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  updateUI(data) {
    // Update header status
    const statusIndicator = document.getElementById('statusIndicator');
    if (statusIndicator) {
      const isLive = data.isLive && (Date.now() - data.lastUpdate < 3000);
      statusIndicator.innerHTML = isLive ? 
        '<div class="status-dot active"></div><span>🔴 Live Monitoring</span>' :
        '<div class="status-dot"></div><span>⚫ Idle</span>';
    }
  }

  updateStats(data) {
    // Update main stats
    const requests = data.requests || [];
    const errors = data.errors || [];
    const trackingPixels = data.trackingPixels || [];
    
    this.updateElement('requestCount', requests.length);
    this.updateElement('errorCount', errors.length);
    this.updateElement('trackingCount', trackingPixels.length);
    
    // Calculate performance score
    const avgTime = this.calculateAverageResponseTime(requests);
    const perfScore = avgTime < 500 ? 100 : avgTime < 1000 ? 80 : avgTime < 2000 ? 60 : 40;
    this.updateElement('performanceScore', perfScore);
    
    // Calculate safety score
    const safetyScore = this.calculateSafetyScore(data);
    this.updateElement('safetyScore', safetyScore);
    
    // Calculate average response time
    this.updateElement('avgResponseTime', avgTime > 0 ? `${Math.round(avgTime)}ms` : '--');
    
    // Update request type distribution
    this.updateRequestDistribution(requests);
    
    // Update status codes
    this.updateStatusCodes(requests);
    
    // Update top domains
    this.updateTopDomains(requests);
    
    // Update data transfer
    this.updateDataTransfer(requests);
  }

  updateRequestDistribution(requests) {
    const types = { xhr: 0, fetch: 0, script: 0, image: 0, other: 0 };
    
    requests.forEach(req => {
      if (req.type === 'xhr') types.xhr++;
      else if (req.type === 'fetch') types.fetch++;
      else if (req.type === 'script' || req.subType === 'script') types.script++;
      else if (req.type === 'image' || req.subType === 'image' || req.subType === 'img') types.image++;
      else if (req.type === 'resource') {
        // Check subType for resource types
        if (req.subType === 'xmlhttprequest') types.xhr++;
        else if (req.subType === 'fetch') types.fetch++;
        else types.other++;
      }
      else types.other++;
    });
    
    const total = requests.length || 1;
    
    console.log('Request types:', types, 'Total:', requests.length);
    
    // Update counts - use direct selectors
    const xhrElement = document.querySelector('.xhr-count');
    const fetchElement = document.querySelector('.fetch-count');
    const scriptElement = document.querySelector('.script-count');
    const imageElement = document.querySelector('.image-count');
    
    if (xhrElement) xhrElement.textContent = types.xhr;
    if (fetchElement) fetchElement.textContent = types.fetch;
    if (scriptElement) scriptElement.textContent = types.script;
    if (imageElement) imageElement.textContent = types.image;
    
    // Update bars
    this.updateBar('.request-type-fill.xhr', (types.xhr / total) * 100);
    this.updateBar('.request-type-fill.fetch', (types.fetch / total) * 100);
    this.updateBar('.request-type-fill.script', (types.script / total) * 100);
    this.updateBar('.request-type-fill.image', (types.image / total) * 100);
  }

  updateStatusCodes(requests) {
    const statuses = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    
    requests.forEach(req => {
      if (req.status >= 200 && req.status < 300) statuses['2xx']++;
      else if (req.status >= 300 && req.status < 400) statuses['3xx']++;
      else if (req.status >= 400 && req.status < 500) statuses['4xx']++;
      else if (req.status >= 500) statuses['5xx']++;
    });
    
    this.updateElement('status-2xx', statuses['2xx'], '.status-2xx');
    this.updateElement('status-3xx', statuses['3xx'], '.status-3xx');
    this.updateElement('status-4xx', statuses['4xx'], '.status-4xx');
    this.updateElement('status-5xx', statuses['5xx'], '.status-5xx');
  }

  updateTopDomains(requests) {
    const domains = {};
    
    requests.forEach(req => {
      try {
        const url = new URL(req.url);
        const domain = url.hostname;
        domains[domain] = (domains[domain] || 0) + 1;
      } catch (e) {
        // Invalid URL
      }
    });
    
    const sortedDomains = Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const container = document.getElementById('topDomains');
    if (container) {
      if (sortedDomains.length > 0) {
        container.innerHTML = sortedDomains.map(([domain, count]) => `
          <div class="domain-item">
            <span class="domain-name">${domain}</span>
            <span class="domain-count">${count} requests</span>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<div class="domain-placeholder">No requests yet</div>';
      }
    }
  }

  updateDataTransfer(requests) {
    let sent = 0;
    let received = 0;
    
    requests.forEach(req => {
      if (req.size) received += req.size;
      if (req.requestSize) sent += req.requestSize;
    });
    
    this.updateElement('dataSent', this.formatBytes(sent));
    this.updateElement('dataReceived', this.formatBytes(received));
  }

  updateActivityStream(data) {
    const container = document.getElementById('activityStream');
    if (!container) return;
    
    const recentRequests = (data.requests || [])
      .slice(-10)
      .reverse();
    
    if (recentRequests.length > 0) {
      container.innerHTML = recentRequests.map(req => {
        const time = new Date(req.timestamp).toLocaleTimeString();
        const status = req.completed ? '✅' : req.failed ? '❌' : '⏳';
        
        return `
          <div class="activity-item">
            <span class="activity-time">${time}</span>
            <span class="activity-status">${status}</span>
            <span class="activity-method">${req.method || req.type}</span>
            <span class="activity-url">${this.truncateUrl(req.url, 50)}</span>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = '<div class="activity-placeholder">Start analysis to see live activity...</div>';
    }
  }

  filterRequests() {
    const searchTerm = document.getElementById('requestSearch')?.value.toLowerCase() || '';
    const filterType = document.getElementById('requestFilter')?.value || 'all';
    
    let filtered = [...(this.data.requests || [])];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.url?.toLowerCase().includes(searchTerm) ||
        req.method?.toLowerCase().includes(searchTerm) ||
        req.type?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply type filter
    switch (filterType) {
      case 'xhr':
        filtered = filtered.filter(r => r.type === 'xhr');
        break;
      case 'fetch':
        filtered = filtered.filter(r => r.type === 'fetch');
        break;
      case 'failed':
        filtered = filtered.filter(r => r.failed || r.status >= 400);
        break;
      case 'slow':
        filtered = filtered.filter(r => r.duration > 2000);
        break;
      case '3rd-party':
        const currentDomain = this.currentTab ? new URL(this.currentTab.url).hostname : '';
        filtered = filtered.filter(r => {
          try {
            return !new URL(r.url).hostname.includes(currentDomain);
          } catch {
            return false;
          }
        });
        break;
    }
    
    this.updateRequestsTable(filtered);
  }
  
  updateRequestsTable(requests) {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    
    const summary = document.getElementById('requestsSummary');
    if (summary) {
      summary.textContent = `Showing ${requests.length} requests`;
    }
    
    if (requests.length > 0) {
      tbody.innerHTML = requests.map(req => `
        <tr>
          <td><span class="method-badge ${req.method?.toLowerCase()}">${req.method || req.type || 'GET'}</span></td>
          <td class="url-cell" title="${req.url}">${this.truncateUrl(req.url, 40)}</td>
          <td><span class="status-badge status-${this.getStatusClass(req.status)}">${req.status || '--'}</span></td>
          <td>${req.duration ? Math.round(req.duration) + 'ms' : '--'}</td>
          <td>${req.size ? this.formatBytes(req.size) : '--'}</td>
          <td>${req.type || '--'}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr class="no-requests"><td colspan="6">No requests captured yet</td></tr>';
    }
  }

  updatePerformanceMetrics(data) {
    const requests = data.requests || [];
    
    // Average response time
    const avgTime = this.calculateAverageResponseTime(requests);
    this.updateElement('avgResponseTimeDetailed', avgTime > 0 ? `${Math.round(avgTime)}ms` : '--');
    
    // Fastest and slowest
    const timings = requests.filter(r => r.duration).map(r => r.duration);
    if (timings.length > 0) {
      this.updateElement('fastestRequest', `${Math.round(Math.min(...timings))}ms`);
      this.updateElement('slowestRequest', `${Math.round(Math.max(...timings))}ms`);
    }
    
    // Total data transfer
    const totalBytes = requests.reduce((sum, r) => sum + (r.size || 0), 0);
    this.updateElement('totalDataTransfer', this.formatBytes(totalBytes));
    
    // Slow requests list
    const slowRequests = requests.filter(r => r.duration > 2000);
    const slowList = document.getElementById('slowRequestsList');
    if (slowList) {
      if (slowRequests.length > 0) {
        slowList.innerHTML = slowRequests.slice(0, 5).map(req => `
          <div class="slow-request-item">
            <span class="slow-time">${Math.round(req.duration)}ms</span>
            <span class="slow-url">${this.truncateUrl(req.url, 50)}</span>
          </div>
        `).join('');
      } else {
        slowList.innerHTML = '<div class="slow-requests-placeholder">No slow requests detected</div>';
      }
    }
    
    // Performance insights
    this.generatePerformanceInsights(data);
  }

  updateSecurityAnalysis(data) {
    const requests = data.requests || [];
    const trackingPixels = data.trackingPixels || [];
    
    // Analyze cookies
    this.analyzeCookies();
    
    let https = 0, http = 0, mixed = 0, thirdParty = 0;
    const currentDomain = this.currentTab ? new URL(this.currentTab.url).hostname : '';
    
    requests.forEach(req => {
      try {
        const url = new URL(req.url);
        if (url.protocol === 'https:') https++;
        else if (url.protocol === 'http:') http++;
        
        if (url.hostname !== currentDomain) thirdParty++;
      } catch (e) {
        // Invalid URL
      }
    });
    
    this.updateElement('httpsRequests', https);
    this.updateElement('httpRequests', http);
    this.updateElement('mixedContent', mixed);
    this.updateElement('thirdPartyRequests', thirdParty);
    
    // Security issues
    const issues = [];
    if (http > 0) {
      issues.push({
        severity: 'warning',
        message: `${http} insecure HTTP requests detected`
      });
    }
    
    const issuesList = document.getElementById('securityIssuesList');
    if (issuesList) {
      if (issues.length > 0) {
        issuesList.innerHTML = issues.map(issue => `
          <div class="security-issue ${issue.severity}">
            <span class="issue-icon">⚠️</span>
            <span class="issue-message">${issue.message}</span>
          </div>
        `).join('');
      } else {
        issuesList.innerHTML = '<div class="issues-placeholder">No security issues detected</div>';
      }
    }
    
    // Display tracking pixels
    const trackingList = document.getElementById('trackingPixelsList');
    if (trackingList) {
      if (trackingPixels.length > 0) {
        const uniquePlatforms = {};
        trackingPixels.forEach(pixel => {
          if (!uniquePlatforms[pixel.platform]) {
            uniquePlatforms[pixel.platform] = [];
          }
          uniquePlatforms[pixel.platform].push(pixel);
        });
        
        trackingList.innerHTML = Object.entries(uniquePlatforms).map(([platform, pixels]) => `
          <div class="tracking-item">
            <span class="tracking-platform">🎯 ${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
            <span class="tracking-count">${pixels.length} ${pixels.length === 1 ? 'pixel' : 'pixels'}</span>
          </div>
        `).join('');
      } else {
        trackingList.innerHTML = '<div class="tracking-placeholder">No tracking pixels detected</div>';
      }
    }
  }

  updateAPIAnalysis(data) {
    const requests = data.requests || [];
    
    // Find all XHR/Fetch requests as potential APIs
    const apis = requests.filter(req => {
      // Include all XHR and Fetch requests
      if (req.type === 'xhr' || req.type === 'fetch') {
        return true;
      }
      // Also include obvious API URLs
      const url = req.url || '';
      return url.includes('/api/') || 
             url.includes('.json') || 
             url.includes('/v1/') || 
             url.includes('/v2/') ||
             url.includes('/graphql');
    });
    
    // Unique endpoints
    const endpoints = new Set(apis.map(req => {
      try {
        const url = new URL(req.url);
        return url.pathname;
      } catch {
        return req.url;
      }
    }));
    
    // API domains
    const apiDomains = new Set(apis.map(req => {
      try {
        return new URL(req.url).hostname;
      } catch {
        return '';
      }
    }));
    
    this.updateElement('uniqueEndpoints', endpoints.size);
    this.updateElement('apiDomains', apiDomains.size);
    this.updateElement('graphqlQueries', 0); // TODO: detect GraphQL
    
    // Top endpoints
    const endpointCounts = {};
    apis.forEach(req => {
      try {
        const pathname = new URL(req.url).pathname;
        endpointCounts[pathname] = (endpointCounts[pathname] || 0) + 1;
      } catch {
        // Invalid URL
      }
    });
    
    const topEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const endpointsList = document.getElementById('topEndpointsList');
    if (endpointsList) {
      if (topEndpoints.length > 0) {
        endpointsList.innerHTML = topEndpoints.map(([endpoint, count]) => `
          <div class="endpoint-item">
            <span class="endpoint-path">${endpoint}</span>
            <span class="endpoint-count">${count} calls</span>
          </div>
        `).join('');
      } else {
        endpointsList.innerHTML = '<div class="endpoints-placeholder">No API endpoints discovered yet</div>';
      }
    }
    
    // Display API schemas if we have response bodies
    const apisWithBodies = apis.filter(req => req.responseBody);
    const schemasList = document.getElementById('apiSchemasList');
    
    if (schemasList) {
      if (apisWithBodies.length > 0) {
        const schemas = apisWithBodies.slice(0, 3).map(req => {
          const schema = this.extractSchema(req.responseBody);
          return `
            <div class="schema-item">
              <div class="schema-endpoint">${req.method} ${this.truncateUrl(req.url, 40)}</div>
              <div class="schema-fields">${schema}</div>
            </div>
          `;
        });
        schemasList.innerHTML = schemas.join('');
      } else {
        schemasList.innerHTML = '<div class="schemas-placeholder">No API responses captured yet</div>';
      }
    }
  }
  
  extractSchema(obj) {
    if (!obj || typeof obj !== 'object') return 'Primitive response';
    
    const keys = Object.keys(obj).slice(0, 5);
    if (keys.length === 0) return 'Empty object';
    
    return keys.map(key => {
      const type = Array.isArray(obj[key]) ? 'array' : typeof obj[key];
      return `<span class="schema-field">${key}: ${type}</span>`;
    }).join(', ');
  }

  generatePerformanceInsights(data) {
    const insights = [];
    const requests = data.requests || [];
    
    // Always show total requests and average time
    if (requests.length > 0) {
      const avgTime = this.calculateAverageResponseTime(requests);
      
      // Performance grade based on average time
      if (avgTime < 200) {
        insights.push({
          type: 'success',
          message: `Excellent performance! Average response time: ${Math.round(avgTime)}ms`
        });
      } else if (avgTime < 500) {
        insights.push({
          type: 'info',
          message: `Good performance. Average response time: ${Math.round(avgTime)}ms`
        });
      } else if (avgTime < 1000) {
        insights.push({
          type: 'warning',
          message: `Moderate performance. Average response time: ${Math.round(avgTime)}ms - Consider optimization`
        });
      } else {
        insights.push({
          type: 'error',
          message: `Poor performance! Average response time: ${Math.round(avgTime)}ms - Optimization needed`
        });
      }
    }
    
    // Check for slow requests
    const slowCount = requests.filter(r => r.duration > 2000).length;
    if (slowCount > 0) {
      const slowest = Math.max(...requests.filter(r => r.duration).map(r => r.duration));
      insights.push({
        type: 'warning',
        message: `${slowCount} slow requests (>2s), slowest: ${Math.round(slowest)}ms`
      });
    }
    
    // Check for failed requests
    const failedCount = requests.filter(r => r.failed || r.status >= 400).length;
    if (failedCount > 0) {
      const errorTypes = {};
      requests.filter(r => r.status >= 400).forEach(r => {
        const code = Math.floor(r.status / 100) * 100;
        errorTypes[code] = (errorTypes[code] || 0) + 1;
      });
      const errorSummary = Object.entries(errorTypes).map(([code, count]) => `${count}x ${code}s`).join(', ');
      insights.push({
        type: 'error',
        message: `${failedCount} failed requests (${errorSummary})`
      });
    }
    
    // Check for large resources
    const largeResources = requests.filter(r => r.size > 1000000);
    if (largeResources.length > 0) {
      const totalLargeSize = largeResources.reduce((sum, r) => sum + r.size, 0);
      insights.push({
        type: 'info',
        message: `${largeResources.length} large resources (>1MB), total: ${this.formatBytes(totalLargeSize)}`
      });
    }
    
    // Check for too many requests
    if (requests.length > 100) {
      insights.push({
        type: 'warning',
        message: `High request count (${requests.length}) - Consider bundling or caching`
      });
    } else if (requests.length > 50) {
      insights.push({
        type: 'info',
        message: `${requests.length} total requests - Room for optimization`
      });
    }
    
    // Check for too many domains
    const domains = new Set(requests.map(r => {
      try { return new URL(r.url).hostname; } catch { return null; }
    }).filter(Boolean));
    if (domains.size > 20) {
      insights.push({
        type: 'warning',
        message: `Requests from ${domains.size} different domains - High third-party dependency`
      });
    }
    
    // Check cache usage
    const cachedRequests = requests.filter(r => r.status === 304).length;
    if (cachedRequests > 0) {
      insights.push({
        type: 'success',
        message: `Good caching: ${cachedRequests} requests served from cache`
      });
    } else if (requests.length > 20) {
      insights.push({
        type: 'info',
        message: 'Consider implementing caching for better performance'
      });
    }
    
    const container = document.getElementById('performanceInsights');
    if (container) {
      if (insights.length > 0) {
        container.innerHTML = insights.map(insight => `
          <div class="insight-item ${insight.type}">
            <span class="insight-icon">${
              insight.type === 'error' ? '❌' : 
              insight.type === 'warning' ? '⚠️' : 
              insight.type === 'success' ? '✅' :
              'ℹ️'
            }</span>
            <span class="insight-message">${insight.message}</span>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<div class="insight-placeholder">Loading performance analysis...</div>';
      }
    }
  }

  calculateAverageResponseTime(requests) {
    const timings = requests.filter(r => r.duration).map(r => r.duration);
    if (timings.length === 0) return 0;
    return timings.reduce((a, b) => a + b, 0) / timings.length;
  }

  calculateSafetyScore(data) {
    let score = 100;
    const trackingPixels = data.trackingPixels || [];
    const errors = data.errors || [];
    const requests = data.requests || [];
    
    // Deduct for tracking pixels
    if (trackingPixels.length > 10) {
      score -= 30;
    } else if (trackingPixels.length > 5) {
      score -= 20;
    } else if (trackingPixels.length > 0) {
      score -= 10;
    }
    
    // Deduct for errors
    if (errors.length > 10) {
      score -= 20;
    } else if (errors.length > 5) {
      score -= 10;
    } else if (errors.length > 0) {
      score -= 5;
    }
    
    // Check for HTTP resources (mixed content)
    const httpRequests = requests.filter(r => r.url && r.url.startsWith('http://'));
    if (httpRequests.length > 0) {
      score -= 15;
    }
    
    // Check for suspicious domains
    const suspiciousDomains = ['doubleclick', 'googletagmanager', 'facebook.com/tr', 'hotjar'];
    const hasSuspicious = requests.some(r => 
      suspiciousDomains.some(domain => r.url && r.url.includes(domain))
    );
    if (hasSuspicious) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  truncateUrl(url, maxLength) {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  }

  getStatusClass(status) {
    if (!status) return 'unknown';
    if (status < 300) return 'success';
    if (status < 400) return 'redirect';
    if (status < 500) return 'client-error';
    return 'server-error';
  }

  async analyzeCookies() {
    if (!this.currentTab) return;
    
    try {
      const url = new URL(this.currentTab.url);
      const cookies = await chrome.cookies.getAll({ domain: url.hostname });
      
      let essential = 0, tracking = 0;
      const trackingPatterns = ['_ga', '_gid', 'fbp', 'fbc', '_utm', 'doubleclick'];
      
      cookies.forEach(cookie => {
        const isTracking = trackingPatterns.some(p => cookie.name.includes(p));
        if (isTracking) {
          tracking++;
        } else if (cookie.name.includes('session') || cookie.name.includes('auth')) {
          essential++;
        }
      });
      
      // Update cookie display
      this.updateElement('cookieTotal', cookies.length);
      this.updateElement('cookieEssential', essential);
      this.updateElement('cookieTracking', tracking);
      
      // Simple compliance check
      const gdprOk = tracking === 0 || cookies.some(c => c.name.includes('consent'));
      const ccpaOk = tracking < 5;
      
      this.updateElement('gdprStatus', gdprOk ? '✅' : '❌');
      this.updateElement('ccpaStatus', ccpaOk ? '✅' : '⚠️');
      
      // Display risks
      const risksEl = document.getElementById('cookieRisks');
      if (risksEl) {
        if (tracking > 5) {
          risksEl.innerHTML = `<div class="cookie-risk high">⚠️ ${tracking} tracking cookies detected</div>`;
        } else if (tracking > 0) {
          risksEl.innerHTML = `<div class="cookie-risk medium">ℹ️ ${tracking} tracking cookies found</div>`;
        } else {
          risksEl.innerHTML = '<div class="cookie-risk low">✅ No tracking cookies detected</div>';
        }
      }
    } catch (error) {
      console.error('Cookie analysis failed:', error);
    }
  }
  
  updateElement(id, value, selector = null) {
    const element = selector ? document.querySelector(selector) : document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  updateBar(selector, percentage) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.width = `${percentage}%`;
    }
  }

  showEmptyState(message) {
    const containers = [
      'activityStream',
      'requestsTableBody',
      'topDomains',
      'performanceInsights',
      'securityIssuesList',
      'topEndpointsList'
    ];
    
    containers.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = `<div class="placeholder">${message}</div>`;
      }
    });
  }

  setupEventListeners() {
    // Search and filter functionality
    const searchInput = document.getElementById('requestSearch');
    const filterSelect = document.getElementById('requestFilter');
    
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterRequests());
    }
    
    if (filterSelect) {
      filterSelect.addEventListener('change', () => this.filterRequests());
    }
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.reload(tab.id);
        setTimeout(() => this.fetchData(), 2000);
      });
    }

    // Export button and menu
    const exportBtn = document.getElementById('exportBtn');
    const exportMenu = document.getElementById('exportMenu');
    
    if (exportBtn && exportMenu) {
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.style.display = exportMenu.style.display === 'none' ? 'block' : 'none';
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', () => {
        exportMenu.style.display = 'none';
      });
      
      // Handle export options
      document.querySelectorAll('.export-option').forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const format = option.dataset.format;
          this.exportData(format);
          exportMenu.style.display = 'none';
        });
      });
    }
  }

  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active states
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding panel
        tabPanels.forEach(panel => {
          panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`${tabName}-tab`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  exportData(format) {
    if (!this.data || Object.keys(this.data).length === 0) {
      alert('No data to export. Please wait for data to be captured.');
      return;
    }
    
    try {
      let filename;
      switch(format) {
        case 'har':
          filename = HARExporter.downloadHAR(this.data);
          console.log(`📦 Exported HAR file: ${filename}`);
          break;
        case 'json':
          filename = HARExporter.exportToJSON(this.data);
          console.log(`📄 Exported JSON file: ${filename}`);
          break;
        case 'csv':
          filename = HARExporter.exportToCSV(this.data);
          console.log(`📊 Exported CSV file: ${filename}`);
          break;
        default:
          console.error('Unknown export format:', format);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please check the console for details.');
    }
  }
  
  exportReport() {
    const report = {
      url: this.currentTab.url,
      timestamp: new Date().toISOString(),
      data: this.data
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `dr-dom-report-${Date.now()}.json`,
      saveAs: true
    });
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DrDOMAdvancedPopup();
  });
} else {
  new DrDOMAdvancedPopup();
}