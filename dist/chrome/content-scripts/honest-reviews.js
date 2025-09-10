/**
 * Honest Site Reviews - Real roasts based on actual data
 * No fabrication - just brutally honest analysis of what we find
 */

class HonestReviews {
  constructor() {
    this.siteData = {
      trackers: [],
      cookies: 0,
      requests: [],
      forms: 0,
      permissions: [],
      securityIssues: [],
      loadTime: 0,
      dataTransferred: 0
    };
    
    this.review = {
      headline: '',
      roasts: [],
      compliments: [],
      verdict: '',
      trustScore: 0,
      wouldRecommend: false
    };
    
    this.init();
  }

  async init() {
    console.log('🔥 [Honest Reviews] Preparing to roast this site...');
    
    // Collect REAL data
    await this.collectRealData();
    
    // Generate honest review
    this.generateHonestReview();
    
    // Display the roast
    this.displayReview();
  }

  async collectRealData() {
    const domain = window.location.hostname;
    
    // Get REAL tracker data
    const privacyData = await this.getStoredData(`drDOM_${domain}_privacy`);
    this.siteData.trackers = privacyData?.trackers || [];
    
    // Count REAL cookies
    this.siteData.cookies = document.cookie.split(';').filter(c => c.trim()).length;
    
    // Count REAL forms and inputs
    this.siteData.forms = document.querySelectorAll('form').length;
    this.siteData.inputs = document.querySelectorAll('input').length;
    
    // Check REAL permissions used
    this.checkPermissions();
    
    // Get REAL network data
    const networkData = await this.getStoredData(`drDOM_${domain}_requests`);
    this.siteData.requests = networkData?.requests || [];
    
    // Count REAL ads
    this.siteData.ads = this.countRealAds();
    
    // Check REAL security
    this.siteData.isHTTPS = window.location.protocol === 'https:';
    
    // Measure REAL load time
    if (window.performance && performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.siteData.loadTime = loadTime;
    }
    
    // Get REAL data transferred
    if (window.performance && performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      this.siteData.dataTransferred = resources.reduce((total, r) => 
        total + (r.transferSize || 0), 0);
    }
  }

  countRealAds() {
    const adSelectors = [
      '[id*="google_ads"]',
      '[class*="advertisement"]',
      '[class*="ad-container"]',
      '[data-ad]',
      'ins.adsbygoogle',
      'iframe[src*="doubleclick"]',
      'div[id*="taboola"]'
    ];
    
    let adCount = 0;
    adSelectors.forEach(selector => {
      adCount += document.querySelectorAll(selector).length;
    });
    
    return adCount;
  }

  checkPermissions() {
    // Check what APIs the site might use
    const permissions = [];
    
    if (navigator.geolocation) permissions.push('Location');
    if (navigator.mediaDevices) permissions.push('Camera/Mic');
    if (window.Notification) permissions.push('Notifications');
    if (navigator.bluetooth) permissions.push('Bluetooth');
    if (navigator.usb) permissions.push('USB');
    
    this.siteData.permissions = permissions;
  }

  generateHonestReview() {
    // Generate HONEST roasts based on REAL data
    this.review.roasts = this.generateRoasts();
    
    // Find something nice to say (if possible)
    this.review.compliments = this.generateCompliments();
    
    // Create headline based on worst offense
    this.review.headline = this.generateHeadline();
    
    // Calculate trust score from REAL metrics
    this.review.trustScore = this.calculateTrustScore();
    
    // Generate verdict
    this.review.verdict = this.generateVerdict();
    
    // Would we recommend?
    this.review.wouldRecommend = this.review.trustScore > 50;
  }

