/**
 * Silly Metrics - Fun, visual ways to present privacy data
 * Makes serious privacy analysis entertaining and memorable
 */

class SillyMetrics {
  constructor() {
    this.metrics = {
      creepiness: 0,
      nosiness: 0,
      greedometer: 0,
      trustfall: 100,
      privacyWeather: 'sunny',
      moodEmoji: '😊',
      temperature: 20
    };
    
    this.init();
  }

  init() {
    console.log('🎪 [Silly Metrics] Making privacy fun and visual!');
    
    // Wait for real data to be available
    setTimeout(() => this.calculateSillyMetrics(), 2000);
  }

  async calculateSillyMetrics() {
    const domain = window.location.hostname;
    
    // Get real privacy data
    const privacyData = await this.getPrivacyData(domain);
    const trackers = privacyData?.trackers || [];
    const cookies = document.cookie.split(';').length;
    const forms = document.querySelectorAll('form').length;
    const inputs = document.querySelectorAll('input').length;
    
    // Calculate Creepiness Index (0-100)
    this.calculateCreepiness(trackers, cookies);
    
    // Calculate Nosiness Score (0-100)
    this.calculateNosiness(forms, inputs);
    
    // Calculate Greed-o-Meter (0-100)
    this.calculateGreedometer(trackers);
    
    // Calculate Trust Fall Rating (0-100)
    this.calculateTrustFall();
    
    // Generate Weather Report
    this.generateWeatherReport();
    
    // Select Mood Emoji
    this.selectMoodEmoji();
    
    // Calculate Privacy Temperature
    this.calculateTemperature();
    
    // Store and display results
    this.storeMetrics();
    this.displayFloatingWidget();
  }

  calculateCreepiness(trackers, cookies) {
    // Creepiness based on tracking intensity
    let creepiness = 0;
    
    // Each tracker adds creepiness
    creepiness += Math.min(trackers.length * 3, 30);
    
    // Fingerprinting is extra creepy
    const fingerprinters = trackers.filter(t => 
      t.category === 'fingerprinting' || 
      t.domain?.includes('fingerprint')
    );
    creepiness += fingerprinters.length * 10;
    
    // Too many cookies is creepy
    if (cookies > 20) creepiness += 20;
    if (cookies > 50) creepiness += 20;
    
    // Check for creepy patterns
    if (document.body.innerHTML.includes('location.href')) creepiness += 10;
    if (window.navigator.geolocation) creepiness += 5;
    if (document.querySelector('[type="tel"]')) creepiness += 5;
    
    this.metrics.creepiness = Math.min(creepiness, 100);
    
    // Creepiness descriptions
    this.metrics.creepinessLevel = this.getCreepinessLevel(this.metrics.creepiness);
  }

  getCreepinessLevel(score) {
    if (score >= 80) return { text: "STALKER LEVEL! 👻", color: "#dc2626" };
    if (score >= 60) return { text: "Pretty Creepy 😨", color: "#f59e0b" };
    if (score >= 40) return { text: "Mildly Creepy 🤨", color: "#eab308" };
    if (score >= 20) return { text: "Slightly Weird 😐", color: "#10b981" };
    return { text: "Not Creepy! 😊", color: "#059669" };
  }

  calculateNosiness(forms, inputs) {
    // How nosy is the site about personal info?
    let nosiness = 0;
    
    // Forms are nosy
    nosiness += forms * 10;
    
    // Check for nosy input types
    const nosyInputs = [
      '[type="email"]', '[type="tel"]', '[name*="phone"]',
      '[name*="address"]', '[name*="birth"]', '[name*="age"]',
      '[name*="income"]', '[name*="ssn"]', '[name*="social"]'
    ];
    
    nosyInputs.forEach(selector => {
      if (document.querySelector(selector)) {
        nosiness += 15;
      }
    });
    
    // Newsletter popups are nosy
    const popupWords = ['newsletter', 'subscribe', 'sign up', 'join'];
    popupWords.forEach(word => {
      if (document.body.textContent.toLowerCase().includes(word)) {
        nosiness += 5;
      }
    });
    
    this.metrics.nosiness = Math.min(nosiness, 100);
    this.metrics.nosinessLevel = this.getNosinessLevel(this.metrics.nosiness);
  }

  getNosinessLevel(score) {
    if (score >= 80) return { text: "SUPER NOSY! 🕵️", color: "#dc2626" };
    if (score >= 60) return { text: "Very Nosy 🔍", color: "#f59e0b" };
    if (score >= 40) return { text: "Kinda Nosy 👀", color: "#eab308" };
    if (score >= 20) return { text: "A Bit Curious 🤔", color: "#10b981" };
    return { text: "Minds Own Business 😌", color: "#059669" };
  }

