/**
 * Dr. DOM Working Popup - Shows real-time activity and data
 */

class DrDOMWorkingPopup {
  constructor() {
    this.isInspecting = false;
    this.currentTab = null;
    this.stats = {
      errors: 0,
      requests: 0,
      performance: '--',
      domNodes: 0,
      networkData: [],
      errorData: []
    };
    
    console.log('Dr. DOM Working Popup initialized');
    this.init();
  }

  async init() {
    try {
      await this.loadCurrentTab();
      this.setupEventListeners();
      this.startDataPolling();
      this.updateUI();
      console.log('Working popup ready');
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  }

  async loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      console.log('Current tab:', tab.url);
      
      // Check if content scripts are loaded
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
        console.log('Content scripts available:', !!response);
      } catch (error) {
        console.log('Content scripts not yet loaded');
      }
    } catch (error) {
      console.error('Failed to load tab:', error);
    }
  }

  canAccessTab(tab) {
    const url = tab.url;
    const restrictedProtocols = ['chrome:', 'chrome-extension:', 'moz-extension:', 'edge:', 'safari-extension:'];
    return !restrictedProtocols.some(protocol => url.startsWith(protocol));
  }

  setupEventListeners() {
    // Main inspection button
    const inspectBtn = document.getElementById('inspectBtn');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => this.toggleInspection());
    }

    // Screenshot button  
    const screenshotBtn = document.getElementById('screenshotBtn');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => this.takeScreenshot());
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }

    // Feature toggles
    const toggles = ['domMonitor', 'networkMonitor', 'errorTracker', 'performanceMonitor'];
    toggles.forEach(toggleId => {
      const toggle = document.getElementById(toggleId);
      if (toggle) {
        toggle.addEventListener('change', (e) => {
          this.toggleFeature(toggleId, e.target.checked);
        });
      }
    });

    console.log('Event listeners set up');
  }

  async toggleInspection() {
    if (!this.currentTab || !this.canAccessTab(this.currentTab)) {
      this.addActivity('❌', 'Cannot inspect this page. Try a regular website.', 'now');
      return;
    }

    try {
      this.isInspecting = !this.isInspecting;
      
      if (this.isInspecting) {
        await this.startInspection();
        this.addActivity('🚀', 'Dr. DOM inspection started!', 'now');
      } else {
        await this.stopInspection();
        this.addActivity('⏹️', 'Dr. DOM inspection stopped', 'now');
      }
      
      this.updateUI();
      
    } catch (error) {
      console.error('Toggle inspection failed:', error);
      this.addActivity('❌', `Error: ${error.message}`, 'now');
      this.isInspecting = !this.isInspecting; // Revert
      this.updateUI();
    }
  }

  async startInspection() {
    console.log('Starting full inspection...');
    
    // Send message to all content scripts
    const response = await chrome.tabs.sendMessage(this.currentTab.id, {
      action: 'startInspection',
      features: {
        domMonitor: true,
        networkMonitor: true,
        errorTracker: true,  
        performanceMonitor: true
      }
    });
    
    console.log('Start response:', response);
    
    // Start background monitoring
    chrome.runtime.sendMessage({
      action: 'startBackgroundMonitoring',
      tabId: this.currentTab.id
    });
  }

  async stopInspection() {
    console.log('Stopping inspection...');
    
    const response = await chrome.tabs.sendMessage(this.currentTab.id, {
      action: 'stopInspection'
    });
    
    console.log('Stop response:', response);
    
    chrome.runtime.sendMessage({
      action: 'stopBackgroundMonitoring',
      tabId: this.currentTab.id
    });
  }

  async toggleFeature(feature, enabled) {
    console.log(`Toggle ${feature}:`, enabled);
    
    if (this.isInspecting && this.currentTab) {
      try {
        await chrome.tabs.sendMessage(this.currentTab.id, {
          action: 'toggleFeature',
          feature,
          enabled
        });
        
        this.addActivity('⚙️', `${feature} ${enabled ? 'enabled' : 'disabled'}`, 'now');
      } catch (error) {
        console.error('Failed to toggle feature:', error);
      }
    }
  }

  async takeScreenshot() {
    if (!this.currentTab) return;
    
    try {
      const screenshotUrl = await chrome.tabs.captureVisibleTab(
        this.currentTab.windowId,
        { format: 'png', quality: 100 }
      );

      // Download screenshot
      const link = document.createElement('a');
      link.href = screenshotUrl;
      link.download = `dr-dom-screenshot-${Date.now()}.png`;
      link.click();

      this.addActivity('📸', 'Screenshot captured!', 'now');
    } catch (error) {
      console.error('Screenshot failed:', error);
      this.addActivity('❌', 'Failed to capture screenshot', 'now');
    }
  }

  async exportReport() {
    if (!this.currentTab) return;
    
    try {
      // Get data from content scripts
      const inspectionData = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getInspectionData'
      });

      const report = {
        timestamp: new Date().toISOString(),
        url: this.currentTab.url,
        title: this.currentTab.title,
        stats: this.stats,
        data: inspectionData || {},
        summary: this.generateSummary()
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dr-dom-report-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      this.addActivity('📄', 'Report exported!', 'now');
    } catch (error) {
      console.error('Export failed:', error);
      this.addActivity('❌', 'Failed to export report', 'now');
    }
  }

  generateSummary() {
    const summary = [];
    
    if (this.stats.errors > 0) {
      summary.push(`Found ${this.stats.errors} errors that need attention`);
    } else {
      summary.push('No errors detected - great job!');
    }
    
    if (this.stats.requests > 50) {
      summary.push('High number of network requests - consider optimization');
    } else if (this.stats.requests > 20) {
      summary.push('Moderate network activity detected');
    } else {
      summary.push('Low network activity - efficient loading');
    }
    
    return summary;
  }

  updateUI() {
    // Update inspection button
    const inspectBtn = document.getElementById('inspectBtn');
    if (inspectBtn) {
      if (this.isInspecting) {
        inspectBtn.innerHTML = '<span class="btn-icon">⏸️</span>Stop Inspection';
        inspectBtn.classList.add('active');
      } else {
        inspectBtn.innerHTML = '<span class="btn-icon">🔍</span>Start Inspection';
        inspectBtn.classList.remove('active');
      }
    }

    // Update status indicator
    const statusIndicator = document.getElementById('statusIndicator');
    if (statusIndicator) {
      const statusText = statusIndicator.querySelector('span');
      const statusDot = statusIndicator.querySelector('.status-dot');
      
      if (statusText) {
        statusText.textContent = this.isInspecting ? 'Monitoring' : 'Ready';
      }
      
      if (statusDot) {
        statusDot.style.background = this.isInspecting ? '#ef4444' : '#4ade80';
      }
    }

    // Update stats
    this.updateStats();
  }

  updateStats() {
    const elements = {
      errorCount: this.stats.errors,
      requestCount: this.stats.requests, 
      performanceScore: this.stats.performance,
      domNodes: this.stats.domNodes
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  addActivity(icon, message, time) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    // Remove placeholder
    const placeholder = activityList.querySelector('.placeholder');
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
        <div class="activity-time">${time}</div>
      </div>
    `;

    // Add to top of list
    activityList.insertBefore(item, activityList.firstChild);

    // Keep only last 20 items
    const items = activityList.querySelectorAll('.activity-item');
    if (items.length > 20) {
      items[items.length - 1].remove();
    }
  }

  startDataPolling() {
    // Poll for real-time data every 2 seconds
    setInterval(async () => {
      if (this.isInspecting && this.currentTab) {
        try {
          const stats = await chrome.tabs.sendMessage(this.currentTab.id, {
            action: 'getStats'
          });
          
          if (stats) {
            // Check for changes and add activities
            if (stats.errors > this.stats.errors) {
              const newErrors = stats.errors - this.stats.errors;
              this.addActivity('🐛', `${newErrors} new error${newErrors > 1 ? 's' : ''} detected`, 'now');
            }
            
            if (stats.requests > this.stats.requests) {
              const newRequests = stats.requests - this.stats.requests;
              this.addActivity('🌐', `${newRequests} new network request${newRequests > 1 ? 's' : ''}`, 'now');
            }
            
            // Update stats
            this.stats = { ...this.stats, ...stats };
            this.updateStats();
          }
        } catch (error) {
          // Silently handle polling errors
        }
      }
    }, 2000);
  }
}

// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting working popup...');
  window.drDOMPopup = new DrDOMWorkingPopup();
});

console.log('Dr. DOM Working Popup script loaded');