  generateRoasts() {
    const roasts = [];
    
    // Roast based on REAL tracker count
    if (this.siteData.trackers.length > 50) {
      roasts.push({
        severity: 'brutal',
        text: `${this.siteData.trackers.length} trackers?! This site has more stalkers than a celebrity!`,
        icon: '🕵️'
      });
    } else if (this.siteData.trackers.length > 20) {
      roasts.push({
        severity: 'harsh',
        text: `${this.siteData.trackers.length} trackers following you around. Creepy much?`,
        icon: '👀'
      });
    } else if (this.siteData.trackers.length > 10) {
      roasts.push({
        severity: 'medium',
        text: `${this.siteData.trackers.length} trackers. Your data is having a party and you're not invited.`,
        icon: '🎉'
      });
    }
    
    // Roast based on REAL cookie count
    if (this.siteData.cookies > 50) {
      roasts.push({
        severity: 'brutal',
        text: `${this.siteData.cookies} cookies! That's not a website, it's a bakery!`,
        icon: '🍪'
      });
    } else if (this.siteData.cookies > 20) {
      roasts.push({
        severity: 'harsh',
        text: `${this.siteData.cookies} cookies. Someone's got a sweet tooth for your data.`,
        icon: '🧁'
      });
    }
    
    // Roast based on REAL ad count
    if (this.siteData.ads > 10) {
      roasts.push({
        severity: 'brutal',
        text: `${this.siteData.ads} ads detected. Is this a website or Times Square?`,
        icon: '📺'
      });
    } else if (this.siteData.ads > 5) {
      roasts.push({
        severity: 'medium',
        text: `${this.siteData.ads} ads. The content-to-ad ratio is getting suspicious.`,
        icon: '💰'
      });
    }
    
    // Roast based on REAL form count
    if (this.siteData.forms > 5) {
      roasts.push({
        severity: 'medium',
        text: `${this.siteData.forms} forms? What is this, a government office?`,
        icon: '📝'
      });
    }
    
    // Roast based on REAL load time
    if (this.siteData.loadTime > 10000) {
      roasts.push({
        severity: 'harsh',
        text: `${(this.siteData.loadTime / 1000).toFixed(1)} seconds to load. I could've made coffee!`,
        icon: '🐌'
      });
    } else if (this.siteData.loadTime > 5000) {
      roasts.push({
        severity: 'medium',
        text: `${(this.siteData.loadTime / 1000).toFixed(1)} second load time. Running on dial-up?`,
        icon: '⏰'
      });
    }
    
    // Roast based on REAL security
    if (!this.siteData.isHTTPS) {
      roasts.push({
        severity: 'brutal',
        text: `Still using HTTP in 2024? That's like leaving your door open with a "Rob Me" sign!`,
        icon: '🔓'
      });
    }
    
    // Roast based on fingerprinting
    const fingerprinters = this.siteData.trackers.filter(t => 
      t.category === 'fingerprinting'
    );
    if (fingerprinters.length > 0) {
      roasts.push({
        severity: 'brutal',
        text: `Fingerprinting detected! They're basically taking your digital DNA without asking.`,
        icon: '🧬'
      });
    }
    
    // Roast Facebook pixel
    if (this.siteData.trackers.some(t => t.domain?.includes('facebook'))) {
      roasts.push({
        severity: 'harsh',
        text: `Facebook pixel found. Zuck knows you were here. He always knows.`,
        icon: '👁️'
      });
    }
    
    // Roast Google Analytics
    if (this.siteData.trackers.some(t => t.domain?.includes('google-analytics'))) {
      roasts.push({
        severity: 'mild',
        text: `Google Analytics detected. Big Brother is taking notes.`,
        icon: '📊'
      });
    }
    
    return roasts;
  }

  generateCompliments() {
    const compliments = [];
    
    // Compliment if HTTPS
    if (this.siteData.isHTTPS) {
      compliments.push({
        text: `At least they use HTTPS. Basic security achieved! 🎉`,
        icon: '🔒'
      });
    }
    
    // Compliment if few trackers
    if (this.siteData.trackers.length < 5) {
      compliments.push({
        text: `Only ${this.siteData.trackers.length} trackers. That's practically privacy-respecting these days!`,
        icon: '🛡️'
      });
    }
    
    // Compliment if fast
    if (this.siteData.loadTime < 2000 && this.siteData.loadTime > 0) {
      compliments.push({
        text: `Loads in ${(this.siteData.loadTime / 1000).toFixed(1)} seconds. Speedy!`,
        icon: '⚡'
      });
    }
    
    // Compliment if no ads
    if (this.siteData.ads === 0) {
      compliments.push({
        text: `No ads detected! Are you sure this is the internet?`,
        icon: '🎁'
      });
    }
    
    // If no compliments, be sarcastic
    if (compliments.length === 0) {
      compliments.push({
        text: `The website loads... that's something, right?`,
        icon: '🤷'
      });
    }
    
    return compliments;
  }

