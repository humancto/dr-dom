/**
 * Free API Security Checker - No API Keys Required!
 * Integrates multiple free security services
 */

class FreeAPISecurityChecker {
  constructor() {
    this.results = {
      phishing: null,
      tosdr: null,
      cryptoScam: null,
      databrokers: null,
      fingerprinting: null
    };
    
    this.cache = new Map();
    this.init();
  }

  async init() {
    console.log('[Free Security APIs] Initializing security checks...');
    
    // Start checks after page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.runAllChecks());
    } else {
      setTimeout(() => this.runAllChecks(), 1000);
    }
  }

  async runAllChecks() {
    const domain = window.location.hostname;
    const url = window.location.href;
    
    // Run all checks in parallel for speed
    const [phishing, tosdr, cryptoScam, databrokers, fingerprinting] = await Promise.allSettled([
      this.checkPhishTank(url),
      this.checkToSDR(domain),
      this.checkCryptoScam(domain),
      this.detectDataBrokers(),
      this.detectFingerprinting()
    ]);
    
    // Store results
    this.results = {
      phishing: phishing.status === 'fulfilled' ? phishing.value : null,
      tosdr: tosdr.status === 'fulfilled' ? tosdr.value : null,
      cryptoScam: cryptoScam.status === 'fulfilled' ? cryptoScam.value : null,
      databrokers: databrokers.status === 'fulfilled' ? databrokers.value : null,
      fingerprinting: fingerprinting.status === 'fulfilled' ? fingerprinting.value : null
    };
    
    this.storeResults();
    this.displayAlerts();
  }

  /**
   * PhishTank - Check for phishing sites (FREE, no key needed)
   */
  async checkPhishTank(url) {
    try {
      // PhishTank requires app_key but provides a public one for testing
      // For production, users should get their own free key
      // Using background script to avoid CORS
      
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { 
            action: 'checkPhishTank',
            url: url 
          },
          (response) => {
            if (response && response.success) {
              resolve({
                isPhishing: response.data.in_database,
                verified: response.data.verified,
                phishId: response.data.phish_id,
                detailsUrl: response.data.phish_detail_url
              });
            } else {
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.warn('[PhishTank] Check failed:', error);
      return null;
    }
  }

  /**
   * Terms of Service; Didn't Read - Privacy policy ratings (FREE)
   */
  async checkToSDR(domain) {
    try {
      // Clean domain (remove www, etc)
      const cleanDomain = domain.replace('www.', '').split('.')[0];
      
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { 
            action: 'checkToSDR',
            domain: cleanDomain 
          },
          (response) => {
            if (response && response.success && response.data) {
              const data = response.data;
              resolve({
                grade: data.class || 'N/A',
                points: this.parseToSDRPoints(data.points),
                badges: data.badges || [],
                summary: this.getToSDRSummary(data.class)
              });
            } else {
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.warn('[ToS;DR] Check failed:', error);
      return null;
    }
  }

  parseToSDRPoints(points) {
    if (!points) return [];
    
    // Parse important privacy points
    return Object.values(points).map(point => ({
      title: point.title,
      description: point.description,
      case: point.case,
      score: point.score,
      classification: point.score > 0 ? 'good' : 'bad'
    })).slice(0, 5); // Top 5 most important
  }

  getToSDRSummary(grade) {
    const summaries = {
      'A': 'Excellent privacy practices. User rights well protected.',
      'B': 'Good privacy practices with minor concerns.',
      'C': 'Some privacy concerns. Read carefully.',
      'D': 'Significant privacy issues. Use with caution.',
      'E': 'Severe privacy violations. Avoid if possible.',
      'N/A': 'No rating available yet.'
    };
    return summaries[grade] || summaries['N/A'];
  }

  /**
   * CryptoScamDB - Check for cryptocurrency scams (FREE)
   */
  async checkCryptoScam(domain) {
    try {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { 
            action: 'checkCryptoScam',
            domain: domain 
          },
          (response) => {
            if (response && response.success && response.data) {
              resolve({
                isScam: response.data.result === 'blocked',
                type: response.data.type || 'unknown',
                entries: response.data.entries || []
              });
            } else {
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.warn('[CryptoScamDB] Check failed:', error);
      return null;
    }
  }

  /**
   * Data Broker Detection - Identify companies that sell user data
   */
  async detectDataBrokers() {
    const dataBrokers = {
      // Major data brokers
      'acxiom': { name: 'Acxiom', type: 'marketing', severity: 'high' },
      'experian': { name: 'Experian', type: 'credit', severity: 'high' },
      'equifax': { name: 'Equifax', type: 'credit', severity: 'high' },
      'transunion': { name: 'TransUnion', type: 'credit', severity: 'high' },
      'oracle': { name: 'Oracle Data Cloud', type: 'marketing', severity: 'high' },
      'epsilon': { name: 'Epsilon', type: 'marketing', severity: 'high' },
      'corelogic': { name: 'CoreLogic', type: 'property', severity: 'medium' },
      'datalogix': { name: 'Datalogix', type: 'purchase', severity: 'high' },
      'bluekai': { name: 'BlueKai', type: 'behavioral', severity: 'high' },
      'lotame': { name: 'Lotame', type: 'audience', severity: 'medium' },
      'neustar': { name: 'Neustar', type: 'identity', severity: 'high' },
      'liveramp': { name: 'LiveRamp', type: 'identity', severity: 'high' },
      'merkle': { name: 'Merkle', type: 'crm', severity: 'medium' },
      'intelius': { name: 'Intelius', type: 'people-search', severity: 'high' },
      'spokeo': { name: 'Spokeo', type: 'people-search', severity: 'high' },
      'whitepages': { name: 'Whitepages', type: 'people-search', severity: 'high' },
      'beenverified': { name: 'BeenVerified', type: 'background', severity: 'high' },
      'truthfinder': { name: 'TruthFinder', type: 'background', severity: 'high' }
    };
    
    const detected = [];
    
    // Check all scripts and requests
    const scripts = document.querySelectorAll('script[src], iframe[src], img[src]');
    const allUrls = Array.from(scripts).map(el => el.src).filter(Boolean);
    
    // Check cookies
    const cookies = document.cookie.split(';');
    
    // Check each data broker
    for (const [key, broker] of Object.entries(dataBrokers)) {
      // Check in URLs
      const found = allUrls.some(url => url.toLowerCase().includes(key));
      
      // Check in cookies
      const cookieFound = cookies.some(cookie => cookie.toLowerCase().includes(key));
      
      // Check in localStorage
      const storageFound = Object.keys(localStorage).some(k => k.toLowerCase().includes(key));
      
      if (found || cookieFound || storageFound) {
        detected.push({
          ...broker,
          key: key,
          foundIn: found ? 'request' : cookieFound ? 'cookie' : 'storage'
        });
      }
    }
    
    // Check for data broker indicators
    const indicators = this.checkDataBrokerIndicators();
    
    return {
      detected: detected,
      count: detected.length,
      indicators: indicators,
      risk: detected.length > 0 ? 'high' : indicators.length > 2 ? 'medium' : 'low'
    };
  }

  checkDataBrokerIndicators() {
    const indicators = [];
    
    // Check for visitor ID cookies
    if (document.cookie.includes('visitor_id') || document.cookie.includes('vid')) {
      indicators.push('Visitor tracking cookies detected');
    }
    
    // Check for device fingerprinting scripts
    if (window.navigator.getBattery || window.navigator.deviceMemory) {
      indicators.push('Device fingerprinting APIs accessed');
    }
    
    // Check for cross-domain tracking
    const thirdPartyDomains = this.getThirdPartyDomains();
    if (thirdPartyDomains.length > 10) {
      indicators.push(`High number of third-party domains (${thirdPartyDomains.length})`);
    }
    
    // Check for retargeting pixels
    const pixels = document.querySelectorAll('img[width="1"][height="1"], img[src*="pixel"]');
    if (pixels.length > 0) {
      indicators.push(`${pixels.length} tracking pixels detected`);
    }
    
    return indicators;
  }

  /**
   * Advanced Fingerprinting Detection
   */
  async detectFingerprinting() {
    const fingerprinting = {
      canvas: false,
      webgl: false,
      audio: false,
      fonts: false,
      screen: false,
      plugins: false,
      battery: false,
      deviceMemory: false,
      hardwareConcurrency: false,
      methods: []
    };
    
    // Canvas fingerprinting detection
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    
    // Check if canvas methods are being called
    if (window.canvasUsed) {
      fingerprinting.canvas = true;
      fingerprinting.methods.push('Canvas fingerprinting');
    }
    
    // WebGL fingerprinting
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        fingerprinting.webgl = true;
        fingerprinting.methods.push('WebGL fingerprinting');
      }
    }
    
    // Audio fingerprinting
    if (window.AudioContext || window.webkitAudioContext) {
      fingerprinting.audio = true;
      fingerprinting.methods.push('Audio fingerprinting');
    }
    
    // Font fingerprinting
    if (document.fonts && document.fonts.check) {
      fingerprinting.fonts = true;
      fingerprinting.methods.push('Font fingerprinting');
    }
    
    // Screen fingerprinting
    const screenProps = ['width', 'height', 'colorDepth', 'pixelDepth'];
    if (screenProps.every(prop => window.screen[prop] !== undefined)) {
      fingerprinting.screen = true;
      fingerprinting.methods.push('Screen fingerprinting');
    }
    
    // Plugin enumeration
    if (navigator.plugins && navigator.plugins.length > 0) {
      fingerprinting.plugins = true;
      fingerprinting.methods.push('Plugin enumeration');
    }
    
    // Battery API
    if (navigator.getBattery) {
      fingerprinting.battery = true;
      fingerprinting.methods.push('Battery API tracking');
    }
    
    // Device memory
    if (navigator.deviceMemory) {
      fingerprinting.deviceMemory = true;
      fingerprinting.methods.push('Device memory profiling');
    }
    
    // Hardware concurrency
    if (navigator.hardwareConcurrency) {
      fingerprinting.hardwareConcurrency = true;
      fingerprinting.methods.push('CPU core detection');
    }
    
    const score = fingerprinting.methods.length;
    
    return {
      detected: score > 0,
      score: score,
      severity: score > 5 ? 'high' : score > 2 ? 'medium' : 'low',
      methods: fingerprinting.methods,
      details: fingerprinting
    };
  }

  getThirdPartyDomains() {
    const currentDomain = window.location.hostname;
    const domains = new Set();
    
    // Check all external resources
    const elements = document.querySelectorAll('[src], [href]');
    elements.forEach(el => {
      try {
        const url = el.src || el.href;
        if (url && url.startsWith('http')) {
          const domain = new URL(url).hostname;
          if (domain !== currentDomain && !domain.includes(currentDomain)) {
            domains.add(domain);
          }
        }
      } catch (e) {
        // Invalid URL
      }
    });
    
    return Array.from(domains);
  }

  storeResults() {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}_freeAPIs`;
    
    chrome.storage.local.set({
      [storageKey]: {
        ...this.results,
        timestamp: Date.now(),
        url: window.location.href
      }
    });
    
    console.log('[Free Security APIs] Results stored:', this.results);
  }

  displayAlerts() {
    // Check for critical issues
    const critical = [];
    
    if (this.results.phishing?.isPhishing) {
      critical.push({
        type: 'phishing',
        message: 'PHISHING SITE DETECTED!',
        severity: 'critical'
      });
    }
    
    if (this.results.cryptoScam?.isScam) {
      critical.push({
        type: 'scam',
        message: 'CRYPTO SCAM DETECTED!',
        severity: 'critical'
      });
    }
    
    if (this.results.databrokers?.detected?.length > 3) {
      critical.push({
        type: 'privacy',
        message: `${this.results.databrokers.detected.length} DATA BROKERS TRACKING YOU`,
        severity: 'high'
      });
    }
    
    if (this.results.fingerprinting?.score > 5) {
      critical.push({
        type: 'fingerprinting',
        message: 'HEAVY FINGERPRINTING DETECTED',
        severity: 'high'
      });
    }
    
    if (this.results.tosdr?.grade === 'E') {
      critical.push({
        type: 'privacy',
        message: 'TERRIBLE PRIVACY POLICY (Grade E)',
        severity: 'high'
      });
    }
    
    // Show alert for most critical issue
    if (critical.length > 0 && critical.some(c => c.severity === 'critical')) {
      this.showCriticalAlert(critical[0]);
    }
  }

  showCriticalAlert(issue) {
    // Don't show multiple alerts
    if (document.getElementById('drdom-critical-alert')) return;
    
    const alert = document.createElement('div');
    alert.id = 'drdom-critical-alert';
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 20px;
      border-radius: 12px;
      max-width: 400px;
      z-index: 2147483647;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      animation: slideIn 0.3s ease;
    `;
    
    alert.innerHTML = `
      <div style="display: flex; align-items: start;">
        <div style="font-size: 28px; margin-right: 15px;">⚠️</div>
        <div style="flex: 1;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">
            ${issue.message}
          </div>
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 15px;">
            This site has been flagged for serious security/privacy violations.
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="window.history.back()" style="
              background: white;
              color: #dc2626;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: bold;
              font-size: 14px;
            ">Leave Site</button>
            <button onclick="document.getElementById('drdom-critical-alert').remove()" style="
              background: transparent;
              color: white;
              border: 2px solid white;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            ">I Understand</button>
          </div>
        </div>
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(alert);
  }
}

// Initialize
const freeSecurityChecker = new FreeAPISecurityChecker();
console.log('[Dr. DOM] Free API security checker active');