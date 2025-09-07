/**
 * Dr. DOM Advanced Popup Controller
 * Manages comprehensive web analysis interface with real-time data
 */

class DrDOMAdvancedPopup {
  constructor() {
    this.isInspecting = true; // ALWAYS TRUE - always monitoring
    this.currentTab = null;
    this.currentData = null;
    this.activeTab = 'overview';
    this.sortField = 'timestamp';
    this.sortDirection = 'desc';
    this.searchTerm = '';
    this.activeFilter = 'all';
    
    // Data storage
    this.requests = new Map();
    this.metrics = {};
    this.insights = [];
    
    console.log('Dr. DOM Advanced Popup initialized - Live Monitoring Active');
    this.init();
  }

  async init() {
    try {
      await this.loadCurrentTab();
      this.setupEventListeners();
      this.setupTabNavigation();
      this.startDataPolling();
      this.updateUI();
      console.log('Advanced popup ready');
    } catch (error) {
      console.error('Failed to initialize popup:', error);
    }
  }

  async loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      console.log('Current tab:', tab.url);
      
      // Test content script connection
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
        console.log('Content scripts available:', !!response);
      } catch (error) {
        console.log('Content scripts not loaded, injecting now...');
        // Inject content scripts if they're not already loaded
        await this.injectContentScripts(tab.id);
      }
    } catch (error) {
      console.error('Failed to load tab:', error);
    }
  }
  
  async injectContentScripts(tabId) {
    try {
      // Inject all required scripts in order
      const scripts = [
        'lib/dom-utils.js',
        'content-scripts/error-tracker.js',
        'content-scripts/performance-monitor.js',
        'content-scripts/network-monitor.js',
        'content-scripts/advanced-network-monitor.js',
        'content-scripts/intelligent-error-analyzer.js',
        'content-scripts/smart-console-analyzer.js',
        'content-scripts/core-web-vitals-monitor.js',
        'content-scripts/dom-inspector.js',
        'content-scripts/coordinator.js'
      ];
      
      // Inject CSS first
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['content-scripts/inspector-styles.css']
      });
      
      // Inject scripts
      await chrome.scripting.executeScript({
        target: { tabId },
        files: scripts
      });
      
      console.log('Content scripts injected successfully');
      
      // Wait a bit for scripts to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Test connection again
      const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      console.log('Scripts loaded and ready:', !!response);
      
    } catch (error) {
      console.error('Failed to inject scripts:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Refresh button - force data refresh
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.fetchComprehensiveData();
        this.showNotification('🔄', 'Data refreshed', 'info');
      });
    }

    // Action buttons
    document.getElementById('screenshotBtn').addEventListener('click', () => {
      this.takeScreenshot();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportAdvancedReport();
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettings();
    });

    // Search and filtering
    const searchInput = document.getElementById('requestSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.filterAndDisplayRequests();
      });
    }

    const filterSelect = document.getElementById('requestFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.activeFilter = e.target.value;
        this.filterAndDisplayRequests();
      });
    }

    // Clear requests
    const clearBtn = document.getElementById('clearRequests');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearRequestsData();
      });
    }

    // Table sorting
    document.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', () => {
        const sortField = header.getAttribute('data-sort');
        if (this.sortField === sortField) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortField = sortField;
          this.sortDirection = 'desc';
        }
        this.filterAndDisplayRequests();
      });
    });

    // Modal controls
    const modal = document.getElementById('requestDetailModal');
    const closeModal = document.getElementById('closeModal');
    
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }

    console.log('Event listeners set up');
  }

  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Update active button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update active panel
        tabPanels.forEach(panel => panel.classList.remove('active'));
        const targetPanel = document.getElementById(`${targetTab}-tab`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
        
        this.activeTab = targetTab;
        this.updateTabContent(targetTab);
      });
    });
  }

  canAccessTab(tab) {
    const url = tab.url;
    const restrictedProtocols = ['chrome:', 'chrome-extension:', 'moz-extension:', 'edge:', 'safari-extension:'];
    return !restrictedProtocols.some(protocol => url.startsWith(protocol));
  }

  async toggleInspection() {
    if (!this.currentTab || !this.canAccessTab(this.currentTab)) {
      this.showNotification('❌', 'Cannot inspect this page. Try a regular website.', 'error');
      return;
    }

    try {
      this.isInspecting = !this.isInspecting;
      
      if (this.isInspecting) {
        await this.startAdvancedInspection();
        this.showNotification('🚀', 'Advanced analysis started!', 'success');
      } else {
        await this.stopAdvancedInspection();
        this.showNotification('⏹️', 'Analysis stopped', 'info');
      }
      
      this.updateUI();
      
    } catch (error) {
      console.error('Toggle inspection failed:', error);
      this.showNotification('❌', `Error: ${error.message}`, 'error');
      this.isInspecting = !this.isInspecting; // Revert
      this.updateUI();
    }
  }

  async startAdvancedInspection() {
    console.log('Starting advanced inspection...');
    
    const response = await chrome.tabs.sendMessage(this.currentTab.id, {
      action: 'startInspection',
      config: {
        comprehensiveAnalysis: true,
        realTimeUpdates: true,
        securityAnalysis: true,
        performanceMonitoring: true
      }
    });
    
    console.log('Start response:', response);
    
    // Start background monitoring
    chrome.runtime.sendMessage({
      action: 'startAdvancedMonitoring',
      tabId: this.currentTab.id
    });
  }

  async stopAdvancedInspection() {
    console.log('Stopping advanced inspection...');
    
    const response = await chrome.tabs.sendMessage(this.currentTab.id, {
      action: 'stopInspection'
    });
    
    console.log('Stop response:', response);
    
    chrome.runtime.sendMessage({
      action: 'stopAdvancedMonitoring',
      tabId: this.currentTab.id
    });
  }

  startDataPolling() {
    // Poll for comprehensive data every 2 seconds
    setInterval(async () => {
      if (this.isInspecting && this.currentTab) {
        try {
          await this.fetchComprehensiveData();
        } catch (error) {
          // Silently handle polling errors
          console.log('Polling error (normal during navigation):', error.message);
        }
      }
    }, 2000);

    // Also poll for basic stats every 1 second for responsiveness
    setInterval(async () => {
      if (this.isInspecting && this.currentTab) {
        try {
          await this.fetchBasicStats();
        } catch (error) {
          // Silently handle polling errors
        }
      }
    }, 1000);
  }

  async fetchComprehensiveData() {
    const data = await chrome.tabs.sendMessage(this.currentTab.id, {
      action: 'getInspectionData'
    });
    
    if (data) {
      this.currentData = data;
      this.processNewData(data);
      this.updateAllDisplays();
    }
  }

  async fetchBasicStats() {
    const stats = await chrome.tabs.sendMessage(this.currentTab.id, {
      action: 'getStats'
    });
    
    if (stats) {
      this.updateQuickStats(stats);
    }
  }

  processNewData(data) {
    // Process new requests
    if (data.requests) {
      data.requests.forEach(request => {
        const existingRequest = this.requests.get(request.id);
        if (!existingRequest) {
          // New request
          this.requests.set(request.id, request);
          this.addToActivityStream('🌐', this.formatRequestActivity(request));
        } else if (existingRequest.status !== request.status) {
          // Request completed
          this.requests.set(request.id, request);
          this.addToActivityStream(
            request.error ? '❌' : '✅', 
            this.formatRequestCompletedActivity(request)
          );
        }
      });
    }

    // Store metrics
    if (data.metrics) {
      this.metrics = data.metrics;
    }

    // Store insights
    if (data.performanceInsights) {
      this.insights = data.performanceInsights;
    }
  }

  formatRequestActivity(request) {
    const domain = new URL(request.url).hostname;
    const path = new URL(request.url).pathname;
    return `${request.method} ${domain}${path.length > 30 ? path.substring(0, 30) + '...' : path}`;
  }

  formatRequestCompletedActivity(request) {
    const domain = new URL(request.url).hostname;
    const status = request.error ? 'Failed' : request.status;
    const duration = request.duration ? ` (${request.duration}ms)` : '';
    return `${domain} → ${status}${duration}`;
  }

  addToActivityStream(icon, message) {
    const stream = document.getElementById('activityStream');
    if (!stream) return;

    // Remove placeholder
    const placeholder = stream.querySelector('.activity-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    // Create activity item
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <div class="activity-icon">${icon}</div>
      <div class="activity-text">
        <div class="activity-title">${message}</div>
        <div class="activity-time">${new Date().toLocaleTimeString()}</div>
      </div>
    `;

    // Add to top
    stream.insertBefore(item, stream.firstChild);

    // Keep only last 50 items
    const items = stream.querySelectorAll('.activity-item');
    if (items.length > 50) {
      items[items.length - 1].remove();
    }
  }

  updateUI() {
    this.updateInspectionButton();
    this.updateStatusIndicator();
    this.updateQuickStats(this.metrics);
  }

  updateInspectionButton() {
    const btn = document.getElementById('inspectBtn');
    if (btn) {
      if (this.isInspecting) {
        btn.innerHTML = '<span class="btn-icon">⏸️</span>Stop Analysis';
        btn.classList.add('active');
      } else {
        btn.innerHTML = '<span class="btn-icon">🔍</span>Start Analysis';
        btn.classList.remove('active');
      }
    }
  }

  updateStatusIndicator() {
    const indicator = document.getElementById('statusIndicator');
    if (indicator) {
      const statusText = indicator.querySelector('span');
      const statusDot = indicator.querySelector('.status-dot');
      
      if (statusText) {
        statusText.textContent = this.isInspecting ? 'Analyzing' : 'Ready';
      }
      
      if (statusDot) {
        statusDot.style.background = this.isInspecting ? 'var(--error-color)' : 'var(--success-color)';
      }
    }
  }

  updateQuickStats(stats = {}) {
    const elements = {
      requestCount: stats.totalRequests || 0,
      performanceScore: this.formatPerformanceScore(stats.performance),
      avgResponseTime: this.formatDuration(stats.averageResponseTime),
      errorCount: stats.errors || 0
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
        
        // Add visual effects for changes
        if (element.textContent !== element.getAttribute('data-prev')) {
          element.style.transform = 'scale(1.1)';
          element.style.color = 'var(--primary-color)';
          setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
          }, 200);
          element.setAttribute('data-prev', element.textContent);
        }
      }
    });
  }

  updateAllDisplays() {
    if (!this.currentData) return;

    this.updateOverviewTab();
    this.updateRequestsTab();
    this.updatePerformanceTab();
    this.updateSecurityTab();
    this.updateAPIsTab();
  }

  updateOverviewTab() {
    this.updateRequestDistribution();
    this.updateStatusCodes();
    this.updateTopDomains();
    this.updateDataTransfer();
  }

  updateRequestDistribution() {
    if (!this.currentData?.metrics?.requestTypes) return;

    const types = this.currentData.metrics.requestTypes;
    const total = Object.values(types).reduce((sum, count) => sum + count, 0);

    Object.entries(types).forEach(([type, count]) => {
      const percentage = total > 0 ? (count / total) * 100 : 0;
      const fillElement = document.querySelector(`.request-type-fill.${type}`);
      const countElement = document.querySelector(`.${type}-count`);
      
      if (fillElement) {
        fillElement.style.width = `${percentage}%`;
      }
      if (countElement) {
        countElement.textContent = count;
      }
    });
  }

  updateStatusCodes() {
    if (!this.currentData?.metrics?.statusCodes) return;

    const codes = this.currentData.metrics.statusCodes;
    Object.entries(codes).forEach(([range, count]) => {
      const element = document.querySelector(`.status-${range}`);
      if (element) {
        element.textContent = count;
      }
    });
  }

  updateTopDomains() {
    const container = document.getElementById('topDomains');
    if (!container || !this.currentData?.topDomains) return;

    if (this.currentData.topDomains.length === 0) {
      container.innerHTML = '<div class="domain-placeholder">No requests yet</div>';
      return;
    }

    const html = this.currentData.topDomains.slice(0, 5).map(domain => `
      <div class="domain-item">
        <div class="domain-name" title="${domain.domain}">
          ${domain.domain.length > 25 ? domain.domain.substring(0, 25) + '...' : domain.domain}
          ${domain.isThirdParty ? ' 🌐' : ''}
        </div>
        <div class="domain-count">${domain.count}</div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  updateDataTransfer() {
    if (!this.currentData?.metrics) return;

    const sentElement = document.getElementById('dataSent');
    const receivedElement = document.getElementById('dataReceived');

    if (sentElement) {
      sentElement.textContent = this.formatBytes(this.currentData.metrics.totalDataTransferred || 0);
    }
    if (receivedElement) {
      receivedElement.textContent = this.formatBytes(this.currentData.metrics.totalDataReceived || 0);
    }
  }

  updateRequestsTab() {
    if (!this.currentData?.requests) return;
    this.filterAndDisplayRequests();
  }

  filterAndDisplayRequests() {
    if (!this.currentData?.requests) return;

    let filteredRequests = [...this.currentData.requests];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredRequests = filteredRequests.filter(req => 
        req.url.toLowerCase().includes(term) ||
        req.method.toLowerCase().includes(term) ||
        (req.status && req.status.toString().includes(term))
      );
    }

    // Apply type filter
    switch (this.activeFilter) {
      case 'xhr':
        filteredRequests = filteredRequests.filter(req => req.type === 'xhr');
        break;
      case 'fetch':
        filteredRequests = filteredRequests.filter(req => req.type === 'fetch');
        break;
      case 'failed':
        filteredRequests = filteredRequests.filter(req => req.error || (req.status && req.status >= 400));
        break;
      case 'slow':
        filteredRequests = filteredRequests.filter(req => req.duration && req.duration > 2000);
        break;
      case '3rd-party':
        filteredRequests = filteredRequests.filter(req => req.isThirdParty);
        break;
    }

    // Apply sorting
    filteredRequests.sort((a, b) => {
      let aVal = a[this.sortField];
      let bVal = b[this.sortField];
      
      if (this.sortField === 'url') {
        aVal = new URL(a.url).pathname;
        bVal = new URL(b.url).pathname;
      }
      
      if (typeof aVal === 'string') {
        return this.sortDirection === 'asc' ? 
          aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    this.displayRequestsTable(filteredRequests);
    this.updateRequestsSummary(filteredRequests.length);
  }

  displayRequestsTable(requests) {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;

    if (requests.length === 0) {
      tbody.innerHTML = '<tr class="no-requests"><td colspan="7">No requests match current filters</td></tr>';
      return;
    }

    const html = requests.slice(0, 100).map(request => { // Limit to 100 for performance
      const url = new URL(request.url);
      const displayPath = url.pathname + url.search;
      
      return `
        <tr>
          <td><span class="method-badge method-${request.method.toLowerCase()}">${request.method}</span></td>
          <td class="url-cell" title="${request.url}">
            <strong>${url.hostname}</strong><br>
            <small>${displayPath.length > 40 ? displayPath.substring(0, 40) + '...' : displayPath}</small>
          </td>
          <td>
            ${request.status ? 
              `<span class="status-badge status-${Math.floor(request.status / 100)}xx">${request.status}</span>` : 
              '<span class="status-badge status-pending">Pending</span>'
            }
          </td>
          <td class="duration-cell ${request.duration > 2000 ? 'duration-slow' : ''}">
            ${request.duration ? this.formatDuration(request.duration) : '--'}
          </td>
          <td class="size-cell">${this.formatBytes(request.responseSize || 0)}</td>
          <td>${this.getRequestTypeDisplay(request)}</td>
          <td><button class="view-btn" onclick="window.drDOMPopup.showRequestDetails('${request.id}')">View</button></td>
        </tr>
      `;
    }).join('');

    tbody.innerHTML = html;
  }

  getRequestTypeDisplay(request) {
    if (request.type === 'xhr' || request.type === 'fetch') return request.type.toUpperCase();
    
    const contentType = request.contentType || '';
    if (contentType.includes('image/')) return 'Image';
    if (contentType.includes('javascript')) return 'Script';
    if (contentType.includes('css')) return 'Style';
    if (contentType.includes('json')) return 'JSON';
    
    return 'Other';
  }

  updateRequestsSummary(count) {
    const summary = document.getElementById('requestsSummary');
    if (summary) {
      summary.textContent = `Showing ${count} request${count !== 1 ? 's' : ''}`;
    }
  }

  showRequestDetails(requestId) {
    const request = this.requests.get(requestId);
    if (!request) return;

    const modal = document.getElementById('requestDetailModal');
    const content = document.getElementById('requestDetailContent');
    
    if (!modal || !content) return;

    const url = new URL(request.url);
    
    content.innerHTML = `
      <div class="request-detail-section">
        <h4>🌐 Request Overview</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <strong>Method:</strong> <span class="method-badge method-${request.method.toLowerCase()}">${request.method}</span>
          </div>
          <div class="detail-item">
            <strong>Status:</strong> 
            ${request.status ? 
              `<span class="status-badge status-${Math.floor(request.status / 100)}xx">${request.status} ${request.statusText || ''}</span>` : 
              'Pending'
            }
          </div>
          <div class="detail-item">
            <strong>Duration:</strong> ${request.duration ? this.formatDuration(request.duration) : 'N/A'}
          </div>
          <div class="detail-item">
            <strong>Size:</strong> ${this.formatBytes(request.responseSize || 0)}
          </div>
        </div>
      </div>

      <div class="request-detail-section">
        <h4>📍 URL Details</h4>
        <div class="url-breakdown">
          <div><strong>Full URL:</strong> <code>${request.url}</code></div>
          <div><strong>Domain:</strong> ${url.hostname} ${request.isThirdParty ? '(3rd Party)' : '(Same Origin)'}</div>
          <div><strong>Path:</strong> <code>${url.pathname}</code></div>
          ${url.search ? `<div><strong>Query:</strong> <code>${url.search}</code></div>` : ''}
        </div>
      </div>

      ${request.timingBreakdown ? this.renderTimingBreakdown(request.timingBreakdown) : ''}

      ${Object.keys(request.requestHeaders || {}).length > 0 ? `
        <div class="request-detail-section">
          <h4>📤 Request Headers</h4>
          <div class="headers-list">
            ${Object.entries(request.requestHeaders).map(([key, value]) => 
              `<div class="header-item"><strong>${key}:</strong> <code>${value}</code></div>`
            ).join('')}
          </div>
        </div>
      ` : ''}

      ${Object.keys(request.responseHeaders || {}).length > 0 ? `
        <div class="request-detail-section">
          <h4>📥 Response Headers</h4>
          <div class="headers-list">
            ${Object.entries(request.responseHeaders).map(([key, value]) => 
              `<div class="header-item"><strong>${key}:</strong> <code>${value}</code></div>`
            ).join('')}
          </div>
        </div>
      ` : ''}

      ${request.requestBody ? `
        <div class="request-detail-section">
          <h4>📤 Request Body</h4>
          <pre class="code-block">${this.formatCodeBlock(request.requestBody)}</pre>
        </div>
      ` : ''}

      ${request.responseBody ? `
        <div class="request-detail-section">
          <h4>📥 Response Body</h4>
          <pre class="code-block">${this.formatCodeBlock(request.responseBody)}</pre>
        </div>
      ` : ''}

      ${request.securityIssues?.length > 0 || request.privacyIssues?.length > 0 ? `
        <div class="request-detail-section">
          <h4>🚨 Issues</h4>
          ${request.securityIssues?.map(issue => `<div class="issue-tag security">🔒 ${issue}</div>`).join('') || ''}
          ${request.privacyIssues?.map(issue => `<div class="issue-tag privacy">👁️ ${issue}</div>`).join('') || ''}
        </div>
      ` : ''}
    `;

    modal.classList.add('active');
  }

  renderTimingBreakdown(timing) {
    const total = Object.values(timing).reduce((sum, time) => sum + time, 0);
    if (total === 0) return '';

    return `
      <div class="request-detail-section">
        <h4>⏱️ Timing Breakdown</h4>
        <div class="timing-chart">
          ${Object.entries(timing).map(([phase, time]) => {
            const percentage = total > 0 ? (time / total) * 100 : 0;
            return `
              <div class="timing-phase">
                <div class="timing-label">${this.getTimingPhaseLabel(phase)}</div>
                <div class="timing-bar">
                  <div class="timing-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="timing-value">${time}ms</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  getTimingPhaseLabel(phase) {
    const labels = {
      dns: 'DNS Lookup',
      connect: 'Connection',
      ssl: 'SSL Handshake',
      send: 'Request Sent',
      wait: 'Waiting (TTFB)',
      receive: 'Content Download'
    };
    return labels[phase] || phase;
  }

  updatePerformanceTab() {
    if (!this.currentData) return;

    this.updatePerformanceCards();
    this.updatePerformanceInsights();
    this.updateSlowRequests();
  }

  updatePerformanceCards() {
    const metrics = this.currentData.metrics || {};
    
    document.getElementById('avgResponseTimeDetailed').textContent = 
      this.formatDuration(metrics.averageResponseTime);
    
    document.getElementById('fastestRequest').textContent = 
      metrics.fastestRequest ? this.formatDuration(metrics.fastestRequest.duration) : 'N/A';
    
    document.getElementById('slowestRequest').textContent = 
      metrics.slowestRequest ? this.formatDuration(metrics.slowestRequest.duration) : 'N/A';
    
    document.getElementById('totalDataTransfer').textContent = 
      this.formatBytes((metrics.totalDataTransferred || 0) + (metrics.totalDataReceived || 0));
  }

  updatePerformanceInsights() {
    const container = document.getElementById('performanceInsights');
    if (!container) return;

    if (!this.insights || this.insights.length === 0) {
      container.innerHTML = '<div class="insight-placeholder">No performance issues detected - great job! 🎉</div>';
      return;
    }

    const html = this.insights.map(insight => `
      <div class="insight-item insight-severity-${insight.severity}">
        <div class="insight-icon">${this.getInsightIcon(insight.type, insight.severity)}</div>
        <div class="insight-content">
          <div class="insight-title">${insight.title}</div>
          <div class="insight-description">${insight.description}</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  getInsightIcon(type, severity) {
    const icons = {
      performance: severity === 'error' ? '🚨' : '⚠️',
      optimization: '💡',
      security: '🔒'
    };
    return icons[type] || '💡';
  }

  updateSlowRequests() {
    const container = document.getElementById('slowRequestsList');
    if (!container || !this.currentData?.slowestRequests) return;

    const slowRequests = this.currentData.slowestRequests.filter(req => req.duration > 1000);

    if (slowRequests.length === 0) {
      container.innerHTML = '<div class="slow-requests-placeholder">No slow requests detected 🚀</div>';
      return;
    }

    const html = slowRequests.slice(0, 10).map(request => {
      const url = new URL(request.url);
      return `
        <div class="slow-request-item">
          <div class="slow-request-info">
            <div class="slow-request-url">${url.hostname}${url.pathname}</div>
            <div class="slow-request-method">${request.method}</div>
          </div>
          <div class="slow-request-duration duration-slow">
            ${this.formatDuration(request.duration)}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  updateSecurityTab() {
    if (!this.currentData?.metrics?.securityMetrics) return;

    const security = this.currentData.metrics.securityMetrics;
    
    document.getElementById('httpsRequests').textContent = security.httpsRequests || 0;
    document.getElementById('httpRequests').textContent = security.httpRequests || 0;
    document.getElementById('mixedContent').textContent = security.mixedContent || 0;
    document.getElementById('thirdPartyRequests').textContent = security.thirdPartyRequests || 0;

    this.updateSecurityIssues();
    this.updatePrivacyIssues();
  }

  updateSecurityIssues() {
    const container = document.getElementById('securityIssuesList');
    if (!container) return;

    const issues = this.currentData?.securityIssues || [];

    if (issues.length === 0) {
      container.innerHTML = '<div class="issues-placeholder">No security issues detected 🔒</div>';
      return;
    }

    const html = issues.map(issue => `
      <div class="issue-item">
        <div class="issue-severity high">🚨</div>
        <div class="issue-content">
          <div class="issue-title">Security Issue</div>
          <div class="issue-description">${issue.issue}</div>
          <div class="issue-url">${new URL(issue.url).hostname}</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  updatePrivacyIssues() {
    const container = document.getElementById('privacyIssuesList');
    if (!container) return;

    const issues = this.currentData?.privacyIssues || [];

    if (issues.length === 0) {
      container.innerHTML = '<div class="privacy-placeholder">No privacy concerns detected 👁️</div>';
      return;
    }

    const html = issues.map(issue => `
      <div class="issue-item">
        <div class="issue-severity medium">⚠️</div>
        <div class="issue-content">
          <div class="issue-title">Privacy Concern</div>
          <div class="issue-description">${issue.issue}</div>
          <div class="issue-url">${new URL(issue.url).hostname}</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  updateAPIsTab() {
    if (!this.currentData) return;

    document.getElementById('uniqueEndpoints').textContent = this.currentData.metrics?.uniqueEndpoints || 0;
    document.getElementById('apiDomains').textContent = this.currentData.topDomains?.filter(d => d.isThirdParty).length || 0;
    document.getElementById('graphqlQueries').textContent = this.currentData.graphqlQueries?.length || 0;

    this.updateTopEndpoints();
    this.updateAPISchemas();
  }

  updateTopEndpoints() {
    const container = document.getElementById('topEndpointsList');
    if (!container) return;

    const endpoints = this.currentData?.topEndpoints || [];

    if (endpoints.length === 0) {
      container.innerHTML = '<div class="endpoints-placeholder">No API endpoints discovered yet 🔌</div>';
      return;
    }

    const html = endpoints.slice(0, 10).map(endpoint => `
      <div class="endpoint-item">
        <div class="endpoint-info">
          <div class="endpoint-path">${endpoint.endpoint}</div>
          <div class="endpoint-domain">${endpoint.requests[0]?.domain || 'Unknown'}</div>
        </div>
        <div class="endpoint-stats">
          <div class="endpoint-count">${endpoint.count} calls</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  updateAPISchemas() {
    const container = document.getElementById('apiSchemasList');
    if (!container) return;

    const apis = this.currentData?.apis || [];
    const schemasAvailable = apis.filter(api => api.responseSchema);

    if (schemasAvailable.length === 0) {
      container.innerHTML = '<div class="schemas-placeholder">No API schemas discovered yet 📋</div>';
      return;
    }

    const html = schemasAvailable.slice(0, 5).map(api => `
      <div class="schema-item">
        <div class="schema-header">
          <strong>${api.method} ${api.endpoint}</strong>
          <small>${api.domain}</small>
        </div>
        <div class="schema-content">
          <pre class="code-block">${JSON.stringify(api.responseSchema, null, 2)}</pre>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  updateTabContent(tabName) {
    // Refresh data when switching tabs
    switch (tabName) {
      case 'overview':
        this.updateOverviewTab();
        break;
      case 'requests':
        this.updateRequestsTab();
        break;
      case 'performance':
        this.updatePerformanceTab();
        break;
      case 'security':
        this.updateSecurityTab();
        break;
      case 'apis':
        this.updateAPIsTab();
        break;
    }
  }

  async takeScreenshot() {
    if (!this.currentTab) return;
    
    try {
      const screenshotUrl = await chrome.tabs.captureVisibleTab(
        this.currentTab.windowId,
        { format: 'png', quality: 100 }
      );

      const link = document.createElement('a');
      link.href = screenshotUrl;
      link.download = `dr-dom-screenshot-${Date.now()}.png`;
      link.click();

      this.showNotification('📸', 'Screenshot captured!', 'success');
    } catch (error) {
      console.error('Screenshot failed:', error);
      this.showNotification('❌', 'Failed to capture screenshot', 'error');
    }
  }

  async exportAdvancedReport() {
    if (!this.currentTab || !this.currentData) {
      this.showNotification('❌', 'No data to export', 'error');
      return;
    }

    try {
      const report = {
        metadata: {
          timestamp: new Date().toISOString(),
          url: this.currentTab.url,
          title: this.currentTab.title,
          userAgent: navigator.userAgent,
          analysisVersion: '2.0.0'
        },
        summary: this.currentData.summary || {},
        metrics: this.currentData.metrics || {},
        requests: Array.from(this.requests.values()),
        insights: this.insights,
        securityAnalysis: {
          issues: this.currentData.securityIssues || [],
          privacyIssues: this.currentData.privacyIssues || []
        },
        apiAnalysis: {
          endpoints: this.currentData.topEndpoints || [],
          schemas: this.currentData.apis || [],
          graphql: this.currentData.graphqlQueries || []
        }
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dr-dom-advanced-report-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      this.showNotification('📄', 'Advanced report exported!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      this.showNotification('❌', 'Failed to export report', 'error');
    }
  }

  openSettings() {
    this.showNotification('⚙️', 'Settings panel coming soon!', 'info');
  }

  clearRequestsData() {
    this.requests.clear();
    this.currentData = null;
    this.metrics = {};
    this.insights = [];
    
    // Clear all displays
    document.getElementById('activityStream').innerHTML = 
      '<div class="activity-placeholder">Start analysis to see live activity...</div>';
    
    document.getElementById('requestsTableBody').innerHTML = 
      '<tr class="no-requests"><td colspan="7">No requests captured yet</td></tr>';
    
    this.updateQuickStats({});
    this.showNotification('🧹', 'Data cleared', 'info');
  }

  showNotification(icon, message, type = 'info') {
    this.addToActivityStream(icon, message);
  }

  // Utility methods
  formatDuration(ms) {
    if (!ms) return '--';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  formatPerformanceScore(score) {
    if (!score) return '--';
    return Math.round(score);
  }

  formatCodeBlock(code) {
    if (!code) return '';
    
    try {
      // Try to parse and format JSON
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      // Return as-is if not JSON
      return code.length > 1000 ? code.substring(0, 1000) + '\n...[truncated]' : code;
    }
  }
}

// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting advanced popup...');
  window.drDOMPopup = new DrDOMAdvancedPopup();
});

console.log('Dr. DOM Advanced Popup script loaded');