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
    
    this.updateElement('requestCount', requests.length);
    this.updateElement('errorCount', errors.length);
    
    // Calculate performance score
    const avgTime = this.calculateAverageResponseTime(requests);
    const perfScore = avgTime < 500 ? 100 : avgTime < 1000 ? 80 : avgTime < 2000 ? 60 : 40;
    this.updateElement('performanceScore', perfScore);
    
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
      else if (req.type === 'image' || req.subType === 'image') types.image++;
      else types.other++;
    });
    
    const total = requests.length || 1;
    
    // Update counts
    this.updateElement('xhr-count', types.xhr, '.xhr-count');
    this.updateElement('fetch-count', types.fetch, '.fetch-count');
    this.updateElement('script-count', types.script, '.script-count');
    this.updateElement('image-count', types.image, '.image-count');
    
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
          <td><button class="btn-small" onclick="viewRequestDetails('${req.id}')">View</button></td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr class="no-requests"><td colspan="7">No requests captured yet</td></tr>';
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
  }

  updateAPIAnalysis(data) {
    const requests = data.requests || [];
    
    // Find API endpoints
    const apis = requests.filter(req => {
      const url = req.url || '';
      return url.includes('/api/') || 
             url.includes('.json') || 
             url.includes('/v1/') || 
             url.includes('/v2/') ||
             url.includes('/graphql') ||
             req.type === 'fetch' || 
             req.type === 'xhr';
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
  }

  generatePerformanceInsights(data) {
    const insights = [];
    const requests = data.requests || [];
    
    // Check for slow requests
    const slowCount = requests.filter(r => r.duration > 2000).length;
    if (slowCount > 0) {
      insights.push({
        type: 'warning',
        message: `${slowCount} requests took longer than 2 seconds`
      });
    }
    
    // Check for failed requests
    const failedCount = requests.filter(r => r.failed || r.status >= 400).length;
    if (failedCount > 0) {
      insights.push({
        type: 'error',
        message: `${failedCount} requests failed or returned errors`
      });
    }
    
    // Check for large resources
    const largeResources = requests.filter(r => r.size > 1000000).length;
    if (largeResources > 0) {
      insights.push({
        type: 'info',
        message: `${largeResources} resources larger than 1MB detected`
      });
    }
    
    const container = document.getElementById('performanceInsights');
    if (container) {
      if (insights.length > 0) {
        container.innerHTML = insights.map(insight => `
          <div class="insight-item ${insight.type}">
            <span class="insight-icon">${insight.type === 'error' ? '❌' : insight.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span class="insight-message">${insight.message}</span>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<div class="insight-placeholder">No performance issues detected</div>';
      }
    }
  }

  calculateAverageResponseTime(requests) {
    const timings = requests.filter(r => r.duration).map(r => r.duration);
    if (timings.length === 0) return 0;
    return timings.reduce((a, b) => a + b, 0) / timings.length;
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
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.reload(tab.id);
        setTimeout(() => this.fetchData(), 2000);
      });
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
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