  calculateGreedometer(trackers) {
    // How money-hungry is the site?
    let greed = 0;
    
    // Ad networks = greedy
    const adTrackers = trackers.filter(t => 
      t.category === 'advertising' || 
      t.domain?.includes('doubleclick') ||
      t.domain?.includes('adsystem')
    );
    greed += adTrackers.length * 5;
    
    // Check for monetization elements
    const adSelectors = [
      '[class*="advertisement"]', '[id*="google_ads"]',
      '[class*="sponsored"]', '.ad-container'
    ];
    
    adSelectors.forEach(selector => {
      const ads = document.querySelectorAll(selector);
      greed += ads.length * 3;
    });
    
    // Affiliate links = greedy
    const affiliateLinks = document.querySelectorAll('a[href*="amzn.to"], a[href*="tag="]');
    greed += affiliateLinks.length * 2;
    
    // Paywalls = greedy
    if (document.body.textContent.includes('paywall') || 
        document.body.textContent.includes('subscribe to read')) {
      greed += 30;
    }
    
    this.metrics.greedometer = Math.min(greed, 100);
    this.metrics.greedLevel = this.getGreedLevel(this.metrics.greedometer);
  }

  getGreedLevel(score) {
    if (score >= 80) return { text: "MONEY MONSTER! 🤑", color: "#dc2626" };
    if (score >= 60) return { text: "Cash Hungry 💰", color: "#f59e0b" };
    if (score >= 40) return { text: "Profit Focused 💵", color: "#eab308" };
    if (score >= 20) return { text: "Business Minded 💳", color: "#10b981" };
    return { text: "Not Greedy! 🎁", color: "#059669" };
  }

  calculateTrustFall() {
    // Would you trust them with your diary?
    let trust = 100;
    
    // Deduct trust for bad practices
    trust -= this.metrics.creepiness * 0.3;
    trust -= this.metrics.nosiness * 0.3;
    trust -= this.metrics.greedometer * 0.2;
    
    // Check for trust signals
    if (window.location.protocol === 'https:') trust += 10;
    if (document.querySelector('a[href*="privacy"]')) trust += 5;
    if (document.querySelector('.gdpr, .ccpa')) trust += 5;
    
    this.metrics.trustfall = Math.max(0, Math.min(trust, 100));
    this.metrics.trustLevel = this.getTrustLevel(this.metrics.trustfall);
  }

  getTrustLevel(score) {
    if (score >= 80) return { text: "TOTALLY TRUSTWORTHY! 🤗", color: "#059669" };
    if (score >= 60) return { text: "Pretty Trustable 👍", color: "#10b981" };
    if (score >= 40) return { text: "Somewhat Trusty 🤝", color: "#eab308" };
    if (score >= 20) return { text: "Trust Issues 😬", color: "#f59e0b" };
    return { text: "DO NOT TRUST! 🚨", color: "#dc2626" };
  }

  generateWeatherReport() {
    // Privacy weather based on overall metrics
    const avgScore = (
      this.metrics.creepiness + 
      this.metrics.nosiness + 
      this.metrics.greedometer
    ) / 3;
    
    if (avgScore >= 80) {
      this.metrics.privacyWeather = '⛈️ Privacy Storm!';
      this.metrics.weatherColor = '#dc2626';
      this.metrics.weatherAdvice = 'Take shelter immediately!';
    } else if (avgScore >= 60) {
      this.metrics.privacyWeather = '🌧️ Privacy Showers';
      this.metrics.weatherColor = '#f59e0b';
      this.metrics.weatherAdvice = 'Bring an umbrella (VPN)!';
    } else if (avgScore >= 40) {
      this.metrics.privacyWeather = '☁️ Partly Cloudy';
      this.metrics.weatherColor = '#eab308';
      this.metrics.weatherAdvice = 'Some tracker clouds visible';
    } else if (avgScore >= 20) {
      this.metrics.privacyWeather = '⛅ Mostly Clear';
      this.metrics.weatherColor = '#10b981';
      this.metrics.weatherAdvice = 'Good privacy visibility';
    } else {
      this.metrics.privacyWeather = '☀️ Sunny Skies!';
      this.metrics.weatherColor = '#059669';
      this.metrics.weatherAdvice = 'Perfect privacy weather!';
    }
  }

  selectMoodEmoji() {
    // Overall mood of the site
    const avgScore = (
      this.metrics.creepiness + 
      this.metrics.nosiness + 
      this.metrics.greedometer
    ) / 3;
    
    const moods = [
      { threshold: 80, emoji: '😱', text: 'Terrified' },
      { threshold: 70, emoji: '😰', text: 'Anxious' },
      { threshold: 60, emoji: '😟', text: 'Worried' },
      { threshold: 50, emoji: '😕', text: 'Concerned' },
      { threshold: 40, emoji: '😐', text: 'Neutral' },
      { threshold: 30, emoji: '🙂', text: 'Okay' },
      { threshold: 20, emoji: '😊', text: 'Happy' },
      { threshold: 10, emoji: '😄', text: 'Delighted' },
      { threshold: 0, emoji: '🥳', text: 'Celebrating' }
    ];
    
    const mood = moods.find(m => avgScore >= m.threshold) || moods[moods.length - 1];
    this.metrics.moodEmoji = mood.emoji;
    this.metrics.moodText = mood.text;
  }

