/**
 * Dr. DOM Advanced Popup - Hybrid Version
 * Works with both chrome.storage AND message passing
 */

class DrDOMAdvancedPopup {
  constructor() {
    this.currentTab = null;
    this.activeTab = 'overview';
    this.data = {
      requests: [],
      errors: [],
      console: [],
      metrics: {},
      trackers: []
    };
    
    console.log('🚀 Dr. DOM Advanced Popup (Hybrid) Initializing...');
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
      
      // Start fetching data from both sources
      this.startHybridDataPolling();
      
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  }

  startHybridDataPolling() {
    // Initial fetch
    this.fetchHybridData();
    
    // Poll every 500ms for real-time updates
    setInterval(() => this.fetchHybridData(), 500);
  }

  async fetchHybridData() {
    if (!this.currentTab || this.currentTab.url.startsWith('chrome://')) return;
    
    const domain = new URL(this.currentTab.url).hostname;
    
    // Try to get data from storage first (new method)
    await this.fetchFromStorage(domain);
    
    // Also try message passing (old method) for any additional data
    await this.fetchFromContentScript();
  }

  async fetchFromStorage(domain) {
    const keys = [
      `drDOM_${domain}_enhancedTrackers`,
      `drDOM_${domain}_privacy_score`,
      `drDOM_${domain}_cookies`,
      `drDOM_${domain}_blocked`,
      `drDOM_${domain}_timeline`,
      `drDOM_${domain}_moneyGame`,
      `privacy_shield_stats`
    ];
    
    chrome.storage.local.get(keys, (result) => {
      // Combine all the data
      const enhancedTrackers = result[`drDOM_${domain}_enhancedTrackers`];
      const privacyScore = result[`drDOM_${domain}_privacy_score`];
      const cookies = result[`drDOM_${domain}_cookies`];
      const blocked = result[`drDOM_${domain}_blocked`];
      const timeline = result[`drDOM_${domain}_timeline`];
      const moneyGame = result[`drDOM_${domain}_moneyGame`];
      const shieldStats = result.privacy_shield_stats;
      
      // Process tracker data
      if (enhancedTrackers) {
        this.data.trackers = enhancedTrackers.trackers || [];
        this.data.requests = enhancedTrackers.trackers.map(t => ({
          id: t.url + Date.now(),
          url: t.url,
          method: t.method || 'GET',
          type: t.type,
          status: 200,
          domain: t.domain,
          category: t.category,
          severity: t.severity,
          timestamp: Date.now()
        }));
        
        console.log(`📊 Data from storage for ${domain}:`, this.data.requests.length, 'requests');
      }
      
      // Process privacy score
      if (privacyScore) {
        this.data.privacyScore = privacyScore.score;
      } else {
        this.data.privacyScore = 100 - (this.data.trackers.length * 2);
      }
      
      // Process shield stats
      if (shieldStats) {
        this.data.shieldStats = shieldStats;
      }
      
      // Update UI with storage data
      this.updateUI(this.data);
    });
  }

  async fetchFromContentScript() {
    try {
      // Try to get data via message passing (for backwards compatibility)
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getInspectionData'
      });
      
