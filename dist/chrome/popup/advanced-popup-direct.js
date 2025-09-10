/**
 * Dr. DOM Advanced Popup - Direct Storage Reader
 * Directly reads and displays data from chrome.storage
 */

console.log('🚀 Dr. DOM Direct Popup Loading...');

class DrDOMDirectPopup {
  constructor() {
    this.currentTab = null;
    this.init();
  }

  async init() {
    console.log('📍 Initializing popup...');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
    
    if (!tab || tab.url.startsWith('chrome://')) {
      console.log('❌ Chrome page detected');
      this.showMessage('Navigate to a website to start monitoring');
      return;
    }
    
    console.log('📍 Current tab:', tab.url);
    
    // Set up event listeners
    this.setupEventListeners();
    this.setupTabNavigation();
    
    // Start polling for data
    this.loadData();
    setInterval(() => this.loadData(), 1000);
  }

  async loadData() {
    if (!this.currentTab) return;
    
    const domain = new URL(this.currentTab.url).hostname;
    console.log('🔍 Loading data for domain:', domain);
    
    // Get ALL storage to see what's available
    chrome.storage.local.get(null, (allData) => {
      console.log('📦 All storage keys:', Object.keys(allData));
      
      // Filter for our domain
      const domainKeys = Object.keys(allData).filter(key => key.includes(domain));
      console.log('🎯 Domain-specific keys:', domainKeys);
      
      // Get specific data
      const trackerKey = `drDOM_${domain}_enhancedTrackers`;
      const trackerData = allData[trackerKey];
      
      if (trackerData) {
        console.log('✅ Found tracker data:', trackerData);
        this.displayData(trackerData);
      } else {
        console.log('❌ No tracker data found for key:', trackerKey);
        this.showMessage('No data yet. Refresh the page to start tracking.');
      }
    });
  }

  displayData(data) {
    console.log('📊 Displaying data:', data);
    
    // Update status
    const statusEl = document.getElementById('statusIndicator');
    if (statusEl) {
      statusEl.innerHTML = '<div class="status-dot active"></div><span>🔴 Live Monitoring</span>';
    }
    
    // Update stats
    const trackers = data.trackers || [];
    const byCategory = data.byCategory || {};
    
    // Update counts
    document.getElementById('requestCount').textContent = data.totalRequests || 0;
    document.getElementById('trackingCount').textContent = trackers.length;
    document.getElementById('errorCount').textContent = '0';
    document.getElementById('safetyScore').textContent = Math.max(0, 100 - (trackers.length * 5));
    document.getElementById('performanceScore').textContent = '80';
    document.getElementById('avgResponseTime').textContent = '--';
    
    // Update request distribution
    this.updateRequestTypes(trackers);
    
    // Update requests table
    this.updateRequestsTable(trackers);
    
    // Update activity stream
    this.updateActivityStream(trackers);
    
    // Update top domains
    this.updateTopDomains(trackers);
    
    // Update security section
    this.updateSecurity(trackers, byCategory);
  }

  updateRequestTypes(trackers) {
    const types = { xhr: 0, fetch: 0, script: 0, image: 0 };
    
    trackers.forEach(t => {
      if (t.type === 'xmlhttprequest' || t.type === 'xhr') types.xhr++;
      else if (t.type === 'fetch') types.fetch++;
      else if (t.type === 'script') types.script++;
      else if (t.type === 'image' || t.type === 'img') types.image++;
    });
    
    const total = Math.max(1, trackers.length);
    
    // Update display
    document.querySelector('.xhr-count').textContent = types.xhr;
    document.querySelector('.fetch-count').textContent = types.fetch;
    document.querySelector('.script-count').textContent = types.script;
    document.querySelector('.image-count').textContent = types.image;
    
    // Update bars
    document.querySelector('.request-type-fill.xhr').style.width = `${(types.xhr / total) * 100}%`;
    document.querySelector('.request-type-fill.fetch').style.width = `${(types.fetch / total) * 100}%`;
    document.querySelector('.request-type-fill.script').style.width = `${(types.script / total) * 100}%`;
    document.querySelector('.request-type-fill.image').style.width = `${(types.image / total) * 100}%`;
  }

