/**
 * Dr. DOM Real-time Tracker Display
 * Shows cookies, trackers, and pixels as they're detected
 */

class DrDOMTrackerBanner {
  constructor() {
    this.trackers = new Set();
    this.pixels = new Set();
    this.cookies = new Set();
    this.bannerId = 'drdom-tracker-banner';
    this.updateInterval = null;
    this.isMinimized = false;
    this.init();
  }

  init() {
    console.log('🎯 [Dr. DOM Tracker Banner] Initializing...');
    
    // Create banner after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createBanner());
    } else {
      this.createBanner();
    }
    
    // Start monitoring
    this.monitorTrackers();
    this.monitorCookies();
    this.monitorPixels();
    
    // Update banner every second
    this.updateInterval = setInterval(() => this.updateBanner(), 1000);
  }

  createBanner() {
    // Check if banner already exists
    if (document.getElementById(this.bannerId)) return;
    
    const banner = document.createElement('div');
    banner.id = this.bannerId;
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 280px;
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%);
      color: white;
      border-radius: 12px;
      padding: 14px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    banner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${chrome.runtime.getURL('assets/icon-32.png')}" style="width: 24px; height: 24px; border-radius: 4px;">
          <h3 style="margin: 0; font-size: 13px; font-weight: 600;">Dr. DOM Live Tracker</h3>
        </div>
        <button id="drdom-minimize-banner" style="
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          opacity: 0.7;
          transition: opacity 0.2s;
        ">−</button>
      </div>
      
      <div id="drdom-tracker-content">
        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
          <!-- Cookies -->
          <div style="background: rgba(255, 255, 255, 0.05); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 18px;">🍪</div>
            <div id="drdom-cookie-count" style="font-weight: bold; font-size: 16px; color: #ef4444;">0</div>
            <div style="font-size: 10px; opacity: 0.7;">Cookies</div>
          </div>
          
          <!-- Trackers -->
          <div style="background: rgba(255, 255, 255, 0.05); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 18px;">🎯</div>
            <div id="drdom-tracker-count" style="font-weight: bold; font-size: 16px; color: #f59e0b;">0</div>
            <div style="font-size: 10px; opacity: 0.7;">Trackers</div>
          </div>
          
          <!-- Pixels -->
          <div style="background: rgba(255, 255, 255, 0.05); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 18px;">👁️</div>
            <div id="drdom-pixel-count" style="font-weight: bold; font-size: 16px; color: #8b5cf6;">0</div>
            <div style="font-size: 10px; opacity: 0.7;">Pixels</div>
          </div>
        </div>
        
        <!-- Privacy Score -->
        <div style="
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; opacity: 0.7;">Privacy Score</span>
            <span id="drdom-privacy-score" style="font-weight: 600; font-size: 14px;">100</span>
          </div>
          <div style="
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
          ">
            <div id="drdom-privacy-bar" style="
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>
        
        <!-- Info Text -->
        <div style="
          margin-top: 10px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          font-size: 10px;
          text-align: center;
          opacity: 0.7;
        ">
          Click extension icon for detailed report
        </div>
      </div>
      
      <!-- Minimized State -->
      <div id="drdom-minimized" style="display: none;">
        <div style="display: flex; align-items: center; gap: 10px; font-size: 11px;">
          <span>🍪 <span id="drdom-cookie-mini">0</span></span>
          <span>🎯 <span id="drdom-tracker-mini">0</span></span>
          <span>👁️ <span id="drdom-pixel-mini">0</span></span>
          <span style="margin-left: auto;">Score: <span id="drdom-score-mini">100</span></span>
        </div>
      </div>
    `;
    
    // Add to page
    if (document.body) {
      document.body.appendChild(banner);
      this.setupEventListeners();
    } else {
      const observer = new MutationObserver(() => {
        if (document.body) {
          document.body.appendChild(banner);
          this.setupEventListeners();
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  setupEventListeners() {
    // Minimize/maximize toggle
    const minimizeBtn = document.getElementById('drdom-minimize-banner');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        const content = document.getElementById('drdom-tracker-content');
        const minimized = document.getElementById('drdom-minimized');
        const banner = document.getElementById(this.bannerId);
        
        if (!this.isMinimized) {
          // Minimize
          content.style.display = 'none';
          minimized.style.display = 'block';
          banner.style.width = '200px';
          minimizeBtn.textContent = '+';
          this.isMinimized = true;
        } else {
          // Maximize
          content.style.display = 'block';
          minimized.style.display = 'none';
          banner.style.width = '280px';
          minimizeBtn.textContent = '−';
          this.isMinimized = false;
        }
      });
    }
  }

  monitorCookies() {
    // Initial cookie check
    this.updateCookies();
    
    // Monitor cookie changes
    setInterval(() => this.updateCookies(), 2000);
  }

  updateCookies() {
    const cookieArray = document.cookie.split(';').filter(c => c.trim());
    this.cookies.clear();
    cookieArray.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name) this.cookies.add(name);
    });
  }

  monitorTrackers() {
    // Intercept XHR
    const originalXHR = XMLHttpRequest.prototype.open;
    const self = this;
    XMLHttpRequest.prototype.open = function() {
      const url = arguments[1];
      if (url && typeof url === 'string') {
        // Check for known trackers
        const trackerPatterns = [
          'google-analytics', 'googletagmanager', 'doubleclick',
          'facebook', 'fbcdn', 'twitter', 'amazon-adsystem',
          'scorecardresearch', 'quantserve', 'outbrain', 'taboola',
          'hotjar', 'mixpanel', 'segment', 'amplitude', 'matomo',
          'piwik', 'heap', 'fullstory', 'newrelic', 'sentry'
        ];
        
        trackerPatterns.forEach(pattern => {
          if (url.includes(pattern)) {
            try {
              self.trackers.add(new URL(url).hostname);
            } catch (e) {
              // Invalid URL
            }
          }
        });
      }
      return originalXHR.apply(this, arguments);
    };
    
    // Intercept Fetch
    const originalFetch = window.fetch;
    window.fetch = function() {
      const url = arguments[0];
      if (url && typeof url === 'string') {
        const trackerPatterns = [
          'google-analytics', 'googletagmanager', 'doubleclick',
          'facebook', 'fbcdn', 'twitter', 'amazon-adsystem',
          'hotjar', 'mixpanel', 'segment', 'amplitude'
        ];
        
        trackerPatterns.forEach(pattern => {
          if (url.includes(pattern)) {
            try {
              self.trackers.add(new URL(url).hostname);
            } catch (e) {
              // Invalid URL
            }
          }
        });
      }
      return originalFetch.apply(this, arguments);
    };
  }

  monitorPixels() {
    // Check for tracking pixels in images
    const checkImage = (img) => {
      const src = img.src;
      if (!src) return;
      
      // Check for tracking pixel patterns
      const pixelPatterns = [
        'pixel', 'track', 'beacon', 'analytics',
        '1x1', 'spacer', 'clear.gif', 'pixel.gif',
        'imp.', 'impression', 'view.', 'log.',
        'collect', 'ping', 'event', 'measure'
      ];
      
      // Check if it's likely a tracking pixel
      const isPixel = 
        pixelPatterns.some(pattern => src.toLowerCase().includes(pattern)) ||
        (img.width <= 1 && img.height <= 1) ||
        (img.naturalWidth <= 1 && img.naturalHeight <= 1) ||
        (img.style.display === 'none') ||
        (img.style.visibility === 'hidden') ||
        (img.style.opacity === '0');
      
      if (isPixel) {
        // Store the full URL instead of just hostname for accurate deduplication
        this.pixels.add(src);
      }
    };
    
    // Monitor new images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'IMG') {
            checkImage(node);
          } else if (node.querySelectorAll) {
            // Check for images within added nodes
            const images = node.querySelectorAll('img');
            images.forEach(checkImage);
          }
        });
      });
    });
    
    // Start observing when body is ready
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Check existing images
      document.querySelectorAll('img').forEach(checkImage);
    } else {
      // Wait for body to be available
      const bodyObserver = new MutationObserver(() => {
        if (document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          // Check existing images
          document.querySelectorAll('img').forEach(checkImage);
          bodyObserver.disconnect();
        }
      });
      bodyObserver.observe(document.documentElement, { childList: true });
    }
  }

  updateBanner() {
    let cookieCount = this.cookies.size;
    let trackerCount = this.trackers.size;
    let pixelCount = this.pixels.size;
    
    // First check for tracking pixels from the live capture system
    if (window.__drDOM && window.__drDOM.trackingPixels) {
      // Use the tracking pixels detected by live-capture.js which has better detection
      const uniquePixelUrls = new Set();
      window.__drDOM.trackingPixels.forEach(pixel => {
        if (pixel.url) {
          uniquePixelUrls.add(pixel.url);
        }
      });
      pixelCount = uniquePixelUrls.size;
      console.log(`🎯 [Live Tracker] Using live-capture pixels: ${pixelCount} unique pixels from ${window.__drDOM.trackingPixels.length} detections`);
    }
    
    // Get unified data if available (as fallback or additional data)
    if (window.unifiedTrackerData) {
      const data = window.unifiedTrackerData.getData();
      cookieCount = data.cookies.total;
      trackerCount = data.trackers.total;
      // Only use unified pixel count if we don't have live capture data
      if (!window.__drDOM || !window.__drDOM.trackingPixels || window.__drDOM.trackingPixels.length === 0) {
        pixelCount = data.pixels.total;
      }
      
      // Merge with unified data
      if (data.cookies.all) {
        data.cookies.all.forEach(c => this.cookies.add(c.name || c));
      }
      if (data.trackers.all) {
        data.trackers.all.forEach(t => this.trackers.add(t));
      }
    }
    
    // Update counts
    const cookieCountEl = document.getElementById('drdom-cookie-count');
    const trackerCountEl = document.getElementById('drdom-tracker-count');
    const pixelCountEl = document.getElementById('drdom-pixel-count');
    
    if (cookieCountEl) cookieCountEl.textContent = cookieCount;
    if (trackerCountEl) trackerCountEl.textContent = trackerCount;
    if (pixelCountEl) pixelCountEl.textContent = pixelCount;
    
    // Update minimized counts
    const cookieMini = document.getElementById('drdom-cookie-mini');
    const trackerMini = document.getElementById('drdom-tracker-mini');
    const pixelMini = document.getElementById('drdom-pixel-mini');
    
    if (cookieMini) cookieMini.textContent = cookieCount;
    if (trackerMini) trackerMini.textContent = trackerCount;
    if (pixelMini) pixelMini.textContent = pixelCount;
    
    // Update privacy score
    const score = Math.max(0, 100 - (trackerCount * 5) - (cookieCount * 2) - (pixelCount * 3));
    const scoreEl = document.getElementById('drdom-privacy-score');
    const barEl = document.getElementById('drdom-privacy-bar');
    const scoreMini = document.getElementById('drdom-score-mini');
    
    if (scoreEl) scoreEl.textContent = score;
    if (barEl) barEl.style.width = `${score}%`;
    if (scoreMini) scoreMini.textContent = score;
  }
}

// Initialize the tracker banner
const drdomTrackerBanner = new DrDOMTrackerBanner();
window.drdomTrackerBanner = drdomTrackerBanner;

console.log('🎯 [Dr. DOM] Real-time tracker banner activated!');