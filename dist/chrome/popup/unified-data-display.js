/**
 * Dr. DOM Unified Data Display
 * Updates all popup tabs with consistent real-time data
 */

class UnifiedDataDisplay {
  constructor() {
    this.updateInterval = null;
    this.currentData = null;
    this.init();
  }

  init() {
    console.log('📊 [Unified Display] Initializing real-time updates...');
    
    // Start real-time updates
    this.startRealtimeUpdates();
    
    // Update when tab changes
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(() => this.updateAllDisplays(), 100);
      });
    });
  }

  startRealtimeUpdates() {
    // Initial update
    this.fetchAndUpdate();
    
    // Update every second for real-time feel
    this.updateInterval = setInterval(() => {
      this.fetchAndUpdate();
    }, 1000);
  }

  fetchAndUpdate() {
    // Get data from active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && !tabs[0].url.startsWith('chrome://')) {
        // Get unified data from content script
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getUnifiedData' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Using storage data due to error:', chrome.runtime.lastError.message);
            // Fallback to storage
            this.fetchFromStorage();
          } else if (response) {
            console.log('📊 Received unified data:', response);
            this.currentData = response;
            this.updateAllDisplays();
          }
        });
      } else {
        // Use storage for chrome:// pages
        this.fetchFromStorage();
      }
    });
  }

  fetchFromStorage() {
    chrome.storage.local.get(['unifiedTrackerData'], (result) => {
      if (result.unifiedTrackerData) {
        console.log('📦 Using storage data:', result.unifiedTrackerData);
        this.currentData = {
          cookies: result.unifiedTrackerData.cookies,
          trackers: result.unifiedTrackerData.trackers,
          pixels: result.unifiedTrackerData.pixels,
          privacyScore: result.unifiedTrackerData.stats.privacyScore
        };
        this.updateAllDisplays();
      }
    });
  }

  updateAllDisplays() {
    if (!this.currentData) return;
    
    // Update Overview Tab
    this.updateOverviewTab();
    
    // Update Security Tab
    this.updateSecurityTab();
    
    // Update Privacy Suite Tab
    this.updatePrivacySuiteTab();
    
    // Update Quick Stats (header)
    this.updateQuickStats();
  }

  updateOverviewTab() {
    // Update tracker count in overview
    const trackerCount = document.getElementById('trackingCount');
    if (trackerCount) {
      trackerCount.textContent = this.currentData.trackers?.total || 0;
    }
    
    // Update request types if available
    if (this.currentData.trackers?.byCategory) {
      const analytics = this.currentData.trackers.byCategory.analytics || 0;
      const advertising = this.currentData.trackers.byCategory.advertising || 0;
      const social = this.currentData.trackers.byCategory.social || 0;
      
      // You can update specific UI elements here
      console.log(`📊 Trackers - Analytics: ${analytics}, Ads: ${advertising}, Social: ${social}`);
    }
  }

  updateSecurityTab() {
    // Update Cookie Analysis
    const cookieTotal = document.getElementById('cookieTotal');
    const cookieEssential = document.getElementById('cookieEssential');
    const cookieTracking = document.getElementById('cookieTracking');
    
    if (cookieTotal) {
      cookieTotal.textContent = this.currentData.cookies?.total || 0;
    }
    if (cookieEssential) {
      cookieEssential.textContent = this.currentData.cookies?.essential || 0;
    }
    if (cookieTracking) {
      cookieTracking.textContent = this.currentData.cookies?.tracking || 0;
    }
    
    // Update Tracking Pixels
    const pixelsList = document.getElementById('trackingPixelsList');
    if (pixelsList && this.currentData.pixels) {
      const total = this.currentData.pixels.total || 0;
      
      if (total > 0) {
        let html = '<div class="pixel-summary" style="padding: 10px; background: #fef3c7; border-radius: 6px; margin-bottom: 10px;">';
        html += `<strong>Total Pixels: ${total}</strong><br>`;
        
        if (this.currentData.pixels.byPlatform) {
          const platforms = [];
          if (this.currentData.pixels.byPlatform.facebook > 0) {
            platforms.push(`Facebook: ${this.currentData.pixels.byPlatform.facebook}`);
          }
          if (this.currentData.pixels.byPlatform.google > 0) {
            platforms.push(`Google: ${this.currentData.pixels.byPlatform.google}`);
          }
          if (this.currentData.pixels.byPlatform.amazon > 0) {
            platforms.push(`Amazon: ${this.currentData.pixels.byPlatform.amazon}`);
          }
          if (this.currentData.pixels.byPlatform.other > 0) {
            platforms.push(`Other: ${this.currentData.pixels.byPlatform.other}`);
          }
          
          if (platforms.length > 0) {
            html += '<div style="font-size: 12px; margin-top: 5px;">';
            html += platforms.join(' • ');
            html += '</div>';
          }
        }
        
        html += '</div>';
        
        // Add list of detected pixels if available
        if (this.currentData.pixels.list && this.currentData.pixels.list.length > 0) {
          html += '<div style="font-size: 11px; color: #666;">';
          this.currentData.pixels.list.slice(0, 5).forEach(pixel => {
            try {
              const hostname = new URL(pixel).hostname;
              html += `<div style="margin: 2px 0;">• ${hostname}</div>`;
            } catch (e) {
              // Invalid URL
            }
          });
          if (this.currentData.pixels.list.length > 5) {
            html += `<div style="opacity: 0.7;">... and ${this.currentData.pixels.list.length - 5} more</div>`;
          }
          html += '</div>';
        }
        
        pixelsList.innerHTML = html;
      } else {
        pixelsList.innerHTML = '<div class="tracking-placeholder">No tracking pixels detected</div>';
      }
    }
    
    // Update Privacy Issues
    const privacyIssues = document.getElementById('privacyIssuesList');
    if (privacyIssues) {
      let issues = [];
      
      if (this.currentData.trackers?.total > 5) {
        issues.push(`⚠️ High tracker count: ${this.currentData.trackers.total} trackers detected`);
      }
      if (this.currentData.cookies?.tracking > 10) {
        issues.push(`🍪 Excessive tracking cookies: ${this.currentData.cookies.tracking} found`);
      }
      if (this.currentData.pixels?.total > 3) {
        issues.push(`👁️ Multiple tracking pixels: ${this.currentData.pixels.total} detected`);
      }
      
      if (issues.length > 0) {
        privacyIssues.innerHTML = issues.map(issue => 
          `<div style="padding: 8px; background: #fef3c7; border-radius: 6px; margin: 5px 0; font-size: 12px;">${issue}</div>`
        ).join('');
      } else {
        privacyIssues.innerHTML = '<div class="privacy-placeholder">No major privacy concerns detected</div>';
      }
    }
  }

  updatePrivacySuiteTab() {
    // Update trackers blocked
    const trackersBlocked = document.getElementById('trackersBlocked');
    if (trackersBlocked) {
      trackersBlocked.textContent = this.currentData.trackers?.total || 0;
    }
    
    // Update cookies cleaned (use tracking cookies count)
    const cookiesCleaned = document.getElementById('cookiesCleaned');
    if (cookiesCleaned) {
      cookiesCleaned.textContent = this.currentData.cookies?.tracking || 0;
    }
    
    // Update privacy score
    const privacyScore = document.getElementById('privacyScore');
    if (privacyScore) {
      privacyScore.textContent = this.currentData.privacyScore || 100;
    }
  }

  updateQuickStats() {
    // Update header stats
    const safetyScore = document.getElementById('safetyScore');
    if (safetyScore) {
      const score = this.currentData.privacyScore || 100;
      safetyScore.textContent = score;
      
      // Color code based on score
      safetyScore.style.color = score >= 80 ? '#10b981' : 
                                score >= 60 ? '#f59e0b' : '#ef4444';
    }
    
    // Update tracker count in header
    const trackingCount = document.getElementById('trackingCount');
    if (trackingCount) {
      trackingCount.textContent = this.currentData.trackers?.total || 0;
    }
  }
}

// Initialize unified display when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.unifiedDisplay = new UnifiedDataDisplay();
  });
} else {
  window.unifiedDisplay = new UnifiedDataDisplay();
}

console.log('📊 [Dr. DOM] Unified Data Display loaded - Real-time updates active!');