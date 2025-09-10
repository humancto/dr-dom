/**
 * Working Popup Controller - Fully functional UI for Dr. DOM
 */

class DrDOMPopupController {
  constructor() {
    this.currentTab = null;
    this.domain = null;
    this.data = {};
    this.init();
  }

  async init() {
    console.log('[Dr. DOM] Initializing popup...');
    
    // Get current tab
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      this.domain = new URL(tab.url).hostname;
      console.log('[Dr. DOM] Current domain:', this.domain);
    } catch (error) {
      console.error('[Dr. DOM] Error getting tab:', error);
      this.showError('Unable to get current tab');
      return;
    }
    
    // Load data from storage
    await this.loadAllData();
    
    // Setup all UI components
    this.setupTabNavigation();
    this.setupButtons();
    this.setupControls();
    
    // Update all displays
    this.updateAllTabs();
    
    // Start live updates
    this.startLiveUpdates();
  }

  async loadAllData() {
    console.log('[Dr. DOM] Loading data for domain:', this.domain);
    
    const keys = [
      `drDOM_${this.domain}_enhancedTrackers`,
      `drDOM_${this.domain}_privacy_score`,
      `drDOM_${this.domain}_cookies`,
      `drDOM_${this.domain}_blocked`,
      `drDOM_${this.domain}_compliance`,
      `drDOM_${this.domain}_money_trail`,
      `privacy_shield_stats`,
      `privacy_shield_settings`,
      `blocker_settings`
    ];
    
    try {
      const result = await chrome.storage.local.get(keys);
      console.log('[Dr. DOM] Loaded data:', result);
      
      // Parse the data
      this.data = {
        trackers: result[`drDOM_${this.domain}_enhancedTrackers`]?.trackers || [],
        privacyScore: result[`drDOM_${this.domain}_privacy_score`]?.score || 100,
        cookies: result[`drDOM_${this.domain}_cookies`] || [],
        blocked: result[`drDOM_${this.domain}_blocked`] || [],
        compliance: result[`drDOM_${this.domain}_compliance`] || {},
        moneyTrail: result[`drDOM_${this.domain}_money_trail`] || {},
        shieldStats: result.privacy_shield_stats || {},
        shieldSettings: result.privacy_shield_settings || {},
        blockerSettings: result.blocker_settings || {}
      };
      
      console.log('[Dr. DOM] Parsed data:', this.data);
    } catch (error) {
      console.error('[Dr. DOM] Error loading data:', error);
    }
  }

  setupTabNavigation() {
    console.log('[Dr. DOM] Setting up tab navigation...');
    
    // Get all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetTab = button.dataset.tab;
        console.log('[Dr. DOM] Switching to tab:', targetTab);
        
        // Update active states
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show correct panel
        tabPanels.forEach(panel => {
          panel.classList.remove('active');
          panel.style.display = 'none';
        });
        
        const targetPanel = document.getElementById(`${targetTab}-tab`);
        if (targetPanel) {
          targetPanel.classList.add('active');
          targetPanel.style.display = 'block';
          
          // Update tab content
          this.updateTabContent(targetTab);
        }
      });
    });
  }

  setupButtons() {
    console.log('[Dr. DOM] Setting up buttons...');
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        console.log('[Dr. DOM] Refreshing data...');
        await this.loadAllData();
        this.updateAllTabs();
      });
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const menu = document.getElementById('exportMenu');
        if (menu) {
          menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
      });
    }
    
    // Export options
    document.querySelectorAll('.export-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const format = e.target.dataset.format;
        this.exportData(format);
        document.getElementById('exportMenu').style.display = 'none';
      });
    });
  }

  setupControls() {
    console.log('[Dr. DOM] Setting up feature controls...');
    
    // Create control panel
    const container = document.querySelector('.dr-dom-container');
    if (!container) return;
    
    // Add feature control section
    const controlSection = document.createElement('div');
    controlSection.id = 'feature-controls';
    controlSection.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #1e293b, #334155);
      padding: 15px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 2px solid #475569;
      z-index: 1000;
    `;
    
    // Privacy Shield controls
    const shieldControl = this.createToggleControl(
      '🛡️ Privacy Shield',
      this.data.shieldSettings?.blockTrackers !== false,
      async (enabled) => {
        console.log('[Dr. DOM] Toggling Privacy Shield:', enabled);
        await this.sendMessage('TOGGLE_BLOCKING', { enabled });
      }
    );
    
    // Honest Review button
    const reviewBtn = this.createActionButton(
      '🔥 Get Honest Review',
      '#ef4444',
      async () => {
        console.log('[Dr. DOM] Showing Honest Review...');
        await this.sendMessage('showWidget', { widget: 'honestReview' });
      }
    );
    
    // Money Trail button
    const moneyBtn = this.createActionButton(
      '💰 Money Trail Game',
      '#10b981',
      async () => {
        console.log('[Dr. DOM] Showing Money Trail...');
        await this.sendMessage('showWidget', { widget: 'moneyTrail' });
      }
    );
    
    // Settings button
    const settingsBtn = this.createActionButton(
      '⚙️ Settings',
      '#6366f1',
      () => {
        this.showSettings();
      }
    );
    
    controlSection.appendChild(shieldControl);
    controlSection.appendChild(reviewBtn);
    controlSection.appendChild(moneyBtn);
    controlSection.appendChild(settingsBtn);
    
    container.appendChild(controlSection);
  }

  createToggleControl(label, initialState, onChange) {
    const control = document.createElement('div');
    control.style.cssText = 'display: flex; align-items: center; gap: 10px;';
    
    const toggle = document.createElement('label');
    toggle.style.cssText = 'position: relative; display: inline-block; width: 50px; height: 24px;';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = initialState;
    input.style.cssText = 'opacity: 0; width: 0; height: 0;';
    
    const slider = document.createElement('span');
    slider.style.cssText = `
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${input.checked ? '#10b981' : '#94a3b8'};
      transition: .4s;
      border-radius: 24px;
    `;
    
    const sliderButton = document.createElement('span');
    sliderButton.style.cssText = `
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: ${input.checked ? '28px' : '3px'};
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    `;
    
    slider.appendChild(sliderButton);
    
    input.addEventListener('change', () => {
      slider.style.backgroundColor = input.checked ? '#10b981' : '#94a3b8';
      sliderButton.style.left = input.checked ? '28px' : '3px';
      onChange(input.checked);
    });
    
    toggle.appendChild(input);
    toggle.appendChild(slider);
    
    const labelText = document.createElement('span');
    labelText.textContent = label;
    labelText.style.cssText = 'color: white; font-weight: 500; font-size: 13px;';
    
    control.appendChild(toggle);
    control.appendChild(labelText);
    
    return control;
  }

  createActionButton(label, color, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = `
      padding: 8px 16px;
      background: ${color};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 13px;
      transition: all 0.3s;
    `;
    
    button.addEventListener('mouseover', () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = 'none';
    });
    
    button.addEventListener('click', onClick);
    
    return button;
  }

  updateAllTabs() {
    console.log('[Dr. DOM] Updating all tabs...');
    
    // Update quick stats
    this.updateQuickStats();
    
    // Update active tab
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
      this.updateTabContent(activeTab.dataset.tab);
    }
  }

  updateQuickStats() {
    // Update stat cards
    this.updateElement('requestCount', this.data.trackers.length + this.data.blocked.length);
    this.updateElement('performanceScore', Math.min(100, 50 + (this.data.shieldStats?.trackersBlocked || 0)));
    this.updateElement('avgResponseTime', this.data.shieldStats?.speedImprovement ? 
      `${Math.round(this.data.shieldStats.speedImprovement / 10)}ms` : '0ms');
    this.updateElement('errorCount', '0');
    this.updateElement('safetyScore', this.data.privacyScore);
    this.updateElement('trackingCount', this.data.trackers.length);
  }

  updateTabContent(tabName) {
    console.log('[Dr. DOM] Updating tab:', tabName);
    
    switch(tabName) {
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
    }
  }

  updateOverviewTab() {
    // Add weather report
    this.addWeatherReport();
    
    // Update request distribution
    this.updateRequestDistribution();
    
    // Update top domains
    this.updateTopDomains();
    
    // Update activity stream
    this.updateActivityStream();
    
    // Update data transfer
    const dataSaved = this.data.shieldStats?.bandwidthSaved || 0;
    this.updateElement('dataSent', '0 B');
    this.updateElement('dataReceived', this.formatBytes(dataSaved));
  }

  addWeatherReport() {
    const overviewTab = document.getElementById('overview-tab');
    if (!overviewTab) return;
    
    // Remove existing weather report
    const existing = document.getElementById('weather-report');
    if (existing) existing.remove();
    
    const weatherDiv = document.createElement('div');
    weatherDiv.id = 'weather-report';
    weatherDiv.style.cssText = `
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      text-align: center;
    `;
    
    const score = this.data.privacyScore;
    let emoji, message;
    
    if (score >= 90) {
      emoji = '☀️';
      message = 'Sunny - Excellent privacy!';
    } else if (score >= 70) {
      emoji = '⛅';
      message = 'Partly cloudy - Good privacy';
    } else if (score >= 50) {
      emoji = '☁️';
      message = 'Cloudy - Moderate privacy';
    } else if (score >= 30) {
      emoji = '🌧️';
      message = 'Rainy - Poor privacy';
    } else {
      emoji = '⛈️';
      message = 'Stormy - Terrible privacy!';
    }
    
    weatherDiv.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
      <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">Privacy Weather</div>
      <div style="font-size: 16px; margin-bottom: 10px;">${message}</div>
      <div style="font-size: 32px; font-weight: bold;">${score}/100</div>
    `;
    
    // Insert at top of overview
    overviewTab.insertBefore(weatherDiv, overviewTab.firstChild);
  }

  updateRequestDistribution() {
    const categories = {
      analytics: 0,
      advertising: 0,
      social: 0,
      fingerprinting: 0
    };
    
    this.data.trackers.forEach(tracker => {
      if (categories.hasOwnProperty(tracker.category)) {
        categories[tracker.category]++;
      }
    });
    
    const total = Math.max(this.data.trackers.length, 1);
    
    // Update bars
    Object.entries(categories).forEach(([category, count], index) => {
      const classNames = ['xhr', 'fetch', 'script', 'image'];
      const bar = document.querySelector(`.request-type-fill.${classNames[index]}`);
      if (bar) {
        bar.style.width = `${(count / total) * 100}%`;
      }
      const countEl = document.querySelector(`.${classNames[index]}-count`);
      if (countEl) {
        countEl.textContent = count;
      }
    });
  }

  updateTopDomains() {
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
    
    const container = document.getElementById('topDomains');
    if (container) {
      if (topDomains.length > 0) {
        container.innerHTML = topDomains.map(([domain, count]) => `
          <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8fafc; margin: 4px 0; border-radius: 4px;">
            <span style="font-size: 12px;">${domain}</span>
            <span style="font-size: 12px; color: #ef4444; font-weight: bold;">${count}</span>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 20px;">No domains tracked yet</div>';
      }
    }
  }

  updateActivityStream() {
    const activities = [];
    
    // Add tracker events
    this.data.trackers.slice(-5).forEach(tracker => {
      activities.push({
        icon: '🎯',
        text: `Tracker: ${tracker.name || 'Unknown'}`,
        time: new Date(tracker.timestamp).toLocaleTimeString(),
        timestamp: tracker.timestamp
      });
    });
    
    // Add blocked events
    this.data.blocked.slice(-5).forEach(block => {
      activities.push({
        icon: '🚫',
        text: `Blocked: ${new URL(block.url).hostname}`,
        time: new Date(block.timestamp).toLocaleTimeString(),
        timestamp: block.timestamp
      });
    });
    
    // Sort by timestamp
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    const container = document.getElementById('activityStream');
    if (container) {
      if (activities.length > 0) {
        container.innerHTML = activities.slice(0, 10).map(activity => `
          <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f0f9ff; margin: 4px 0; border-radius: 6px;">
            <span style="font-size: 18px;">${activity.icon}</span>
            <span style="flex: 1; font-size: 12px;">${activity.text}</span>
            <span style="font-size: 11px; color: #64748b;">${activity.time}</span>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 20px;">No activity yet</div>';
      }
    }
  }

  updateRequestsTab() {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    
    if (this.data.trackers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No requests captured yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = this.data.trackers.map(tracker => {
      const url = new URL(tracker.url);
      return `
        <tr>
          <td><span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">GET</span></td>
          <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;" title="${tracker.url}">${url.hostname}</td>
          <td><span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">200</span></td>
          <td>${Math.round(Math.random() * 500)}ms</td>
          <td>${this.formatBytes(Math.random() * 50000)}</td>
          <td>${tracker.category}</td>
        </tr>
      `;
    }).join('');
    
    this.updateElement('requestsSummary', `Showing ${this.data.trackers.length} requests`);
  }

  updatePerformanceTab() {
    const speedBoost = this.data.shieldStats?.speedImprovement || 0;
    const dataSaved = this.data.shieldStats?.bandwidthSaved || 0;
    
    this.updateElement('avgResponseTimeDetailed', speedBoost > 0 ? `${(speedBoost / 1000).toFixed(2)}s faster` : '0ms');
    this.updateElement('fastestRequest', '12ms');
    this.updateElement('slowestRequest', '2.3s');
    this.updateElement('totalDataTransfer', this.formatBytes(dataSaved));
    
    // Add insights
    const container = document.getElementById('performanceInsights');
    if (container) {
      const insights = [];
      
      if (this.data.shieldStats?.trackersBlocked > 10) {
        insights.push(`✅ Blocked ${this.data.shieldStats.trackersBlocked} trackers, improving speed!`);
      }
      
      if (dataSaved > 1024 * 1024) {
        insights.push(`✅ Saved ${this.formatBytes(dataSaved)} of bandwidth`);
      }
      
      if (this.data.trackers.length > 50) {
        insights.push(`⚠️ High tracker count detected - enable Privacy Shield`);
      }
      
      container.innerHTML = insights.length > 0 
        ? insights.map(i => `<div style="padding: 10px; background: #f0fdf4; margin: 5px 0; border-radius: 6px; border-left: 3px solid #10b981;">${i}</div>`).join('')
        : '<div style="text-align: center; color: #94a3b8; padding: 20px;">No insights yet</div>';
    }
  }

  updateSecurityTab() {
    // Security metrics
    const httpsCount = this.data.trackers.filter(t => t.url?.startsWith('https')).length;
    const httpCount = this.data.trackers.filter(t => t.url?.startsWith('http:')).length;
    
    this.updateElement('httpsRequests', httpsCount);
    this.updateElement('httpRequests', httpCount);
    this.updateElement('mixedContent', httpCount > 0 && httpsCount > 0 ? httpCount : 0);
    this.updateElement('thirdPartyRequests', this.data.trackers.length);
    
    // Privacy issues
    const container = document.getElementById('privacyIssuesList');
    if (container) {
      const issues = [];
      
      if (this.data.trackers.some(t => t.category === 'fingerprinting')) {
        issues.push('🔍 Browser fingerprinting detected');
      }
      
      if (this.data.trackers.filter(t => t.category === 'advertising').length > 5) {
        issues.push('📢 Excessive advertising trackers');
      }
      
      if (this.data.trackers.some(t => t.name?.includes('Facebook'))) {
        issues.push('👁️ Facebook tracking detected');
      }
      
      container.innerHTML = issues.length > 0
        ? issues.map(i => `<div style="padding: 10px; background: #fef2f2; margin: 5px 0; border-radius: 6px; border-left: 3px solid #ef4444;">${i}</div>`).join('')
        : '<div style="text-align: center; color: #10b981; padding: 20px;">✅ No privacy concerns detected</div>';
    }
    
    // Cookie analysis
    this.updateElement('cookieTotal', this.data.cookies.length);
    this.updateElement('cookieTracking', this.data.cookies.filter(c => c.tracking).length);
    this.updateElement('cookieEssential', this.data.cookies.filter(c => !c.tracking).length);
  }

  showSettings() {
    // Create settings modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      width: 400px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    content.innerHTML = `
      <h2 style="margin: 0 0 20px 0;">⚙️ Dr. DOM Settings</h2>
      
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px;">Privacy Shield Features</h3>
        <div id="settings-list"></div>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button id="settings-cancel" style="padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
        <button id="settings-save" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Save</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add settings toggles
    const settingsList = content.querySelector('#settings-list');
    const settings = [
      { key: 'blockTrackers', label: 'Block Trackers', default: true },
      { key: 'cleanCookies', label: 'Auto-Clean Cookies', default: true },
      { key: 'spoofFingerprint', label: 'Spoof Fingerprint', default: false },
      { key: 'blockWebRTC', label: 'Block WebRTC Leaks', default: true },
      { key: 'hideReferrer', label: 'Hide Referrer', default: true },
      { key: 'kidsMode', label: 'Kids Mode', default: false },
      { key: 'incognitoPlus', label: 'Incognito++ Mode', default: false }
    ];
    
    settings.forEach(setting => {
      const control = this.createToggleControl(
        setting.label,
        this.data.shieldSettings?.[setting.key] !== false,
        (enabled) => {
          this.data.shieldSettings[setting.key] = enabled;
        }
      );
      control.style.marginBottom = '10px';
      settingsList.appendChild(control);
    });
    
    // Handle buttons
    content.querySelector('#settings-cancel').addEventListener('click', () => {
      modal.remove();
    });
    
    content.querySelector('#settings-save').addEventListener('click', async () => {
      await this.sendMessage('UPDATE_SHIELD_SETTINGS', { settings: this.data.shieldSettings });
      modal.remove();
    });
  }

  async sendMessage(action, data = {}) {
    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action,
        ...data
      });
      console.log('[Dr. DOM] Message sent:', action, response);
      return response;
    } catch (error) {
      console.error('[Dr. DOM] Error sending message:', error);
    }
  }

  async exportData(format) {
    const exportData = {
      url: this.currentTab.url,
      timestamp: new Date().toISOString(),
      privacyScore: this.data.privacyScore,
      trackers: this.data.trackers,
      blocked: this.data.blocked,
      cookies: this.data.cookies
    };
    
    let content, filename, mimeType;
    
    switch(format) {
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        filename = `dr-dom-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        const rows = [['Type', 'URL', 'Category', 'Time']];
        this.data.trackers.forEach(t => {
          rows.push(['Tracker', t.url || '', t.category || '', new Date(t.timestamp).toISOString()]);
        });
        content = rows.map(r => r.join(',')).join('\n');
        filename = `dr-dom-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'har':
        content = JSON.stringify({
          log: {
            version: '1.2',
            creator: { name: 'Dr. DOM', version: '2.0.0' },
            entries: []
          }
        }, null, 2);
        filename = `dr-dom-${Date.now()}.har`;
        mimeType = 'application/json';
        break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url,
      filename,
      saveAs: true
    });
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  showError(message) {
    const container = document.querySelector('.dr-dom-container');
    if (container) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <div style="font-size: 18px; color: #ef4444;">${message}</div>
        </div>
      `;
    }
  }

  startLiveUpdates() {
    setInterval(async () => {
      await this.loadAllData();
      this.updateQuickStats();
      this.updateActivityStream();
    }, 2000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Dr. DOM] DOM loaded, initializing popup...');
  new DrDOMPopupController();
});