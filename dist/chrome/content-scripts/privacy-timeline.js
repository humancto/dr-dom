/**
 * Visual Privacy Timeline - Real-time tracking visualization
 * Shows exactly when and how your privacy erodes
 */

class PrivacyTimeline {
  constructor() {
    this.timeline = [];
    this.startTime = Date.now();
    this.privacyScore = 100;
    this.isRecording = true;
    this.eventTypes = {
      tracker: { icon: '🎯', color: '#ef4444', impact: -5 },
      cookie: { icon: '🍪', color: '#f59e0b', impact: -2 },
      fingerprint: { icon: '🔍', color: '#dc2626', impact: -10 },
      api: { icon: '📡', color: '#3b82f6', impact: -3 },
      form: { icon: '📝', color: '#8b5cf6', impact: -4 },
      storage: { icon: '💾', color: '#10b981', impact: -2 },
      permission: { icon: '🔐', color: '#ec4899', impact: -8 },
      script: { icon: '⚡', color: '#f97316', impact: -1 }
    };
    
    this.init();
  }

  init() {
    console.log('📅 [Privacy Timeline] Starting privacy erosion tracking...');
    
    // Create timeline UI
    this.createTimelineUI();
    
    // Start monitoring
    this.monitorPrivacyEvents();
    
    // Update every second
    setInterval(() => this.updateTimeline(), 1000);
  }