  generateHeadline() {
    const trackerCount = this.siteData.trackers.length;
    const cookieCount = this.siteData.cookies;
    const adCount = this.siteData.ads;
    
    // Pick the worst offense
    if (trackerCount > 50) {
      return `"Privacy? Never heard of it!" - ${window.location.hostname}`;
    } else if (!this.siteData.isHTTPS) {
      return `"Security is for losers!" - ${window.location.hostname}`;
    } else if (cookieCount > 50) {
      return `"We love cookies more than Cookie Monster!" - ${window.location.hostname}`;
    } else if (adCount > 10) {
      return `"Why show content when you can show ads?" - ${window.location.hostname}`;
    } else if (trackerCount > 20) {
      return `"Your data is our business model!" - ${window.location.hostname}`;
    } else if (this.siteData.loadTime > 10000) {
      return `"Patience is a virtue!" - ${window.location.hostname}`;
    } else if (trackerCount > 10) {
      return `"We're watching you... for quality purposes!" - ${window.location.hostname}`;
    } else {
      return `"We're not that bad... right?" - ${window.location.hostname}`;
    }
  }

  calculateTrustScore() {
    let score = 100;
    
    // Deduct for REAL issues
    score -= this.siteData.trackers.length * 1.5;
    score -= this.siteData.cookies * 0.5;
    score -= this.siteData.ads * 3;
    
    if (!this.siteData.isHTTPS) score -= 20;
    if (this.siteData.loadTime > 5000) score -= 10;
    if (this.siteData.forms > 3) score -= 5;
    
    // Bonus for good practices
    if (this.siteData.isHTTPS) score += 10;
    if (this.siteData.trackers.length < 5) score += 10;
    if (this.siteData.ads === 0) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }

  generateVerdict() {
    const score = this.review.trustScore;
    const trackers = this.siteData.trackers.length;
    
    if (score >= 80) {
      return `Actually decent! This site respects your privacy more than most. Trust level: HIGH`;
    } else if (score >= 60) {
      return `Not terrible. Some privacy concerns but nothing shocking by today's standards. Trust level: MEDIUM`;
    } else if (score >= 40) {
      return `Pretty sketchy. Your data is definitely being harvested. Trust level: LOW`;
    } else if (score >= 20) {
      return `Privacy nightmare! Your data is being sold to the highest bidder. Trust level: VERY LOW`;
    } else {
      return `RUN! This site treats your privacy like a joke. Trust level: ABSOLUTELY NOT`;
    }
  }