      if (response && response.requests) {
        // Merge with existing data
        response.requests.forEach(req => {
          if (!this.data.requests.find(r => r.url === req.url)) {
            this.data.requests.push(req);
          }
        });
        
        console.log('📡 Got additional data from content script:', response.requests.length);
        this.updateUI(this.data);
      }
    } catch (error) {
      // Content scripts might not be loaded, which is fine
      // We're primarily using storage now
    }
  }

  updateUI(data) {
    // Update header status
    const statusIndicator = document.getElementById('statusIndicator');
    if (statusIndicator) {
      const hasData = data.requests.length > 0;
      statusIndicator.innerHTML = hasData ? 
        '<div class="status-dot active"></div><span>🔴 Live Monitoring</span>' :
        '<div class="status-dot"></div><span>⚫ Waiting for data...</span>';
    }
    
    // Update stats
    this.updateStats(data);
    
    // Update request distribution
    this.updateRequestDistribution(data.requests);
    
    // Update requests table
    this.updateRequestsTable(data.requests);
    
    // Update activity stream
    this.updateActivityStream(data);
    
    // Update performance metrics
    this.updatePerformanceMetrics(data);
    
    // Update security analysis
    this.updateSecurityAnalysis(data);
    
    // Update top domains
    this.updateTopDomains(data.requests);
    
    // Update data transfer
    this.updateDataTransfer(data.requests);
  }

  updateStats(data) {
    const requests = data.requests || [];
    const trackers = data.trackers || [];
    
    this.updateElement('requestCount', requests.length);
    this.updateElement('errorCount', requests.filter(r => r.error).length);
    this.updateElement('trackingCount', trackers.length);
    this.updateElement('safetyScore', data.privacyScore || 100);
    
    // Calculate performance score
    const avgTime = this.calculateAverageResponseTime(requests);
    const perfScore = avgTime < 500 ? 100 : avgTime < 1000 ? 80 : avgTime < 2000 ? 60 : 40;
    this.updateElement('performanceScore', perfScore);
    
    // Update average response time
    this.updateElement('avgResponseTime', avgTime > 0 ? `${Math.round(avgTime)}ms` : '--');
  }

  updateRequestDistribution(requests) {
    const types = { xhr: 0, fetch: 0, script: 0, image: 0, other: 0 };
    
    requests.forEach(req => {
      if (req.type === 'xhr' || req.type === 'xmlhttprequest') types.xhr++;
      else if (req.type === 'fetch') types.fetch++;
      else if (req.type === 'script') types.script++;
      else if (req.type === 'image' || req.type === 'img') types.image++;
      else types.other++;
    });
    
    const total = requests.length || 1;
    
    // Update counts
    document.querySelector('.xhr-count').textContent = types.xhr;
    document.querySelector('.fetch-count').textContent = types.fetch;
    document.querySelector('.script-count').textContent = types.script;
    document.querySelector('.image-count').textContent = types.image;
    
    // Update bars
    this.updateBar('.request-type-fill.xhr', (types.xhr / total) * 100);
    this.updateBar('.request-type-fill.fetch', (types.fetch / total) * 100);
    this.updateBar('.request-type-fill.script', (types.script / total) * 100);
    this.updateBar('.request-type-fill.image', (types.image / total) * 100);
  }

  updateRequestsTable(requests) {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    
    const summary = document.getElementById('requestsSummary');
    if (summary) {
      summary.textContent = `Showing ${requests.length} requests`;
    }
    
    if (requests.length > 0) {
      tbody.innerHTML = requests.slice(0, 100).map(req => `
        <tr>
          <td><span class="method-badge ${req.method?.toLowerCase()}">${req.method || 'GET'}</span></td>
          <td class="url-cell" title="${req.url}">${this.truncateUrl(req.url, 40)}</td>
          <td><span class="status-badge status-${this.getStatusClass(req.status)}">${req.status || '--'}</span></td>
          <td>${req.duration ? Math.round(req.duration) + 'ms' : '--'}</td>
          <td>${req.size ? this.formatBytes(req.size) : '--'}</td>
          <td>${req.type || req.category || '--'}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr class="no-requests"><td colspan="6">No requests captured yet. Refresh the page to start monitoring.</td></tr>';
    }
  }

  updateActivityStream(data) {
    const container = document.getElementById('activityStream');
    if (!container) return;
    
    const recentRequests = (data.requests || [])
      .slice(-10)
      .reverse();
    
    if (recentRequests.length > 0) {
      container.innerHTML = recentRequests.map(req => {
        const time = new Date().toLocaleTimeString();
        const status = '✅';
        
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
      container.innerHTML = '<div class="activity-placeholder">Waiting for network activity...</div>';
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
    } else {
      this.updateElement('fastestRequest', '--');
      this.updateElement('slowestRequest', '--');
    }
    
    // Total data transfer
    const totalBytes = requests.reduce((sum, r) => sum + (r.size || 0), 0);
    this.updateElement('totalDataTransfer', this.formatBytes(totalBytes));
    
    // Generate insights
    this.generatePerformanceInsights(data);
  }

  updateSecurityAnalysis(data) {
    const requests = data.requests || [];
    const trackers = data.trackers || [];
    
    let https = 0, http = 0, thirdParty = 0;
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
    this.updateElement('mixedContent', 0);
    this.updateElement('thirdPartyRequests', thirdParty);
    
    // Display trackers by category
    this.displayTrackersByCategory(trackers);
  }

  displayTrackersByCategory(trackers) {
    const container = document.getElementById('trackingPixelsList');
    if (!container) return;
    
    if (trackers.length === 0) {
      container.innerHTML = '<div class="tracking-placeholder">No trackers detected</div>';
      return;
    }
    
    // Group by category
    const byCategory = {};
    trackers.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = [];
      }
      byCategory[t.category].push(t);
    });
    
    container.innerHTML = Object.entries(byCategory).map(([category, items]) => `
      <div class="tracking-item">
        <span class="tracking-platform">🎯 ${category}</span>
        <span class="tracking-count">${items.length} tracker${items.length > 1 ? 's' : ''}</span>
      </div>
    `).join('');
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

  generatePerformanceInsights(data) {
    const insights = [];
    const requests = data.requests || [];
    const trackers = data.trackers || [];
    
    // Check request count
    if (requests.length > 100) {
      insights.push({
        type: 'warning',
        message: `High request count (${requests.length}) - Consider optimization`
      });
    }
    
    // Check trackers
    if (trackers.length > 10) {
      insights.push({
        type: 'error',
        message: `${trackers.length} trackers detected - Heavy tracking activity!`
      });
    } else if (trackers.length > 5) {
      insights.push({
        type: 'warning',
        message: `${trackers.length} trackers found - Moderate tracking`
      });
    }
    
    // Check third-party requests
    const thirdPartyCount = requests.filter(r => {
      try {
        const currentDomain = new URL(this.currentTab.url).hostname;
        return new URL(r.url).hostname !== currentDomain;
      } catch {
        return false;
      }
    }).length;
    
    if (thirdPartyCount > 50) {
      insights.push({
        type: 'warning',
        message: `${thirdPartyCount} third-party requests - High external dependency`
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
              'ℹ️'
            }</span>
            <span class="insight-message">${insight.message}</span>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<div class="insight-placeholder">No performance issues detected 🎉</div>';
      }
    }
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.reload(tab.id);
        setTimeout(() => this.fetchHybridData(), 2000);
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

    // Search and filter
    const searchInput = document.getElementById('requestSearch');
    const filterSelect = document.getElementById('requestFilter');
    
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterRequests());
    }
    
    if (filterSelect) {
      filterSelect.addEventListener('change', () => this.filterRequests());
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
        filtered = filtered.filter(r => r.type === 'xhr' || r.type === 'xmlhttprequest');
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

  exportData(format) {
    const filename = `dr-dom-export-${Date.now()}.${format}`;
    let content = '';
    
    switch(format) {
      case 'json':
        content = JSON.stringify(this.data, null, 2);
        break;
      case 'csv':
        content = this.convertToCSV(this.data.requests);
        break;
      case 'har':
        content = this.convertToHAR(this.data);
        break;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });
  }

  convertToCSV(requests) {
    const headers = ['URL', 'Method', 'Type', 'Status', 'Duration', 'Size'];
    const rows = requests.map(r => [
      r.url,
      r.method || 'GET',
      r.type || '',
      r.status || '',
      r.duration || '',
      r.size || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  convertToHAR(data) {
    return JSON.stringify({
      log: {
        version: '1.2',
        creator: {
          name: 'Dr. DOM',
          version: '2.0.0'
        },
        pages: [{
          startedDateTime: new Date().toISOString(),
          id: 'page_1',
          title: this.currentTab?.title || '',
          pageTimings: {}
        }],
        entries: data.requests.map(r => ({
          startedDateTime: new Date(r.timestamp || Date.now()).toISOString(),
          time: r.duration || 0,
          request: {
            method: r.method || 'GET',
            url: r.url,
            httpVersion: 'HTTP/1.1',
            headers: [],
            queryString: [],
            cookies: [],
            headersSize: -1,
            bodySize: -1
          },
          response: {
            status: r.status || 200,
            statusText: '',
            httpVersion: 'HTTP/1.1',
            headers: [],
            cookies: [],
            content: {
              size: r.size || 0,
              mimeType: r.contentType || 'text/html'
            },
            redirectURL: '',
            headersSize: -1,
            bodySize: r.size || -1
          },
          cache: {},
          timings: {
            blocked: -1,
            dns: -1,
            connect: -1,
            send: -1,
            wait: r.duration || -1,
            receive: -1,
            ssl: -1
          }
        }))
      }
    }, null, 2);
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

  // Utility methods
  calculateAverageResponseTime(requests) {
    const timings = requests.filter(r => r.duration).map(r => r.duration);
    if (timings.length === 0) return 0;
    return timings.reduce((a, b) => a + b, 0) / timings.length;
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
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
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DrDOMAdvancedPopup();
  });
} else {
  new DrDOMAdvancedPopup();
}