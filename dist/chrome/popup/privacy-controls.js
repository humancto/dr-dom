/**
 * Privacy Controls Panel JavaScript
 */

class PrivacyControlsPanel {
  constructor() {
    this.currentTab = null;
    this.init();
  }

  async init() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load current settings and stats
    this.loadPrivacyStats();
    this.loadPrivacySettings();
    
    // Update stats every 2 seconds
    setInterval(() => this.loadPrivacyStats(), 2000);
  }

  setupEventListeners() {
    // Back button
    document.getElementById('backToMain')?.addEventListener('click', () => {
      document.location.replace('advanced-popup.html');
    });

    // Toggle switches
    const toggles = ['trackerBlocking', 'cookieCleaning', 'webrtcProtection', 
                     'referrerSpoofing', 'fingerprintPoisoning'];
    
    toggles.forEach(toggle => {
      document.getElementById(toggle)?.addEventListener('change', (e) => {
        this.updatePrivacySetting(toggle, e.target.checked);
      });
    });

    // Special mode buttons
    document.getElementById('kidsMode')?.addEventListener('click', () => {
      this.toggleKidsMode();
    });

    document.getElementById('incognitoPlus')?.addEventListener('click', () => {
      this.toggleIncognitoPlus();
    });

    // Fun feature buttons
    document.getElementById('showRoast')?.addEventListener('click', () => {
      this.showWebsiteRoast();
    });

    document.getElementById('weatherReport')?.addEventListener('click', () => {
      this.showWeatherReport();
    });

    document.getElementById('dailyReport')?.addEventListener('click', () => {
      this.showDailyReport();
    });

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.add('hidden');
      });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });
  }

  async loadPrivacyStats() {
    try {
      // Send message to content script to get stats
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { action: 'getPrivacyStats' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Privacy Protection Suite not active on this page');
          return;
        }
        
        if (response) {
          // Update stats display
          document.getElementById('trackersBlocked').textContent = response.stats?.trackersBlocked || 0;
          document.getElementById('cookiesCleaned').textContent = response.stats?.cookiesCleaned || 0;
          document.getElementById('dataValueSaved').textContent = response.dataValue?.formatted || '$0.00';
          document.getElementById('privacyScore').textContent = response.privacyScore || 100;
        }
      });
    } catch (error) {
      console.error('Error loading privacy stats:', error);
    }
  }

  async loadPrivacySettings() {
    chrome.storage.local.get('privacyConfig', (result) => {
      if (result.privacyConfig) {
        const config = result.privacyConfig;
        
        // Update toggle states
        document.getElementById('trackerBlocking').checked = config.trackerBlocking !== false;
        document.getElementById('cookieCleaning').checked = config.cookieCleaning !== false;
        document.getElementById('webrtcProtection').checked = config.webrtcProtection !== false;
        document.getElementById('referrerSpoofing').checked = config.referrerSpoofing !== false;
        document.getElementById('fingerprintPoisoning').checked = config.fingerprintPoisoning !== false;
        
        // Update special mode states
        if (config.kidsMode) {
          const kidsModeBtn = document.getElementById('kidsMode');
          kidsModeBtn.classList.add('active');
          kidsModeBtn.querySelector('.mode-status').textContent = 'ON';
        }
        
        if (config.incognitoPlus) {
          const incognitoBtn = document.getElementById('incognitoPlus');
          incognitoBtn.classList.add('active');
          incognitoBtn.querySelector('.mode-status').textContent = 'ON';
        }
      }
    });
  }

  async updatePrivacySetting(setting, value) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Update local storage
      chrome.storage.local.get('privacyConfig', (result) => {
        const config = result.privacyConfig || {};
        config[setting] = value;
        chrome.storage.local.set({ privacyConfig: config });
      });
      
      // Send to content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'updatePrivacyConfig',
        config: { [setting]: value }
      });
    } catch (error) {
      console.error('Error updating privacy setting:', error);
    }
  }

  async toggleKidsMode() {
    const btn = document.getElementById('kidsMode');
    const isActive = btn.classList.contains('active');
    
    if (!isActive) {
      btn.classList.add('active');
      btn.querySelector('.mode-status').textContent = 'ON';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'enableKidsMode' });
      
      // Update storage
      chrome.storage.local.get('privacyConfig', (result) => {
        const config = result.privacyConfig || {};
        config.kidsMode = true;
        chrome.storage.local.set({ privacyConfig: config });
      });
    } else {
      btn.classList.remove('active');
      btn.querySelector('.mode-status').textContent = 'OFF';
      
      // Update storage
      chrome.storage.local.get('privacyConfig', (result) => {
        const config = result.privacyConfig || {};
        config.kidsMode = false;
        chrome.storage.local.set({ privacyConfig: config });
      });
    }
  }

  async toggleIncognitoPlus() {
    const btn = document.getElementById('incognitoPlus');
    const isActive = btn.classList.contains('active');
    
    if (!isActive) {
      btn.classList.add('active');
      btn.querySelector('.mode-status').textContent = 'ON';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'enableIncognitoPlus' });
      
      // Update storage
      chrome.storage.local.get('privacyConfig', (result) => {
        const config = result.privacyConfig || {};
        config.incognitoPlus = true;
        chrome.storage.local.set({ privacyConfig: config });
      });
    } else {
      btn.classList.remove('active');
      btn.querySelector('.mode-status').textContent = 'OFF';
      
      // Update storage
      chrome.storage.local.get('privacyConfig', (result) => {
        const config = result.privacyConfig || {};
        config.incognitoPlus = false;
        chrome.storage.local.set({ privacyConfig: config });
      });
    }
  }

  async showWebsiteRoast() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { action: 'showRoast' }, (response) => {
        if (chrome.runtime.lastError) {
          this.showRoastFallback();
          return;
        }
        
        if (response && response.roasts) {
          const modal = document.getElementById('roastModal');
          const content = document.getElementById('roastContent');
          
          content.innerHTML = response.roasts.map(roast => `
            <div class="roast-item">
              ${roast}
            </div>
          `).join('');
          
          modal.classList.remove('hidden');
        }
      });
    } catch (error) {
      this.showRoastFallback();
    }
  }

  showRoastFallback() {
    const modal = document.getElementById('roastModal');
    const content = document.getElementById('roastContent');
    
    const domain = new URL(this.currentTab.url).hostname;
    const fallbackRoasts = [
      `🔥 ${domain} is tracking you harder than a helicopter parent!`,
      `🍪 This site has more cookies than a bakery on Black Friday!`,
      `👀 Privacy on ${domain}? That's like finding a unicorn in your backyard!`,
      `📊 This website collects so much data, it could start its own census bureau!`
    ];
    
    content.innerHTML = fallbackRoasts.map(roast => `
      <div class="roast-item">
        ${roast}
      </div>
    `).join('');
    
    modal.classList.remove('hidden');
  }

  async showWeatherReport() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { action: 'getWeatherReport' }, (response) => {
        if (chrome.runtime.lastError) {
          this.showWeatherFallback();
          return;
        }
        
        if (response && response.weather) {
          const modal = document.getElementById('weatherModal');
          const content = document.getElementById('weatherContent');
          const weather = response.weather;
          
          content.innerHTML = `
            <div class="weather-score">${weather.weather}</div>
            <div class="weather-item">
              <strong>Temperature:</strong> ${weather.temperature}
            </div>
            <div class="weather-item">
              <strong>Conditions:</strong> ${weather.conditions}
            </div>
            <div class="weather-item">
              <strong>Forecast:</strong> ${weather.forecast}
            </div>
            <div class="weather-item">
              <strong>Advice:</strong> ${weather.advice}
            </div>
            <div class="weather-item">
              <strong>Details:</strong><br>
              🍪 ${weather.details.cookies} cookies<br>
              🕵️ ${weather.details.trackers} trackers<br>
              📜 ${weather.details.scripts} scripts<br>
              🔒 HTTPS: ${weather.details.https ? 'Yes' : 'No'}
            </div>
          `;
          
          modal.classList.remove('hidden');
        }
      });
    } catch (error) {
      this.showWeatherFallback();
    }
  }

  showWeatherFallback() {
    const modal = document.getElementById('weatherModal');
    const content = document.getElementById('weatherContent');
    
    content.innerHTML = `
      <div class="weather-score">⛅</div>
      <div class="weather-item">
        <strong>Temperature:</strong> MILD
      </div>
      <div class="weather-item">
        <strong>Conditions:</strong> Partly Tracked
      </div>
      <div class="weather-item">
        <strong>Forecast:</strong> Moderate tracking activity expected
      </div>
      <div class="weather-item">
        <strong>Advice:</strong> Keep your privacy umbrella handy!
      </div>
    `;
    
    modal.classList.remove('hidden');
  }

  async showDailyReport() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { action: 'getDailyReport' }, (response) => {
        if (chrome.runtime.lastError) {
          this.showReportFallback();
          return;
        }
        
        if (response) {
          const modal = document.getElementById('reportModal');
          const content = document.getElementById('reportContent');
          
          content.innerHTML = `
            <div class="report-item">
              <div class="report-stat">
                <span>Date:</span>
                <span>${response.date}</span>
              </div>
              <div class="report-stat">
                <span>Domain:</span>
                <span>${response.domain}</span>
              </div>
              <div class="report-stat">
                <span>Privacy Score:</span>
                <span>${response.privacyScore}/100</span>
              </div>
            </div>
            <div class="report-item">
              <h4>Protection Stats</h4>
              <div class="report-stat">
                <span>Trackers Blocked:</span>
                <span>${response.stats.trackersBlocked}</span>
              </div>
              <div class="report-stat">
                <span>Cookies Cleaned:</span>
                <span>${response.stats.cookiesCleaned}</span>
              </div>
              <div class="report-stat">
                <span>Fingerprints Poisoned:</span>
                <span>${response.stats.fingerprintsPoison}</span>
              </div>
              <div class="report-stat">
                <span>WebRTC Blocked:</span>
                <span>${response.stats.webrtcBlocked}</span>
              </div>
              <div class="report-stat">
                <span>Referrers Spoofed:</span>
                <span>${response.stats.referrersSpoofed}</span>
              </div>
            </div>
            <div class="report-item">
              <h4>Data Value</h4>
              <div class="report-stat">
                <span>Today:</span>
                <span>${response.dataValue.formatted}</span>
              </div>
              <div class="report-stat">
                <span>Monthly Estimate:</span>
                <span>$${response.dataValue.monthly.toFixed(2)}</span>
              </div>
              <div class="report-stat">
                <span>Yearly Estimate:</span>
                <span>$${response.dataValue.yearly.toFixed(2)}</span>
              </div>
            </div>
          `;
          
          modal.classList.remove('hidden');
        }
      });
    } catch (error) {
      this.showReportFallback();
    }
  }

  showReportFallback() {
    const modal = document.getElementById('reportModal');
    const content = document.getElementById('reportContent');
    
    chrome.storage.local.get('globalPrivacyStats', (result) => {
      const stats = result.globalPrivacyStats || {
        trackersBlocked: 0,
        cookiesCleaned: 0,
        fingerprintsPoison: 0,
        webrtcBlocked: 0,
        referrersSpoofed: 0,
        dataValueSaved: 0
      };
      
      content.innerHTML = `
        <div class="report-item">
          <h4>Global Protection Stats</h4>
          <div class="report-stat">
            <span>Trackers Blocked:</span>
            <span>${stats.trackersBlocked}</span>
          </div>
          <div class="report-stat">
            <span>Cookies Cleaned:</span>
            <span>${stats.cookiesCleaned}</span>
          </div>
          <div class="report-stat">
            <span>Data Value Saved:</span>
            <span>$${stats.dataValueSaved.toFixed(4)}</span>
          </div>
        </div>
      `;
      
      modal.classList.remove('hidden');
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PrivacyControlsPanel();
  });
} else {
  new PrivacyControlsPanel();
}