  createTimelineUI() {
    // Check if already exists
    if (document.getElementById('privacy-timeline')) return;
    
    const timeline = document.createElement('div');
    timeline.id = 'privacy-timeline';
    timeline.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 250px;
      background: linear-gradient(135deg, #1e293b, #334155);
      border: 2px solid #475569;
      border-radius: 16px;
      padding: 15px;
      z-index: 2147483647;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      font-family: 'Monaco', 'Courier New', monospace;
      color: white;
      overflow: hidden;
      transition: all 0.3s ease;
    `;
    
    timeline.innerHTML = `
      <!-- Header -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #475569;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="
            width: 10px;
            height: 10px;
            background: #ef4444;
            border-radius: 50%;
            animation: pulse 1s infinite;
          "></div>
          <h3 style="margin: 0; font-size: 14px; font-weight: 600;">
            PRIVACY TIMELINE
          </h3>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <div id="privacy-score-live" style="
            background: linear-gradient(90deg, #10b981, #059669);
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
          ">
            100%
          </div>
          <button id="timeline-minimize" style="
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">_</button>
          <button id="timeline-close" style="
            background: rgba(239,68,68,0.2);
            border: 1px solid #ef4444;
            color: #ef4444;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">×</button>
        </div>
      </div>
      
      <!-- Timeline Display -->
      <div id="timeline-container" style="
        height: 180px;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
        background: rgba(0,0,0,0.2);
        border-radius: 8px;
        padding: 10px;
      ">
        <!-- Time axis -->
        <div id="time-axis" style="
          position: absolute;
          left: 10px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          background: linear-gradient(180deg, #ef4444, #3b82f6);
        "></div>
        
        <!-- Events will be added here -->
        <div id="timeline-events" style="
          padding-left: 30px;
          min-height: 160px;
        ">
          <div style="
            color: #94a3b8;
            font-size: 11px;
            padding: 20px;
            text-align: center;
          ">
            Monitoring privacy events...
          </div>
        </div>
      </div>
      
      <!-- Stats Bar -->
      <div style="
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #475569;
        font-size: 10px;
        color: #94a3b8;
      ">
        <div>Events: <span id="event-count">0</span></div>
        <div>Time: <span id="elapsed-time">0:00</span></div>
        <div>Erosion Rate: <span id="erosion-rate">0/min</span></div>
      </div>
      
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        #timeline-events::-webkit-scrollbar {
          width: 4px;
        }
        #timeline-events::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        #timeline-events::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 2px;
        }
      </style>
    `;
    
    // Wait for body to exist
    if (document.body) {
      document.body.appendChild(timeline);
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
          document.body.appendChild(timeline);
        }
      });
    } else {
      // Document is loaded but body might not exist yet  
      setTimeout(() => {
        if (document.body) {
          document.body.appendChild(timeline);
        }
      }, 100);
    }
    
    // Add event listeners
    this.setupTimelineControls();
  }

  setupTimelineControls() {
    const minimize = document.getElementById('timeline-minimize');
    const close = document.getElementById('timeline-close');
    const timeline = document.getElementById('privacy-timeline');
    
    minimize?.addEventListener('click', () => {
      const container = document.getElementById('timeline-container');
      if (container.style.display === 'none') {
        container.style.display = 'block';
        timeline.style.height = '250px';
        minimize.textContent = '_';
      } else {
        container.style.display = 'none';
        timeline.style.height = '60px';
        minimize.textContent = '□';
      }
    });
    
    close?.addEventListener('click', () => {
      this.isRecording = false;
      timeline.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => timeline.remove(), 300);
    });
  }

  monitorPrivacyEvents() {
    // Monitor cookie changes
    this.monitorCookies();
    
    // Monitor localStorage/sessionStorage
    this.monitorStorage();
    
    // Monitor network requests
    this.monitorNetworkRequests();
    
    // Monitor DOM for forms and trackers
    this.monitorDOM();
    
    // Monitor fingerprinting attempts
    this.monitorFingerprinting();
    
    // Monitor permission requests
    this.monitorPermissions();
  }

  monitorCookies() {
    let lastCookieCount = document.cookie.split(';').length;
    
    setInterval(() => {
      const currentCount = document.cookie.split(';').length;
      if (currentCount > lastCookieCount) {
        const newCookies = currentCount - lastCookieCount;
        this.addTimelineEvent('cookie', `${newCookies} new cookie${newCookies > 1 ? 's' : ''} set`);
        lastCookieCount = currentCount;
      }
    }, 1000);
  }

  monitorStorage() {
    // Override localStorage.setItem
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      this.addTimelineEvent('storage', `LocalStorage: ${key}`);
      return originalSetItem.call(localStorage, key, value);
    };
    
    // Override sessionStorage.setItem
    const originalSessionSetItem = sessionStorage.setItem;
    sessionStorage.setItem = (key, value) => {
      this.addTimelineEvent('storage', `SessionStorage: ${key}`);
      return originalSessionSetItem.call(sessionStorage, key, value);
    };
  }

  monitorNetworkRequests() {
    // Monitor XHR
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function() {
      const url = arguments[1];
      if (this.isTracker(url)) {
        this.addTimelineEvent('tracker', `Tracker: ${this.getDomain(url)}`);
      } else {
        this.addTimelineEvent('api', `API: ${this.getDomain(url)}`);
      }
      return originalXHR.apply(this, arguments);
    }.bind(this);
    
    // Monitor Fetch
    const originalFetch = window.fetch;
    window.fetch = (url, options) => {
      if (this.isTracker(url)) {
        this.addTimelineEvent('tracker', `Tracker: ${this.getDomain(url)}`);
      } else {
        this.addTimelineEvent('api', `API: ${this.getDomain(url)}`);
      }
      return originalFetch(url, options);
    };
  }

  monitorDOM() {
    // Check for forms
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'FORM') {
            this.addTimelineEvent('form', 'Form added to page');
          }
          if (node.nodeName === 'SCRIPT') {
            const src = node.src || 'inline';
            this.addTimelineEvent('script', `Script: ${this.getDomain(src)}`);
          }
        });
      });
    });
    
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      // Wait for body to exist before observing
      const waitForBody = setInterval(() => {
        if (document.body) {
          clearInterval(waitForBody);
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
      }, 100);
    }
  }

  monitorFingerprinting() {
    // Detect canvas fingerprinting
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function() {
      this.addTimelineEvent('fingerprint', 'Canvas fingerprinting detected!');
      return originalToDataURL.apply(this, arguments);
    }.bind(this);
    
    // Detect WebGL fingerprinting
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function() {
      this.addTimelineEvent('fingerprint', 'WebGL fingerprinting detected!');
      return originalGetParameter.apply(this, arguments);
    }.bind(this);
    
    // Detect audio fingerprinting
    if (window.AudioContext) {
      const originalCreateOscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function() {
        this.addTimelineEvent('fingerprint', 'Audio fingerprinting detected!');
        return originalCreateOscillator.apply(this, arguments);
      }.bind(this);
    }
  }

  monitorPermissions() {
    // Monitor geolocation
    if (navigator.geolocation) {
      const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
      navigator.geolocation.getCurrentPosition = function() {
        this.addTimelineEvent('permission', 'Location access requested!');
        return originalGetCurrentPosition.apply(this, arguments);
      }.bind(this);
    }
    
    // Monitor notifications
    if (window.Notification) {
      const originalRequestPermission = Notification.requestPermission;
      Notification.requestPermission = function() {
        this.addTimelineEvent('permission', 'Notification permission requested!');
        return originalRequestPermission.apply(this, arguments);
      }.bind(this);
    }
    
    // Monitor camera/microphone
    if (navigator.mediaDevices) {
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = function(constraints) {
        const devices = [];
        if (constraints.video) devices.push('Camera');
        if (constraints.audio) devices.push('Microphone');
        this.addTimelineEvent('permission', `${devices.join(' & ')} access requested!`);
        return originalGetUserMedia.apply(this, arguments);
      }.bind(this);
    }
  }

  addTimelineEvent(type, description) {
    if (!this.isRecording) return;
    
    const event = {
      id: Date.now() + Math.random(),
      type: type,
      description: description,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      ...this.eventTypes[type]
    };
    
    this.timeline.push(event);
    this.privacyScore = Math.max(0, this.privacyScore + event.impact);
    
    this.displayEvent(event);
    this.updateStats();
    this.storeTimeline();
  }

  displayEvent(event) {
    const container = document.getElementById('timeline-events');
    if (!container) return;
    
    // Clear placeholder if exists
    if (container.querySelector('div[style*="Monitoring"]')) {
      container.innerHTML = '';
    }
    
    const eventEl = document.createElement('div');
    eventEl.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      margin-bottom: 5px;
      background: rgba(${this.hexToRgb(event.color)}, 0.1);
      border-left: 3px solid ${event.color};
      border-radius: 4px;
      animation: slideIn 0.3s ease;
      font-size: 11px;
    `;
    
    const timeStr = this.formatTime(event.elapsed);
    
    eventEl.innerHTML = `
      <div style="font-size: 16px;">${event.icon}</div>
      <div style="flex: 1;">
        <div style="color: white; font-weight: 500;">${event.description}</div>
        <div style="color: #64748b; font-size: 10px;">${timeStr}</div>
      </div>
      <div style="
        color: ${event.impact < 0 ? '#ef4444' : '#10b981'};
        font-weight: bold;
        font-size: 12px;
      ">
        ${event.impact > 0 ? '+' : ''}${event.impact}
      </div>
    `;
    
    // Add to top of timeline
    container.insertBefore(eventEl, container.firstChild);
    
    // Keep only last 20 events for performance
    while (container.children.length > 20) {
      container.removeChild(container.lastChild);
    }
  }

  updateTimeline() {
    // Update elapsed time
    const elapsed = Date.now() - this.startTime;
    const timeEl = document.getElementById('elapsed-time');
    if (timeEl) {
      timeEl.textContent = this.formatTime(elapsed);
    }
    
    // Update privacy score
    const scoreEl = document.getElementById('privacy-score-live');
    if (scoreEl) {
      scoreEl.textContent = `${this.privacyScore}%`;
      scoreEl.style.background = this.getScoreGradient(this.privacyScore);
    }
    
    // Calculate erosion rate
    const minutes = elapsed / 60000;
    const erosionRate = minutes > 0 ? 
      Math.round((100 - this.privacyScore) / minutes) : 0;
    
    const rateEl = document.getElementById('erosion-rate');
    if (rateEl) {
      rateEl.textContent = `${erosionRate}/min`;
      rateEl.style.color = erosionRate > 10 ? '#ef4444' : 
                           erosionRate > 5 ? '#f59e0b' : '#10b981';
    }
  }

  updateStats() {
    const countEl = document.getElementById('event-count');
    if (countEl) {
      countEl.textContent = this.timeline.length;
    }
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getScoreGradient(score) {
    if (score >= 80) return 'linear-gradient(90deg, #10b981, #059669)';
    if (score >= 60) return 'linear-gradient(90deg, #eab308, #f59e0b)';
    if (score >= 40) return 'linear-gradient(90deg, #f97316, #fb923c)';
    return 'linear-gradient(90deg, #ef4444, #dc2626)';
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '255, 255, 255';
  }

  getDomain(url) {
    try {
      if (url === 'inline') return 'inline';
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.substring(0, 30);
    }
  }

  isTracker(url) {
    const trackerDomains = [
      'google-analytics', 'googletagmanager', 'doubleclick',
      'facebook', 'amazon-adsystem', 'googlesyndication',
      'scorecardresearch', 'quantserve', 'outbrain', 'taboola'
    ];
    
    const urlStr = url.toString().toLowerCase();
    return trackerDomains.some(tracker => urlStr.includes(tracker));
  }

  storeTimeline() {
    const domain = window.location.hostname;
    chrome.storage.local.set({
      [`drDOM_${domain}_timeline`]: {
        timeline: this.timeline.slice(-100), // Keep last 100 events
        privacyScore: this.privacyScore,
        startTime: this.startTime,
        timestamp: Date.now()
      }
    });
  }
}

// Initialize
const privacyTimeline = new PrivacyTimeline();
console.log('📅 [Dr. DOM] Privacy Timeline activated - Tracking privacy erosion in real-time!');