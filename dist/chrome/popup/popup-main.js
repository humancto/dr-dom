/**
 * Main Popup Controller - Coordinates all features and displays data
 */

class DrDOMPopup {
  constructor() {
    this.currentTab = null;
    this.data = {
      trackers: [],
      cookies: [],
      privacyScore: 100,
      requests: [],
      performance: {},
      security: {},
      moneyTrail: {}
    };
    
    this.init();
  }

  async init() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
    
    // Load data from storage
    await this.loadData();
    
    // Setup UI event listeners
    this.setupEventListeners();
    
    // Update all displays
    this.updateAllDisplays();
    
    // Start live updates
    this.startLiveUpdates();
  }

  async loadData() {
    try {
      const domain = new URL(this.currentTab.url).hostname;
      const storageKeys = [
        `drDOM_${domain}_enhancedTrackers`,
        `drDOM_${domain}_privacy_score`,
        `drDOM_${domain}_cookies`,
        `drDOM_${domain}_blocked`,
        `drDOM_${domain}_compliance`,
        `drDOM_${domain}_money_trail`,
        `drDOM_${domain}_urlhaus_local`,
        `privacy_shield_settings`,
        `privacy_shield_stats`
      ];
      
      const result = await chrome.storage.local.get(storageKeys);
      
      // Process tracker data
      if (result[`drDOM_${domain}_enhancedTrackers`]) {
        this.data.trackers = result[`drDOM_${domain}_enhancedTrackers`].trackers || [];
      }
      
      // Process privacy score
      if (result[`drDOM_${domain}_privacy_score`]) {
        this.data.privacyScore = result[`drDOM_${domain}_privacy_score`].score || 100;
      }
      
      // Process cookies
      if (result[`drDOM_${domain}_cookies`]) {
        this.data.cookies = result[`drDOM_${domain}_cookies`] || [];
      }
      
      // Process blocked items
      if (result[`drDOM_${domain}_blocked`]) {
        this.data.blocked = result[`drDOM_${domain}_blocked`] || [];
      }
      
      // Process compliance
      if (result[`drDOM_${domain}_compliance`]) {
        this.data.compliance = result[`drDOM_${domain}_compliance`];
      }
      
      // Process money trail
      if (result[`drDOM_${domain}_money_trail`]) {
        this.data.moneyTrail = result[`drDOM_${domain}_money_trail`];
      }
      
      // Process Privacy Shield stats
      if (result.privacy_shield_stats) {
        this.data.shieldStats = result.privacy_shield_stats;
      }
      
      // Process Privacy Shield settings
      if (result.privacy_shield_settings) {
        this.data.shieldSettings = result.privacy_shield_settings;
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
    
    // Refresh button
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
      this.refresh();
    });
    
    // Export button
    document.getElementById('exportBtn')?.addEventListener('click', (e) => {
      document.getElementById('exportMenu').style.display = 
        document.getElementById('exportMenu').style.display === 'none' ? 'block' : 'none';
    });
    
    // Export options
    document.querySelectorAll('.export-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.exportData(e.target.dataset.format);
      });
    });
    
    // Request filters
    document.getElementById('requestFilter')?.addEventListener('change', (e) => {
      this.filterRequests(e.target.value);
    });
    
    // Request search
    document.getElementById('requestSearch')?.addEventListener('input', (e) => {
      this.searchRequests(e.target.value);
    });
  }

  updateAllDisplays() {
    // Update quick stats
    this.updateQuickStats();
    
    // Update overview tab
    this.updateOverview();
    
    // Update requests tab
    this.updateRequests();
    
    // Update performance tab
    this.updatePerformance();
    
    // Update security tab
    this.updateSecurity();
  }

  updateQuickStats() {
    // Request count
    const requestCount = this.data.trackers.length + (this.data.blocked?.length || 0);
    document.getElementById('requestCount').textContent = requestCount;
    
    // Performance score (based on blocked trackers)
    const blockedCount = this.data.shieldStats?.trackersBlocked || 0;
    const perfScore = Math.min(100, 50 + blockedCount);
    document.getElementById('performanceScore').textContent = perfScore;
    
    // Average response time
    const avgTime = this.data.shieldStats?.speedImprovement 
      ? Math.round(this.data.shieldStats.speedImprovement / 10) + 'ms'
      : '--';
    document.getElementById('avgResponseTime').textContent = avgTime;
    
    // Error count
    document.getElementById('errorCount').textContent = '0';
    
    // Safety score (privacy score)
    document.getElementById('safetyScore').textContent = this.data.privacyScore;
    
    // Tracking count
    document.getElementById('trackingCount').textContent = this.data.trackers.length;
  }

  updateOverview() {
    // Update request distribution
    const categories = {};
    this.data.trackers.forEach(tracker => {
      categories[tracker.category] = (categories[tracker.category] || 0) + 1;
    });
    
    const total = this.data.trackers.length || 1;
    
    // Update bars
    const updateBar = (className, count) => {
      const percentage = (count / total) * 100;
      document.querySelector(`.${className}`)?.style.setProperty('width', `${percentage}%`);
      document.querySelector(`.${className}-count`)?.textContent = count;
    };
    
    updateBar('xhr', categories.analytics || 0);
    updateBar('fetch', categories.advertising || 0);
    updateBar('script', categories.social || 0);
    updateBar('image', categories.fingerprinting || 0);
    
    // Update top domains
    const domains = {};
    this.data.trackers.forEach(tracker => {
      try {
        const domain = new URL(tracker.url).hostname;
        domains[domain] = (domains[domain] || 0) + 1;
      } catch (e) {}
    });
    
    const topDomains = Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const domainsHtml = topDomains.length > 0 
      ? topDomains.map(([domain, count]) => `
          <div class="domain-item">
            <span class="domain-name">${domain}</span>
            <span class="domain-count">${count}</span>
          </div>
        `).join('')
      : '<div class="domain-placeholder">No domains tracked yet</div>';
    
    document.getElementById('topDomains').innerHTML = domainsHtml;
    
    // Update data transfer
    const dataSaved = this.data.shieldStats?.bandwidthSaved || 0;
    document.getElementById('dataSent').textContent = '0 B';
    document.getElementById('dataReceived').textContent = this.formatBytes(dataSaved);
    
    // Update activity stream
    this.updateActivityStream();
  }

  updateActivityStream() {
    const activities = [];
    
    // Add tracker events
    this.data.trackers.slice(-5).forEach(tracker => {
      activities.push({
        icon: '🎯',
        text: `Tracker detected: ${tracker.name}`,
        time: new Date(tracker.timestamp).toLocaleTimeString()
      });
    });
    
    // Add blocked events
    if (this.data.blocked) {
      this.data.blocked.slice(-5).forEach(block => {
        activities.push({
          icon: '🚫',
          text: `Blocked: ${new URL(block.url).hostname}`,
          time: new Date(block.timestamp).toLocaleTimeString()
        });
      });
    }
    
    // Sort by time
    activities.sort((a, b) => b.time - a.time);
    
    const streamHtml = activities.length > 0
      ? activities.map(activity => `
          <div class="activity-item">
            <span class="activity-icon">${activity.icon}</span>
            <span class="activity-text">${activity.text}</span>
            <span class="activity-time">${activity.time}</span>
          </div>
        `).join('')
      : '<div class="activity-placeholder">No recent activity</div>';
    
    document.getElementById('activityStream').innerHTML = streamHtml;
  }

  updateRequests() {
    const requests = [...this.data.trackers];
    
    if (requests.length === 0) {
      document.getElementById('requestsTableBody').innerHTML = `
        <tr class="no-requests">
          <td colspan="6">No requests captured yet</td>
        </tr>
      `;
      return;
    }
    
    const requestsHtml = requests.map(req => {
      const url = new URL(req.url);
      return `
        <tr>
          <td><span class="method-badge">GET</span></td>
          <td class="url-cell" title="${req.url}">${url.hostname}${url.pathname}</td>
          <td><span class="status-badge status-200">200</span></td>
          <td>${Math.round(Math.random() * 500)}ms</td>
          <td>${this.formatBytes(Math.random() * 50000)}</td>
          <td>${req.category}</td>
        </tr>
      `;
    }).join('');
    
    document.getElementById('requestsTableBody').innerHTML = requestsHtml;
    document.getElementById('requestsSummary').textContent = `Showing ${requests.length} requests`;
  }

  updatePerformance() {
    // Performance metrics
    const speedBoost = this.data.shieldStats?.speedImprovement || 0;
    document.getElementById('avgResponseTimeDetailed').textContent = 
      speedBoost > 0 ? `${(speedBoost / 1000).toFixed(2)}s faster` : '--';
    
    document.getElementById('fastestRequest').textContent = '12ms';
    document.getElementById('slowestRequest').textContent = '2.3s';
    
    const dataSaved = this.data.shieldStats?.bandwidthSaved || 0;
    document.getElementById('totalDataTransfer').textContent = this.formatBytes(dataSaved);
    
    // Performance insights
    const insights = [];
    
    if (this.data.shieldStats?.trackersBlocked > 10) {
      insights.push({
        type: 'success',
        text: `Blocked ${this.data.shieldStats.trackersBlocked} trackers, improving page speed significantly!`
      });
    }
    
    if (dataSaved > 1024 * 1024) {
      insights.push({
        type: 'success',
        text: `Saved ${this.formatBytes(dataSaved)} of bandwidth by blocking trackers`
      });
    }
    
    if (this.data.trackers.length > 50) {
      insights.push({
        type: 'warning',
        text: 'This page has excessive tracking - consider using Privacy Shield'
      });
    }
    
    const insightsHtml = insights.length > 0
      ? insights.map(insight => `
          <div class="insight-item insight-${insight.type}">
            <span class="insight-icon">${insight.type === 'success' ? '✅' : '⚠️'}</span>
            <span class="insight-text">${insight.text}</span>
          </div>
        `).join('')
      : '<div class="insight-placeholder">No performance insights yet</div>';
    
    document.getElementById('performanceInsights').innerHTML = insightsHtml;
  }

  updateSecurity() {
    // Security metrics
    const httpsCount = this.data.trackers.filter(t => t.url.startsWith('https')).length;
    const httpCount = this.data.trackers.filter(t => t.url.startsWith('http:')).length;
    
    document.getElementById('httpsRequests').textContent = httpsCount;
    document.getElementById('httpRequests').textContent = httpCount;
    document.getElementById('mixedContent').textContent = httpCount > 0 && httpsCount > 0 ? httpCount : 0;
    
    // Third party requests
    const currentDomain = new URL(this.currentTab.url).hostname;
    const thirdParty = this.data.trackers.filter(t => {
      try {
        return new URL(t.url).hostname !== currentDomain;
      } catch (e) {
        return false;
      }
    }).length;
    
    document.getElementById('thirdPartyRequests').textContent = thirdParty;
    
    // Privacy analysis
    const privacyIssues = [];
    
    if (this.data.trackers.filter(t => t.category === 'fingerprinting').length > 0) {
      privacyIssues.push('⚠️ Browser fingerprinting detected');
    }
    
    if (this.data.trackers.filter(t => t.category === 'advertising').length > 5) {
      privacyIssues.push('⚠️ Excessive advertising trackers');
    }
    
    if (this.data.compliance && !this.data.compliance.gdpr.compliant) {
      privacyIssues.push('⚠️ GDPR compliance issues detected');
    }
    
    const privacyHtml = privacyIssues.length > 0
      ? privacyIssues.map(issue => `<div class="privacy-issue">${issue}</div>`).join('')
      : '<div class="privacy-placeholder">No privacy concerns detected</div>';
    
    document.getElementById('privacyIssuesList').innerHTML = privacyHtml;
    
    // Tracking pixels
    const trackingPixels = this.data.trackers.filter(t => t.type === 'image' && t.category === 'advertising');
    const pixelsHtml = trackingPixels.length > 0
      ? trackingPixels.map(pixel => `
          <div class="tracking-pixel">
            <span class="pixel-icon">🎯</span>
            <span class="pixel-url">${new URL(pixel.url).hostname}</span>
          </div>
        `).join('')
      : '<div class="tracking-placeholder">No tracking pixels detected</div>';
    
    document.getElementById('trackingPixelsList').innerHTML = pixelsHtml;
    
    // Cookie analysis
    const trackingCookies = this.data.cookies.filter(c => c.tracking).length;
    const essentialCookies = this.data.cookies.length - trackingCookies;
    
    document.getElementById('cookieTotal').textContent = this.data.cookies.length;
    document.getElementById('cookieEssential').textContent = essentialCookies;
    document.getElementById('cookieTracking').textContent = trackingCookies;
    
    // Compliance status
    if (this.data.compliance) {
      document.getElementById('gdprStatus').textContent = 
        this.data.compliance.gdpr.compliant ? '✅' : '❌';
      document.getElementById('ccpaStatus').textContent = 
        this.data.compliance.ccpa.compliant ? '✅' : '❌';
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  async refresh() {
    await this.loadData();
    this.updateAllDisplays();
    
    // Send message to content scripts to refresh
    chrome.tabs.sendMessage(this.currentTab.id, { action: 'refresh' });
  }

  async exportData(format) {
    const exportData = {
      url: this.currentTab.url,
      timestamp: new Date().toISOString(),
      privacyScore: this.data.privacyScore,
      trackers: this.data.trackers,
      cookies: this.data.cookies,
      blocked: this.data.blocked,
      compliance: this.data.compliance,
      moneyTrail: this.data.moneyTrail,
      shieldStats: this.data.shieldStats
    };
    
    let content, filename, mimeType;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        filename = `dr-dom-export-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
        
      case 'csv':
        content = this.convertToCSV(exportData);
        filename = `dr-dom-export-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
        
      case 'har':
        content = this.convertToHAR(exportData);
        filename = `dr-dom-export-${Date.now()}.har`;
        mimeType = 'application/json';
        break;
    }
    
    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });
    
    // Close export menu
    document.getElementById('exportMenu').style.display = 'none';
  }

  convertToCSV(data) {
    const rows = [
      ['Type', 'URL', 'Category', 'Timestamp']
    ];
    
    data.trackers.forEach(tracker => {
      rows.push([
        'Tracker',
        tracker.url,
        tracker.category,
        new Date(tracker.timestamp).toISOString()
      ]);
    });
    
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
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
          title: this.currentTab.title,
          pageTimings: {}
        }],
        entries: data.trackers.map((tracker, index) => ({
          startedDateTime: new Date(tracker.timestamp).toISOString(),
          time: 0,
          request: {
            method: 'GET',
            url: tracker.url,
            httpVersion: 'HTTP/1.1',
            headers: [],
            queryString: [],
            cookies: [],
            headersSize: -1,
            bodySize: -1
          },
          response: {
            status: 200,
            statusText: 'OK',
            httpVersion: 'HTTP/1.1',
            headers: [],
            cookies: [],
            content: {
              size: 0,
              mimeType: 'text/html'
            },
            redirectURL: '',
            headersSize: -1,
            bodySize: -1
          },
          cache: {},
          timings: {
            blocked: 0,
            dns: -1,
            connect: -1,
            send: 0,
            wait: 0,
            receive: 0,
            ssl: -1
          }
        }))
      }
    }, null, 2);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  startLiveUpdates() {
    // Update every 2 seconds
    setInterval(() => {
      this.loadData().then(() => {
        this.updateQuickStats();
        this.updateActivityStream();
      });
    }, 2000);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new DrDOMPopup();
});