  calculateTemperature() {
    // Privacy temperature in Celsius (for fun)
    const avgScore = (
      this.metrics.creepiness + 
      this.metrics.nosiness + 
      this.metrics.greedometer
    ) / 3;
    
    // Map score to temperature (0-100 -> -10°C to 40°C)
    this.metrics.temperature = Math.round(-10 + (avgScore * 0.5));
    
    if (this.metrics.temperature >= 30) {
      this.metrics.tempDescription = '🔥 Privacy Melting!';
    } else if (this.metrics.temperature >= 20) {
      this.metrics.tempDescription = '🌡️ Getting Warm';
    } else if (this.metrics.temperature >= 10) {
      this.metrics.tempDescription = '❄️ Nicely Cool';
    } else {
      this.metrics.tempDescription = '🧊 Privacy Frozen (Good!)';
    }
  }

  async getPrivacyData(domain) {
    return new Promise((resolve) => {
      chrome.storage.local.get(`drDOM_${domain}_privacy`, (result) => {
        resolve(result[`drDOM_${domain}_privacy`] || { trackers: [] });
      });
    });
  }

  displayFloatingWidget() {
    // Don't show multiple widgets
    if (document.getElementById('silly-metrics-widget')) return;
    
    const widget = document.createElement('div');
    widget.id = 'silly-metrics-widget';
    widget.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
      border: 2px solid #6366f1;
      border-radius: 16px;
      padding: 15px;
      width: 280px;
      z-index: 2147483646;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      cursor: move;
      animation: slideIn 0.5s ease;
    `;
    
    widget.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; font-size: 16px; color: #4c1d95;">
          🎪 Silly Metrics™
        </h3>
        <button id="silly-close" style="
          background: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6366f1;
        ">×</button>
      </div>
      
      <!-- Mood Display -->
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 48px; animation: pulse 2s infinite;">
          ${this.metrics.moodEmoji}
        </div>
        <div style="font-size: 14px; color: #6366f1; font-weight: 600;">
          Site Mood: ${this.metrics.moodText}
        </div>
      </div>
      
      <!-- Weather Report -->
      <div style="
        background: white;
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 10px;
        text-align: center;
      ">
        <div style="font-size: 18px; font-weight: bold; color: ${this.metrics.weatherColor};">
          ${this.metrics.privacyWeather}
        </div>
        <div style="font-size: 11px; color: #6b7280; margin-top: 3px;">
          ${this.metrics.weatherAdvice}
        </div>
      </div>
      
      <!-- Metrics Bars -->
      <div style="background: white; padding: 10px; border-radius: 10px;">
        ${this.createMetricBar('Creepiness', this.metrics.creepiness, this.metrics.creepinessLevel)}
        ${this.createMetricBar('Nosiness', this.metrics.nosiness, this.metrics.nosinessLevel)}
        ${this.createMetricBar('Greed-o-Meter', this.metrics.greedometer, this.metrics.greedLevel)}
        ${this.createMetricBar('Trust Fall', this.metrics.trustfall, this.metrics.trustLevel, true)}
      </div>
      
      <!-- Temperature -->
      <div style="
        background: white;
        padding: 8px;
        border-radius: 8px;
        margin-top: 10px;
        text-align: center;
        font-size: 12px;
      ">
        Privacy Temp: <strong>${this.metrics.temperature}°C</strong> - ${this.metrics.tempDescription}
      </div>
      
      <!-- Disclaimer -->
      <div style="
        text-align: center;
        font-size: 9px;
        color: #9ca3af;
        margin-top: 10px;
        font-style: italic;
      ">
        * Metrics 87% made up for entertainment
      </div>
      
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `;
    
    document.body.appendChild(widget);
    
    // Make widget draggable
    this.makeDraggable(widget);
    
    // Close button
    document.getElementById('silly-close')?.addEventListener('click', () => {
      widget.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => widget.remove(), 300);
    });
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (document.getElementById('silly-metrics-widget')) {
        widget.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => widget.remove(), 300);
      }
    }, 30000);
  }

  createMetricBar(label, value, level, inverse = false) {
    const color = inverse ? 
      (value > 50 ? '#059669' : '#dc2626') : 
      (value > 50 ? '#dc2626' : '#059669');
    
    return `
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
          <span style="color: #4b5563;">${label}</span>
          <span style="color: ${level.color}; font-weight: 600;">${level.text}</span>
        </div>
        <div style="
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        ">
          <div style="
            background: linear-gradient(90deg, ${color}, ${color}dd);
            width: ${value}%;
            height: 100%;
            transition: width 0.5s ease;
          "></div>
        </div>
      </div>
    `;
  }

  makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.right = 'auto';
    }
    
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  storeMetrics() {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}_sillyMetrics`;
    
    chrome.storage.local.set({
      [storageKey]: {
        metrics: this.metrics,
        timestamp: Date.now(),
        url: window.location.href
      }
    });
    
    // Send to popup
    chrome.runtime.sendMessage({
      type: 'SILLY_METRICS_UPDATE',
      metrics: this.metrics
    });
  }
}

// Initialize
const sillyMetrics = new SillyMetrics();
console.log('🎪 [Dr. DOM] Silly Metrics activated - Making privacy fun!');