  updateRequestsTable(trackers) {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    
    const summary = document.getElementById('requestsSummary');
    if (summary) {
      summary.textContent = `Showing ${trackers.length} trackers`;
    }
    
    if (trackers.length === 0) {
      tbody.innerHTML = '<tr class="no-requests"><td colspan="6">No trackers detected yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = trackers.slice(0, 50).map(tracker => `
      <tr>
        <td><span class="method-badge">${tracker.method || 'GET'}</span></td>
        <td class="url-cell" title="${tracker.url}">
          <strong>${tracker.domain}</strong><br>
          <small>${tracker.url.substring(0, 40)}...</small>
        </td>
        <td><span class="status-badge status-${tracker.blocked ? 'blocked' : 'success'}">
          ${tracker.blocked ? 'Blocked' : 'Tracked'}
        </span></td>
        <td>${tracker.category || '--'}</td>
        <td><span class="severity-${tracker.severity}">${tracker.severity || '--'}</span></td>
        <td>${tracker.type || '--'}</td>
      </tr>
    `).join('');
  }

  updateActivityStream(trackers) {
    const container = document.getElementById('activityStream');
    if (!container) return;
    
    if (trackers.length === 0) {
      container.innerHTML = '<div class="activity-placeholder">No activity yet...</div>';
      return;
    }
    
    container.innerHTML = trackers.slice(0, 10).map(tracker => `
      <div class="activity-item">
        <span class="activity-time">${new Date().toLocaleTimeString()}</span>
        <span class="activity-status">🎯</span>
        <span class="activity-method">${tracker.category}</span>
        <span class="activity-url">${tracker.domain}</span>
      </div>
    `).join('');
  }

  updateTopDomains(trackers) {
    const domains = {};
    trackers.forEach(t => {
      domains[t.domain] = (domains[t.domain] || 0) + 1;
    });
    
    const sorted = Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const container = document.getElementById('topDomains');
    if (container) {
      if (sorted.length === 0) {
        container.innerHTML = '<div class="domain-placeholder">No domains yet</div>';
      } else {
        container.innerHTML = sorted.map(([domain, count]) => `
          <div class="domain-item">
            <span class="domain-name">${domain}</span>
            <span class="domain-count">${count} requests</span>
          </div>
        `).join('');
      }
    }
  }

  updateSecurity(trackers, byCategory) {
    // Update counts
    document.getElementById('httpsRequests').textContent = trackers.filter(t => t.url.startsWith('https')).length;
    document.getElementById('httpRequests').textContent = trackers.filter(t => t.url.startsWith('http:')).length;
    document.getElementById('thirdPartyRequests').textContent = trackers.length;
    
    // Update tracking categories
    const trackingList = document.getElementById('trackingPixelsList');
    if (trackingList) {
      if (Object.keys(byCategory).length === 0) {
        trackingList.innerHTML = '<div class="tracking-placeholder">No trackers detected</div>';
      } else {
        trackingList.innerHTML = Object.entries(byCategory).map(([category, items]) => `
          <div class="tracking-item">
            <span class="tracking-platform">🎯 ${category}</span>
            <span class="tracking-count">${items.length} tracker${items.length > 1 ? 's' : ''}</span>
          </div>
        `).join('');
      }
    }
  }

  showMessage(msg) {
    // Update all placeholder areas
    ['activityStream', 'requestsTableBody', 'topDomains', 'trackingPixelsList'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `<div class="placeholder">${msg}</div>`;
      }
    });
  }

  setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn')?.addEventListener('click', async () => {
      console.log('🔄 Refresh clicked');
      chrome.tabs.reload(this.currentTab.id);
      setTimeout(() => this.loadData(), 2000);
    });

    // Export menu
    const exportBtn = document.getElementById('exportBtn');
    const exportMenu = document.getElementById('exportMenu');
    
    if (exportBtn && exportMenu) {
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.style.display = exportMenu.style.display === 'none' ? 'block' : 'none';
      });
      
      document.addEventListener('click', () => {
        exportMenu.style.display = 'none';
      });
    }
  }

  setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active states
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show panel
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(`${btn.dataset.tab}-tab`);
        if (panel) panel.classList.add('active');
      });
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing popup...');
    window.drDOMPopup = new DrDOMDirectPopup();
  });
} else {
  console.log('📄 DOM already loaded, initializing popup...');
  window.drDOMPopup = new DrDOMDirectPopup();
}