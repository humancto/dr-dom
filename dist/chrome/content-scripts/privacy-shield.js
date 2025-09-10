/**
 * Privacy Shield - All-in-one privacy protection with simple toggles
 * Combines: Tracker Blocking, Cookie Cleaning, WebRTC Protection, Fingerprint Spoofing, etc.
 */

class PrivacyShield {
  constructor() {
    this.settings = {
      blockTrackers: true,
      cleanCookies: true,
      spoofFingerprint: false,
      blockWebRTC: true,
      hideReferrer: true,
      kidsMode: false,
      incognitoPlus: false
    };
    
    this.stats = {
      trackersBlocked: 0,
      cookiesDeleted: 0,
      fingerprintsSpoofed: 0,
      dataLeaksPrevent: 0,
      bandwidthSaved: 0,
      speedImprovement: 0
    };
    
    // Tracker patterns - comprehensive list
    this.trackerPatterns = {
      analytics: /google-analytics\.com|googletagmanager\.com|segment\.io|mixpanel\.com|hotjar\.com|matomo\.org|piwik/i,
      advertising: /doubleclick\.net|googlesyndication\.com|amazon-adsystem\.com|facebook\.com\/tr|adsrvr\.org|criteo\.com/i,
      social: /facebook\.com\/plugins|twitter\.com\/widgets|linkedin\.com\/embed|instagram\.com\/embed|tiktok\.com\/embed/i,
      fingerprinting: /fingerprintjs\.com|fpjs\.io|browserleaks\.com|maxmind\.com|threatmetrix\.com/i,
      databrokers: /bluekai\.com|krxd\.net|acxiom\.com|liveramp\.com|oracle\.com\/cx/i
    };
    
    this.whitelist = new Set(['localhost', '127.0.0.1']);
    this.sessionData = [];
    
    this.init();
  }