  displayReview() {
    if (document.getElementById('honest-review')) {
      document.getElementById('honest-review').style.display = 'block';
      return;
    }
    
    const review = document.createElement('div');
    review.id = 'honest-review';
    review.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      display: none;
      max-height: 80vh;
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 3px solid #ef4444;
      border-radius: 20px;
      padding: 0;
      z-index: 2147483647;
      box-shadow: 0 30px 60px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: white;
      overflow: hidden;
      animation: dropIn 0.5s ease;
    `;
    
    const trustColor = this.review.trustScore > 60 ? '#10b981' : 
                       this.review.trustScore > 30 ? '#f59e0b' : '#ef4444';
    
    review.innerHTML = `
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #dc2626, #991b1b);
        padding: 20px;
        position: relative;
      ">
        <button id="review-close" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
        ">×</button>
        
        <h2 style="margin: 0 0 10px 0; font-size: 20px;">
          🔥 HONEST SITE REVIEW
        </h2>
        <div style="font-size: 16px; font-style: italic; opacity: 0.95;">
          "${this.review.headline}"
        </div>
      </div>
      
      <!-- Trust Score -->
      <div style="
        background: linear-gradient(135deg, ${trustColor}, ${trustColor}dd);
        padding: 20px;
        text-align: center;
      ">
        <div style="font-size: 48px; font-weight: bold;">
          ${this.review.trustScore}/100
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          Trust Score
        </div>
        <div style="
          margin-top: 10px;
          padding: 8px 16px;
          background: rgba(0,0,0,0.3);
          border-radius: 20px;
          display: inline-block;
          font-size: 13px;
        ">
          ${this.review.wouldRecommend ? '👍 Would Visit Again' : '👎 Would Not Recommend'}
        </div>
      </div>
      
      <!-- Review Content -->
      <div style="
        padding: 20px;
        max-height: 300px;
        overflow-y: auto;
      ">
        <!-- The Roasts -->
        <div style="margin-bottom: 20px;">
          <h3 style="
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #ef4444;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span>🔥</span> The Bad
          </h3>
          ${this.review.roasts.map(roast => `
            <div style="
              background: rgba(239,68,68,0.1);
              border-left: 3px solid #ef4444;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 4px;
            ">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">${roast.icon}</span>
                <span style="font-size: 14px; line-height: 1.4;">${roast.text}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- The Compliments -->
        <div style="margin-bottom: 20px;">
          <h3 style="
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #10b981;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span>💚</span> The Good (If Any...)
          </h3>
          ${this.review.compliments.map(comp => `
            <div style="
              background: rgba(16,185,129,0.1);
              border-left: 3px solid #10b981;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 4px;
            ">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">${comp.icon}</span>
                <span style="font-size: 14px;">${comp.text}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- The Verdict -->
        <div style="
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
          border: 2px solid #6366f1;
          padding: 15px;
          border-radius: 10px;
        ">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #a5b4fc;">
            ⚖️ Final Verdict
          </h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">
            ${this.review.verdict}
          </p>
        </div>
        
        <!-- Raw Stats -->
        <div style="
          margin-top: 20px;
          padding: 15px;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
        ">
          <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8;">
            📊 The Raw Numbers (100% Real)
          </h4>
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 12px;
            color: #cbd5e1;
          ">
            <div>🎯 Trackers: ${this.siteData.trackers.length}</div>
            <div>🍪 Cookies: ${this.siteData.cookies}</div>
            <div>📺 Ads: ${this.siteData.ads}</div>
            <div>📝 Forms: ${this.siteData.forms}</div>
            <div>⏱️ Load Time: ${(this.siteData.loadTime / 1000).toFixed(1)}s</div>
            <div>🔒 HTTPS: ${this.siteData.isHTTPS ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="
        padding: 15px;
        background: rgba(0,0,0,0.5);
        text-align: center;
        font-size: 11px;
        color: #94a3b8;
      ">
        * This review is based on REAL data collected from the site. No fabrication, just facts! 
        <br>Generated: ${new Date().toLocaleString()}
      </div>
      
      <style>
        @keyframes dropIn {
          from { transform: translate(-50%, -60%) scale(0.9); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(review);
    
    // Close button
    document.getElementById('review-close')?.addEventListener('click', () => {
      review.style.animation = 'dropIn 0.3s ease reverse';
      setTimeout(() => review.remove(), 300);
    });
    
    // Auto-close after 30 seconds
    setTimeout(() => {
      if (document.getElementById('honest-review')) {
        review.style.animation = 'dropIn 0.3s ease reverse';
        setTimeout(() => review.remove(), 300);
      }
    }, 30000);
  }

  async getStoredData(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key] || null);
      });
    });
  }
}

// Initialize after a delay to collect data
setTimeout(() => {
  const honestReviews = new HonestReviews();
  window.honestReviews = honestReviews;
  console.log('🔥 [Dr. DOM] Honest Reviews activated - Roasting sites with REAL data!');
}, 3000);