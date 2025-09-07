/**
 * Dr. DOM Always-On Popup Controller
 * Works like an ad blocker - always active, no toggle needed
 */

class DrDOMAlwaysOnPopup {
  constructor() {
    this.currentTab = null;
    this.activeTab = 'overview';
    this.data = {
      requests: new Map(),
      metrics: {},
      insights: [],
      activity: []
    };
    
    console.log('🚀 Dr. DOM Always-On - Live Monitoring Active');
    this.init();
  }

  async init() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      // Set up UI
      this.setupEventListeners();
      this.setupTabNavigation();
      
      // Start fetching data immediately
      this.startContinuousDataFetch();
      
      // Show initial notification
      this.showNotification('🔴', 'Live Monitoring Active', 'success');
      
      console.log('✅ Dr. DOM popup ready - monitoring', tab.url);
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.fetchData();
        this.showNotification('🔄', 'Data refreshed', 'info');
      });
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }

    // Screenshot button
    const screenshotBtn = document.getElementById('screenshotBtn');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => this.takeScreenshot());
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }

    // Search and filter for requests
    const searchInput = document.getElementById('requestSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterRequests(e.target.value);
      });
    }

    const filterSelect = document.getElementById('requestFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.applyFilter(e.target.value);
      });
    }
  }

  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    console.log('Setting up tabs, found buttons:', tabButtons.length);
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('Tab clicked:', btn.dataset.tab);
        
        // Update active tab
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding panel
        const tabName = btn.dataset.tab;
        const panels = document.querySelectorAll('.tab-panel');
        console.log('Found panels:', panels.length);
        
        panels.forEach(panel => {
          panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`${tabName}-tab`);
        if (targetPanel) {
          targetPanel.classList.add('active');
          console.log('Activated panel:', `${tabName}-tab`);
        } else {
          console.error('Panel not found:', `${tabName}-tab`);
        }
        
        this.activeTab = tabName;
      });
    });
  }

  startContinuousDataFetch() {
    // Fetch data immediately
    this.fetchData();
    
    // Then fetch every 1 second for real-time updates
    setInterval(() => this.fetchData(), 1000);
    
    // Fetch comprehensive data every 3 seconds
    setInterval(() => this.fetchComprehensiveData(), 3000);
  }

  async fetchData() {
    if (!this.currentTab) {
      console.error('No current tab!');
      return;
    }
    
    try {
      // Get data from chrome.storage.local
      const domain = new URL(this.currentTab.url).hostname;
      const storageKey = `drDOM_${domain}`;
      
      chrome.storage.local.get([storageKey], (result) => {
        const data = result[storageKey];
        if (!data) {
          console.log('No data for', domain);
          return;
        }
        
        // Process the data
        const stats = {
          requests: data.requests?.length || 0,
          errors: data.errors?.length || 0,
          domNodes: document.querySelectorAll('*').length,
          performance: 100
        };
      
      console.log('Received stats:', stats);
      
      if (stats) {
        this.updateQuickStats(stats);
      }
    } catch (error) {
      // Content scripts might not be ready yet - that's ok
      console.log('Waiting for content scripts...', error.message);
    }
  }

  async fetchComprehensiveData() {
    if (!this.currentTab) {
      console.error('No current tab for comprehensive data!');
      return;
    }
    
    try {
      const data = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getInspectionData'
      });
      
      console.log('Received comprehensive data:', data ? 'Yes' : 'No');
      
      if (data) {
        this.processComprehensiveData(data);
      }
    } catch (error) {
      // Silently handle - page might be loading
      console.log('Comprehensive data fetch error:', error.message);
    }
  }

  processComprehensiveData(data) {
    // Process network requests
    if (data.components?.advancedNetwork?.requests) {
      // Handle both array and object formats
      const requests = Array.isArray(data.components.advancedNetwork.requests) 
        ? data.components.advancedNetwork.requests
        : Object.values(data.components.advancedNetwork.requests);
        
      requests.forEach(request => {
        this.data.requests.set(request.id || `${request.method}_${request.url}_${request.timestamp}`, request);
      });
      this.updateRequestsTable();
    }

    // Process metrics
    if (data.components?.advancedNetwork?.metrics) {
      this.data.metrics = data.components.advancedNetwork.metrics;
      this.updateOverviewCharts();
    }

    // Process insights
    if (data.comprehensive?.intelligentInsights) {
      this.data.insights = data.comprehensive.intelligentInsights;
      this.updateInsights();
    }

    // Process activity
    if (data.components?.advancedNetwork?.recentActivity) {
      this.data.activity = data.components.advancedNetwork.recentActivity;
      this.updateActivityStream();
    }
    
    // Process API data specifically
    if (data.components?.advancedNetwork?.apis) {
      this.data.apis = data.components.advancedNetwork.apis;
    }
    
    // Process top endpoints
    if (data.components?.advancedNetwork?.topEndpoints) {
      this.data.topEndpoints = data.components.advancedNetwork.topEndpoints;
    }

    // Update all UI components
    this.updateAllTabs(data);
  }

  updateQuickStats(stats) {
    // Update the quick stat cards
    const updateElement = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    };

    updateElement('requestCount', stats.requests || 0);
    updateElement('errorCount', stats.errors || 0);
    updateElement('performanceScore', stats.performance ? `${stats.performance}%` : '--');
    
    // Calculate average response time if available
    if (this.data.metrics?.averageResponseTime) {
      updateElement('avgResponseTime', `${Math.round(this.data.metrics.averageResponseTime)}ms`);
    } else {
      updateElement('avgResponseTime', '--');
    }
  }

  updateRequestsTable() {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;

    const requests = Array.from(this.data.requests.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100); // Show latest 100

    if (requests.length === 0) {
      tbody.innerHTML = '<tr class="no-requests"><td colspan="7">No requests captured yet</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map(req => `
      <tr>
        <td><span class="method-badge method-${req.method.toLowerCase()}">${req.method}</span></td>
        <td class="url-cell" title="${req.url}">${this.truncateUrl(req.url)}</td>
        <td><span class="status-badge status-${Math.floor(req.status / 100)}xx">${req.status}</span></td>
        <td class="duration-cell ${req.duration > 2000 ? 'duration-slow' : ''}">${Math.round(req.duration)}ms</td>
        <td class="size-cell">${this.formatBytes(req.size)}</td>
        <td>${req.type || 'xhr'}</td>
        <td><button class="view-btn" onclick="drDOMPopup.viewRequest('${req.id}')">View</button></td>
      </tr>
    `).join('');
  }

  updateOverviewCharts() {
    if (!this.data.metrics) return;

    // Update request type distribution
    const types = this.data.metrics.requestTypes || {};
    const total = Object.values(types).reduce((sum, count) => sum + count, 0);

    ['xhr', 'fetch', 'script', 'image'].forEach(type => {
      const count = types[type] || 0;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      
      const bar = document.querySelector(`.request-type-fill.${type}`);
      if (bar) {
        bar.style.width = `${percentage}%`;
      }
      
      const label = document.querySelector(`.${type}-count`);
      if (label) {
        label.textContent = count;
      }
    });

    // Update status codes
    const statusCodes = this.data.metrics.statusCodes || {};
    ['2xx', '3xx', '4xx', '5xx'].forEach(code => {
      const element = document.querySelector(`.status-${code}`);
      if (element) {
        element.textContent = statusCodes[code] || 0;
      }
    });

    // Update top domains
    this.updateTopDomains();

    // Update data transfer
    const dataSent = document.getElementById('dataSent');
    const dataReceived = document.getElementById('dataReceived');
    if (dataSent) dataSent.textContent = this.formatBytes(this.data.metrics.totalBytesSent || 0);
    if (dataReceived) dataReceived.textContent = this.formatBytes(this.data.metrics.totalBytesReceived || 0);
  }

  updateTopDomains() {
    const container = document.getElementById('topDomains');
    if (!container) return;

    const domains = this.data.metrics?.topDomains || [];
    
    if (domains.length === 0) {
      container.innerHTML = '<div class="domain-placeholder">No requests yet</div>';
      return;
    }

    container.innerHTML = domains.slice(0, 5).map(domain => `
      <div class="domain-item">
        <span class="domain-name">${domain.domain}</span>
        <span class="domain-count">${domain.count} requests</span>
      </div>
    `).join('');
  }

  updateActivityStream() {
    const stream = document.getElementById('activityStream');
    if (!stream || !this.data.activity) return;

    const activities = this.data.activity.slice(-10).reverse();
    
    if (activities.length === 0) {
      stream.innerHTML = '<div class="activity-placeholder">Monitoring for activity...</div>';
      return;
    }

    stream.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <span class="activity-icon">${this.getActivityIcon(activity.type)}</span>
        <div class="activity-text">
          <div class="activity-title">${this.getActivityTitle(activity)}</div>
          <div class="activity-time">${this.getRelativeTime(activity.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }

  updateInsights() {
    const container = document.getElementById('performanceInsights');
    if (!container || !this.data.insights) return;

    const insights = this.data.insights.slice(0, 5);
    
    if (insights.length === 0) {
      container.innerHTML = '<div class="insight-placeholder">Analyzing performance...</div>';
      return;
    }

    container.innerHTML = insights.map(insight => `
      <div class="insight-item insight-severity-${insight.severity}">
        <span class="insight-icon">${this.getInsightIcon(insight.type)}</span>
        <div class="insight-content">
          <div class="insight-title">${insight.title}</div>
          <div class="insight-description">${insight.description}</div>
        </div>
      </div>
    `).join('');
  }

  updateAllTabs(data) {
    // Update Performance tab
    if (data.components?.webVitals) {
      this.updateWebVitals(data.components.webVitals);
    }

    // Update Security tab
    if (data.components?.advancedNetwork?.security) {
      this.updateSecurityAnalysis(data.components.advancedNetwork.security);
    }

    // Update APIs tab - use multiple data sources
    const apiData = {
      endpoints: data.components?.advancedNetwork?.apis || [],
      topEndpoints: data.components?.advancedNetwork?.topEndpoints || [],
      graphqlQueries: data.components?.advancedNetwork?.graphqlQueries || []
    };
    
    // Merge topEndpoints data if available
    if (apiData.topEndpoints.length > 0) {
      this.updateAPIEndpoints(apiData.topEndpoints);
    } else if (apiData.endpoints.length > 0) {
      this.updateAPIAnalysis(apiData.endpoints);
    }
  }

  updateWebVitals(vitals) {
    // Update performance metrics
    const metrics = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'];
    metrics.forEach(metric => {
      if (vitals.vitals?.[metric]) {
        const element = document.getElementById(`${metric.toLowerCase()}Value`);
        if (element) {
          element.textContent = vitals.vitals[metric].value;
          element.className = `metric-${vitals.vitals[metric].rating}`;
        }
      }
    });
  }

  updateSecurityAnalysis(security) {
    // Update security metrics
    document.getElementById('httpsRequests').textContent = security.httpsRequests || 0;
    document.getElementById('httpRequests').textContent = security.insecureRequests || 0;
    document.getElementById('mixedContent').textContent = security.mixedContent || 0;
    document.getElementById('thirdPartyRequests').textContent = security.thirdPartyDomains?.length || 0;
  }

  updateAPIEndpoints(topEndpoints) {
    // Update API metrics based on topEndpoints data
    const uniqueEndpointsEl = document.getElementById('uniqueEndpoints');
    const apiDomainsEl = document.getElementById('apiDomains');
    
    if (uniqueEndpointsEl) uniqueEndpointsEl.textContent = topEndpoints.length;
    
    // Extract unique domains
    const domains = new Set();
    topEndpoints.forEach(endpoint => {
      if (endpoint.requests && endpoint.requests[0]) {
        domains.add(endpoint.requests[0].domain);
      }
    });
    if (apiDomainsEl) apiDomainsEl.textContent = domains.size;
    
    // Update top endpoints list
    const endpointsList = document.getElementById('topEndpointsList');
    if (endpointsList && topEndpoints.length > 0) {
      endpointsList.innerHTML = topEndpoints.slice(0, 10).map(endpoint => `
        <div class="endpoint-item">
          <div class="endpoint-info">
            <span class="endpoint-method">${endpoint.requests?.[0]?.method || 'GET'}</span>
            <span class="endpoint-path">${endpoint.endpoint}</span>
          </div>
          <div class="endpoint-stats">
            <span class="endpoint-calls">${endpoint.count} calls</span>
            ${endpoint.requests?.[0]?.duration ? `<span class="endpoint-time">${Math.round(endpoint.requests[0].duration)}ms avg</span>` : ''}
          </div>
        </div>
      `).join('');
    } else if (endpointsList) {
      endpointsList.innerHTML = '<div class="endpoints-placeholder">No API endpoints discovered yet</div>';
    }
  }

  updateAPIAnalysis(apis) {
    // APIs might be an array directly from the report
    const apiData = Array.isArray(apis) ? { 
      endpoints: apis,
      domains: [...new Set(apis.map(api => api.domain).filter(Boolean))],
      graphqlQueries: apis.filter(api => api.isGraphQL)
    } : apis;
    
    // Update API metrics
    const uniqueEndpointsEl = document.getElementById('uniqueEndpoints');
    const apiDomainsEl = document.getElementById('apiDomains');
    const graphqlQueriesEl = document.getElementById('graphqlQueries');
    
    if (uniqueEndpointsEl) uniqueEndpointsEl.textContent = apiData.endpoints?.length || 0;
    if (apiDomainsEl) apiDomainsEl.textContent = apiData.domains?.length || 0;
    if (graphqlQueriesEl) graphqlQueriesEl.textContent = apiData.graphqlQueries?.length || 0;
    
    // Update top endpoints list
    const endpointsList = document.getElementById('topEndpointsList');
    if (endpointsList && apiData.endpoints && apiData.endpoints.length > 0) {
      endpointsList.innerHTML = apiData.endpoints.slice(0, 10).map(api => `
        <div class="endpoint-item">
          <div class="endpoint-info">
            <span class="endpoint-method">${api.method || 'GET'}</span>
            <span class="endpoint-path">${api.endpoint || api.pathname || api.url || 'Unknown'}</span>
          </div>
          <div class="endpoint-stats">
            <span class="endpoint-calls">${api.count || 1} calls</span>
            ${api.responseTime ? `<span class="endpoint-time">${Math.round(api.responseTime)}ms</span>` : ''}
          </div>
        </div>
      `).join('');
    } else if (endpointsList) {
      endpointsList.innerHTML = '<div class="endpoints-placeholder">No API endpoints discovered yet</div>';
    }
    
    // Update API schemas (if available)
    const schemasList = document.getElementById('apiSchemasList');
    if (schemasList && apiData.endpoints) {
      const schemasAvailable = apiData.endpoints.filter(api => api.responseSchema).slice(0, 5);
      if (schemasAvailable.length > 0) {
        schemasList.innerHTML = schemasAvailable.map(api => `
          <div class="schema-item">
            <div class="schema-endpoint">${api.method || 'GET'} ${api.endpoint || api.pathname}</div>
            <pre class="schema-preview">${JSON.stringify(api.responseSchema, null, 2).substring(0, 200)}...</pre>
          </div>
        `).join('');
      } else {
        schemasList.innerHTML = '<div class="schemas-placeholder">No API schemas discovered yet</div>';
      }
    }
  }

  // Utility methods
  truncateUrl(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname + urlObj.search;
      return path.length > 50 ? path.substring(0, 50) + '...' : path;
    } catch {
      return url.length > 50 ? url.substring(0, 50) + '...' : url;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getActivityIcon(type) {
    const icons = {
      request: '🌐',
      error: '❌',
      warning: '⚠️',
      performance: '⚡',
      security: '🔒'
    };
    return icons[type] || '📝';
  }

  getActivityTitle(activity) {
    if (activity.url) {
      return `${activity.method || 'GET'} ${this.truncateUrl(activity.url)}`;
    }
    return activity.message || 'Activity detected';
  }

  getRelativeTime(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  }

  getInsightIcon(type) {
    const icons = {
      performance: '⚡',
      error: '🐛',
      security: '🔒',
      api: '🔌',
      web_vitals: '📊'
    };
    return icons[type] || '💡';
  }

  showNotification(icon, message, type) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `${icon} ${message}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  async exportReport() {
    try {
      const data = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'exportReport'
      });
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dr-dom-report-${Date.now()}.json`;
      a.click();
      
      this.showNotification('📄', 'Report exported successfully', 'success');
    } catch (error) {
      this.showNotification('❌', 'Failed to export report', 'error');
    }
  }

  async takeScreenshot() {
    try {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `dr-dom-screenshot-${Date.now()}.png`;
        a.click();
        
        this.showNotification('📸', 'Screenshot saved', 'success');
      });
    } catch (error) {
      this.showNotification('❌', 'Failed to take screenshot', 'error');
    }
  }

  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  viewRequest(requestId) {
    const request = this.data.requests.get(requestId);
    if (request) {
      // Show request details in modal
      console.log('Request details:', request);
      // TODO: Implement modal view
    }
  }

  filterRequests(searchTerm) {
    // TODO: Implement request filtering
    console.log('Filtering requests:', searchTerm);
  }

  applyFilter(filterType) {
    // TODO: Implement filter types
    console.log('Applying filter:', filterType);
  }
}

// Initialize popup
const drDOMPopup = new DrDOMAlwaysOnPopup();

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);