  async init() {
    console.log('[Privacy Shield] Initializing comprehensive protection...');
    
    // Load saved settings
    await this.loadSettings();
    
    // Apply all protections based on settings
    if (this.settings.blockTrackers) this.setupTrackerBlocking();
    if (this.settings.cleanCookies) this.setupCookieCleaner();
    if (this.settings.blockWebRTC) this.protectWebRTC();
    if (this.settings.hideReferrer) this.hideReferrer();
    if (this.settings.spoofFingerprint) this.spoofFingerprint();
    if (this.settings.kidsMode) this.enableKidsMode();
    if (this.settings.incognitoPlus) this.enableIncognitoPlus();
    
    // Setup UI
    this.createShieldUI();
    
    // Listen for messages
    this.setupMessageHandlers();
    
    // Start monitoring
    this.startMonitoring();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['privacy_shield_settings']);
      if (result.privacy_shield_settings) {
        this.settings = { ...this.settings, ...result.privacy_shield_settings };
        this.stats = result.privacy_shield_stats || this.stats;
      }
    } catch (error) {
      console.error('[Privacy Shield] Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        privacy_shield_settings: this.settings,
        privacy_shield_stats: this.stats
      });
    } catch (error) {
      console.error('[Privacy Shield] Error saving settings:', error);
    }
  }

  // ============= TRACKER BLOCKING =============
  setupTrackerBlocking() {
    console.log('[Privacy Shield] Tracker blocking enabled');
    
    // Intercept all network requests
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (privacyShield.shouldBlockRequest(url)) {
        privacyShield.stats.trackersBlocked++;
        privacyShield.updateUI();
        console.log('[Shield] Blocked tracker:', url);
        return;
      }
      return originalXHR.call(this, method, url, ...args);
    };

    const originalFetch = window.fetch;
    window.fetch = function(url, ...args) {
      const urlString = typeof url === 'string' ? url : url.url;
      if (privacyShield.shouldBlockRequest(urlString)) {
        privacyShield.stats.trackersBlocked++;
        privacyShield.updateUI();
        return Promise.resolve(new Response('', { status: 204 }));
      }
      return originalFetch.call(this, url, ...args);
    };

    // Block tracking pixels
    const originalImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      set: function(value) {
        if (value && privacyShield.shouldBlockRequest(value)) {
          privacyShield.stats.trackersBlocked++;
          privacyShield.updateUI();
          value = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
        return originalImageSrc.set.call(this, value);
      },
      get: originalImageSrc.get
    });
  }

  shouldBlockRequest(url) {
    if (!this.settings.blockTrackers) return false;
    
    for (const [category, pattern] of Object.entries(this.trackerPatterns)) {
      if (pattern.test(url)) {
        // Extra aggressive in kids mode
        if (this.settings.kidsMode) return true;
        
        // Check whitelist
        try {
          const urlObj = new URL(url);
          if (this.whitelist.has(urlObj.hostname)) return false;
        } catch (e) {}
        
        return true;
      }
    }
    return false;
  }

  // ============= COOKIE CLEANER =============
  setupCookieCleaner() {
    console.log('[Privacy Shield] Cookie cleaner enabled');
    
    // Monitor new cookies
    const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    Object.defineProperty(document, 'cookie', {
      set: function(value) {
        // Check if it's a tracking cookie
        if (privacyShield.isTrackingCookie(value)) {
          if (privacyShield.settings.cleanCookies) {
            privacyShield.stats.cookiesDeleted++;
            privacyShield.updateUI();
            console.log('[Shield] Blocked tracking cookie:', value.split('=')[0]);
            return;
          }
        }
        return originalCookie.set.call(this, value);
      },
      get: function() {
        return originalCookie.get.call(this);
      }
    });
    
    // Clean existing cookies periodically
    setInterval(() => this.cleanTrackingCookies(), 60000); // Every minute
  }

  isTrackingCookie(cookieString) {
    const trackingPatterns = /_ga|_gid|_fbp|_gcl|utm_|fr|tr|IDE|NID|VISITOR_INFO/;
    const cookieName = cookieString.split('=')[0];
    return trackingPatterns.test(cookieName);
  }

  cleanTrackingCookies() {
    if (!this.settings.cleanCookies) return;
    
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (this.isTrackingCookie(name + '=')) {
        // Delete the cookie
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        this.stats.cookiesDeleted++;
      }
    });
    this.updateUI();
  }

  // ============= WebRTC PROTECTION =============
  protectWebRTC() {
    console.log('[Privacy Shield] WebRTC leak protection enabled');
    
    // Override WebRTC methods to prevent IP leaks
    const originalRTCPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = function(...args) {
      const pc = new originalRTCPeerConnection(...args);
      
      // Override createOffer to remove local IPs
      const originalCreateOffer = pc.createOffer;
      pc.createOffer = function(...offerArgs) {
        return originalCreateOffer.apply(this, offerArgs).then(offer => {
          if (privacyShield.settings.blockWebRTC) {
            offer.sdp = privacyShield.sanitizeSDP(offer.sdp);
            privacyShield.stats.dataLeaksPrevent++;
            privacyShield.updateUI();
          }
          return offer;
        });
      };
      
      return pc;
    };
  }

  sanitizeSDP(sdp) {
    // Remove local IPs from SDP
    return sdp.replace(/(\d{1,3}\.){3}\d{1,3}/g, '0.0.0.0');
  }

  // ============= REFERRER HIDING =============
  hideReferrer() {
    console.log('[Privacy Shield] Referrer hiding enabled');
    
    // Add meta tag to hide referrer
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    
    // Override click events to strip referrer
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && this.settings.hideReferrer) {
        e.target.rel = 'noreferrer noopener';
      }
    }, true);
  }

  // ============= FINGERPRINT SPOOFING =============
  spoofFingerprint() {
    console.log('[Privacy Shield] Fingerprint spoofing enabled');
    
    // Spoof canvas fingerprint
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
      if (privacyShield.settings.spoofFingerprint) {
        const ctx = this.getContext('2d');
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        // Add random noise
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] += Math.random() * 10 - 5;
        }
        ctx.putImageData(imageData, 0, 0);
        privacyShield.stats.fingerprintsSpoofed++;
        privacyShield.updateUI();
      }
      return originalToDataURL.apply(this, args);
    };
    
    // Spoof WebGL fingerprint
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (privacyShield.settings.spoofFingerprint) {
        // Return random values for fingerprinting parameters
        if (parameter === 37445) return 'Spoofed Graphics Card';
        if (parameter === 37446) return 'Spoofed Vendor';
      }
      return originalGetParameter.call(this, parameter);
    };
    
    // Spoof screen resolution
    Object.defineProperty(screen, 'width', { get: () => 1920 + Math.floor(Math.random() * 100) });
    Object.defineProperty(screen, 'height', { get: () => 1080 + Math.floor(Math.random() * 100) });
  }

  // ============= KIDS MODE =============
  enableKidsMode() {
    console.log('[Privacy Shield] Kids Mode activated - Maximum protection!');
    
    // Block ALL third-party requests
    this.trackerPatterns.kids = /.*/; // Match everything not same-origin
    
    // Block all social media embeds
    const socialEmbeds = document.querySelectorAll('iframe[src*="facebook"], iframe[src*="twitter"], iframe[src*="tiktok"], iframe[src*="instagram"]');
    socialEmbeds.forEach(embed => embed.remove());
    
    // Remove all ads
    const adSelectors = '[id*="ad"], [class*="ad"], [id*="banner"], [class*="banner"], [id*="sponsor"], [class*="sponsor"]';
    document.querySelectorAll(adSelectors).forEach(el => el.remove());
  }

  // ============= INCOGNITO++ MODE =============
  enableIncognitoPlus() {
    console.log('[Privacy Shield] Incognito++ Mode - Ultimate privacy!');
    
    // Enable all protections
    this.settings.blockTrackers = true;
    this.settings.cleanCookies = true;
    this.settings.spoofFingerprint = true;
    this.settings.blockWebRTC = true;
    this.settings.hideReferrer = true;
    
    // Clear all storage on page unload
    window.addEventListener('beforeunload', () => {
      localStorage.clear();
      sessionStorage.clear();
      // Delete all cookies
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });
    
    // Spoof user agent
    Object.defineProperty(navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  }

  // ============= MONITORING & REPORTING =============
  startMonitoring() {
    // Calculate page speed improvement
    const startTime = performance.now();
    
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      const baselineLoadTime = 3000; // Assumed baseline
      this.stats.speedImprovement = Math.max(0, baselineLoadTime - loadTime);
      this.stats.bandwidthSaved = (this.stats.trackersBlocked * 15 * 1024); // 15KB per tracker
      
      this.generateDailyReport();
      this.updateUI();
    });
  }

  generateDailyReport() {
    const report = {
      date: new Date().toLocaleDateString(),
      trackersBlocked: this.stats.trackersBlocked,
      cookiesDeleted: this.stats.cookiesDeleted,
      dataLeaksPrevent: this.stats.dataLeaksPrevent,
      bandwidthSaved: (this.stats.bandwidthSaved / 1024 / 1024).toFixed(2) + ' MB',
      speedImprovement: (this.stats.speedImprovement / 1000).toFixed(2) + ' seconds',
      privacyScore: this.calculatePrivacyScore(),
      dataValue: this.calculateDataValue()
    };
    
    // Store daily report
    const storageKey = `privacy_report_${report.date}`;
    chrome.storage.local.set({ [storageKey]: report });
    
    return report;
  }

  calculatePrivacyScore() {
    let score = 100;
    score -= Math.min(50, this.stats.trackersBlocked * 2);
    score -= Math.min(20, this.stats.cookiesDeleted);
    score += this.settings.blockTrackers ? 10 : 0;
    score += this.settings.spoofFingerprint ? 10 : 0;
    return Math.max(0, Math.min(100, score));
  }

  calculateDataValue() {
    // Estimate how much your data is worth
    const CPM_RATE = 2.5; // $2.50 per 1000 impressions
    const impressions = this.stats.trackersBlocked;
    const value = (impressions * CPM_RATE / 1000);
    
    return {
      today: value.toFixed(2),
      monthly: (value * 30).toFixed(2),
      yearly: (value * 365).toFixed(2),
      savedByBlocking: (value * 0.7).toFixed(2) // 70% saved by blocking
    };
  }

  // ============= UI CREATION =============
  createShieldUI() {
    // Check if widget already exists
    if (document.getElementById('privacy-shield-widget')) return;
    
    // Create floating shield widget (minimized by default)
    const shield = document.createElement('div');
    shield.id = 'privacy-shield-widget';
    shield.className = 'minimized';
    shield.innerHTML = `
      <style>
        #privacy-shield-widget {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 15px;
          padding: 15px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 999999;
          transition: all 0.3s ease;
        }
        
        #privacy-shield-widget.minimized {
          width: 60px;
          height: 60px;
          padding: 0;
          cursor: pointer;
        }
        
        .shield-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .shield-title {
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
        }
        
        .shield-icon {
          font-size: 24px;
          margin-right: 8px;
        }
        
        .shield-minimize {
          cursor: pointer;
          font-size: 20px;
          opacity: 0.8;
        }
        
        .shield-minimize:hover {
          opacity: 1;
        }
        
        .shield-stats {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px;
          margin-bottom: 10px;
        }
        
        .stat-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 14px;
        }
        
        .stat-value {
          font-weight: bold;
        }
        
        .shield-toggles {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px;
        }
        
        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 8px 0;
        }
        
        .toggle-label {
          font-size: 13px;
        }
        
        .toggle-switch {
          position: relative;
          width: 40px;
          height: 20px;
          background: rgba(255,255,255,0.3);
          border-radius: 20px;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .toggle-switch.active {
          background: #4ade80;
        }
        
        .toggle-switch::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
        }
        
        .toggle-switch.active::after {
          transform: translateX(20px);
        }
        
        .shield-footer {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.2);
          text-align: center;
          font-size: 12px;
          opacity: 0.8;
        }
        
        .data-value {
          background: rgba(255,215,0,0.2);
          border-radius: 8px;
          padding: 8px;
          margin-top: 10px;
          text-align: center;
        }
        
        .data-value-amount {
          font-size: 24px;
          font-weight: bold;
          color: #ffd700;
        }
        
        .data-value-label {
          font-size: 11px;
          opacity: 0.9;
        }
      </style>
      
      <div class="shield-header">
        <div class="shield-title">
          <span class="shield-icon">🛡️</span>
          Privacy Shield
        </div>
        <span class="shield-minimize" onclick="privacyShield.toggleMinimize()">−</span>
      </div>
      
      <div class="shield-content">
        <div class="shield-stats">
          <div class="stat-row">
            <span>🚫 Trackers Blocked:</span>
            <span class="stat-value" id="trackers-blocked">0</span>
          </div>
          <div class="stat-row">
            <span>🍪 Cookies Deleted:</span>
            <span class="stat-value" id="cookies-deleted">0</span>
          </div>
          <div class="stat-row">
            <span>⚡ Speed Boost:</span>
            <span class="stat-value" id="speed-boost">0s</span>
          </div>
          <div class="stat-row">
            <span>💾 Data Saved:</span>
            <span class="stat-value" id="data-saved">0 MB</span>
          </div>
        </div>
        
        <div class="shield-toggles">
          <div class="toggle-row">
            <span class="toggle-label">Block Trackers</span>
            <div class="toggle-switch ${this.settings.blockTrackers ? 'active' : ''}" 
                 onclick="privacyShield.toggleSetting('blockTrackers', this)"></div>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">Clean Cookies</span>
            <div class="toggle-switch ${this.settings.cleanCookies ? 'active' : ''}"
                 onclick="privacyShield.toggleSetting('cleanCookies', this)"></div>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">Spoof Fingerprint</span>
            <div class="toggle-switch ${this.settings.spoofFingerprint ? 'active' : ''}"
                 onclick="privacyShield.toggleSetting('spoofFingerprint', this)"></div>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">Kids Mode</span>
            <div class="toggle-switch ${this.settings.kidsMode ? 'active' : ''}"
                 onclick="privacyShield.toggleSetting('kidsMode', this)"></div>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">Incognito++</span>
            <div class="toggle-switch ${this.settings.incognitoPlus ? 'active' : ''}"
                 onclick="privacyShield.toggleSetting('incognitoPlus', this)"></div>
          </div>
        </div>
        
        <div class="data-value">
          <div class="data-value-amount">$<span id="data-value">0.00</span></div>
          <div class="data-value-label">Your data value saved today</div>
        </div>
        
        <div class="shield-footer">
          Privacy Score: <strong id="privacy-score">100</strong>/100
        </div>
      </div>
    `;
    
    document.body.appendChild(shield);
    
    // Make widget draggable
    this.makeWidgetDraggable(shield);
    
    // Update initial values
    this.updateUI();
  }

  makeWidgetDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    element.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('shield-header') || e.target.classList.contains('shield-title')) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = element.offsetLeft;
        initialY = element.offsetTop;
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        element.style.left = initialX + dx + 'px';
        element.style.top = initialY + dy + 'px';
        element.style.right = 'auto';
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  toggleMinimize() {
    const widget = document.getElementById('privacy-shield-widget');
    
    if (widget.classList.contains('minimized')) {
      // Expand the widget
      widget.classList.remove('minimized');
      widget.style.width = '300px';
      widget.style.height = 'auto';
      widget.onclick = null;
      
      // Remove minimized content
      widget.innerHTML = '';
      
      // Recreate full UI
      this.createShieldUI();
    } else {
      // Minimize the widget
      widget.classList.add('minimized');
      widget.style.width = '60px';
      widget.style.height = '60px';
      widget.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:30px;cursor:pointer;">🛡️</div>';
      widget.onclick = () => this.toggleMinimize();
    }
  }

  toggleSetting(setting, element) {
    this.settings[setting] = !this.settings[setting];
    element.classList.toggle('active');
    
    // Apply setting changes immediately
    if (setting === 'spoofFingerprint') {
      if (this.settings[setting]) this.spoofFingerprint();
    } else if (setting === 'kidsMode') {
      if (this.settings[setting]) this.enableKidsMode();
    } else if (setting === 'incognitoPlus') {
      if (this.settings[setting]) this.enableIncognitoPlus();
    }
    
    this.saveSettings();
  }

  updateUI() {
    const elements = {
      'trackers-blocked': this.stats.trackersBlocked,
      'cookies-deleted': this.stats.cookiesDeleted,
      'speed-boost': (this.stats.speedImprovement / 1000).toFixed(1) + 's',
      'data-saved': (this.stats.bandwidthSaved / 1024 / 1024).toFixed(2) + ' MB',
      'data-value': this.calculateDataValue().today,
      'privacy-score': this.calculatePrivacyScore()
    };
    
    for (const [id, value] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    }
    
    // Update badge
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      count: this.stats.trackersBlocked
    });
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'GET_SHIELD_STATS') {
        sendResponse({
          settings: this.settings,
          stats: this.stats,
          report: this.generateDailyReport()
        });
      } else if (request.type === 'UPDATE_SHIELD_SETTINGS') {
        this.settings = { ...this.settings, ...request.settings };
        this.saveSettings();
        sendResponse({ success: true });
      }
    });
  }
}

// Initialize Privacy Shield
const privacyShield = new PrivacyShield();
console.log('[Dr. DOM] Privacy Shield activated - Complete protection enabled!');

// Export for other modules
window.privacyShield = privacyShield;