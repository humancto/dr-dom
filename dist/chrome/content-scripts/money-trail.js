/**
 * Money Trail - Calculate how much money websites make from your data
 * Shows the economics of surveillance capitalism
 */

class MoneyTrailCalculator {
  constructor() {
    this.calculations = {
      adRevenue: 0,
      dataValue: 0,
      trackerRevenue: 0,
      totalValue: 0,
      breakdown: {}
    };
    
    // Industry standard rates (from public data)
    this.rates = {
      // Display ad CPM rates by quality
      displayCPM: {
        premium: 15.00,    // Premium sites
        standard: 3.00,    // Average sites  
        low: 0.50         // Low quality sites
      },
      
      // Video ad rates
      videoCPM: {
        preroll: 25.00,
        midroll: 30.00,
        overlay: 10.00
      },
      
      // Data values per user (annual)
      userData: {
        basic: 0.10,           // Name, email
        demographic: 2.00,     // Age, gender, location
        behavioral: 5.00,      // Browsing habits
        purchase: 12.00,       // Purchase history
        financial: 50.00,      // Financial data
        health: 100.00,        // Health data
        social: 8.00           // Social connections
      },
      
      // Tracker payments (per 1000 users)
      trackerRates: {
        'google-analytics': 0.00,  // Free but feeds AdSense
        'facebook-pixel': 0.00,     // Free but feeds FB ads
        'amazon-adsystem': 5.00,    // Affiliate commissions
        'doubleclick': 8.00,        // Display network
        'taboola': 2.00,            // Content recommendation
        'outbrain': 2.00,           // Content recommendation
        'criteo': 6.00              // Retargeting
      }
    };
    
    this.init();
  }

  init() {
    console.log('[Money Trail] Calculating website revenue from your data...');
    
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.analyze());
    } else {
      setTimeout(() => this.analyze(), 1000);
    }
  }

  async analyze() {
    const domain = window.location.hostname;
    
    // Get tracking data
    const trackingData = await this.getTrackingData(domain);
    const adsData = this.detectAds();
    const dataCollection = this.analyzeDataCollection();
    
    // Calculate revenues
    this.calculateAdRevenue(adsData);
    this.calculateDataValue(dataCollection);
    this.calculateTrackerRevenue(trackingData);
    
    // Generate insights
    const insights = this.generateInsights();
    
    // Store results
    this.storeResults(insights);
    
    // Show notification if significant
    if (this.calculations.totalValue > 0.10) {
      this.showMoneyNotification();
    }
  }

  detectAds() {
    const ads = {
      display: 0,
      video: 0,
      native: 0,
      affiliate: 0
    };
    
    // Common ad container selectors
    const adSelectors = [
      '[id*="google_ads"]',
      '[id*="div-gpt-ad"]',
      '[class*="advertisement"]',
      '[class*="ad-container"]',
      '[class*="sponsored"]',
      '[data-ad]',
      'ins.adsbygoogle',
      'iframe[src*="doubleclick"]',
      'iframe[src*="googlesyndication"]',
      'div[id^="taboola-"]',
      'div[class*="outbrain"]',
      '.promoted-content',
      '.sponsored-post'
    ];
    
    adSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      ads.display += elements.length;
    });
    
    // Check for video ads
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (video.src?.includes('googlevideo') || 
          video.src?.includes('doubleclick')) {
        ads.video++;
      }
    });
    
    // Check for affiliate links
    const links = document.querySelectorAll('a[href*="amzn.to"], a[href*="amazon.com/"][href*="tag="]');
    ads.affiliate = links.length;
    
    return ads;
  }

  analyzeDataCollection() {
    const data = {
      types: [],
      value: 0
    };
    
    // Check what data is being collected
    const cookies = document.cookie.split(';');
    
    // Check for user ID cookies
    if (cookies.some(c => c.includes('user_id') || c.includes('uid'))) {
      data.types.push('demographic');
      data.value += this.rates.userData.demographic;
    }
    
    // Check for behavioral tracking
    if (cookies.some(c => c.includes('_ga') || c.includes('_fbp'))) {
      data.types.push('behavioral');
      data.value += this.rates.userData.behavioral;
    }
    
    // Check for purchase tracking
    if (window.location.hostname.includes('amazon') || 
        window.location.hostname.includes('ebay') ||
        document.cookie.includes('cart')) {
      data.types.push('purchase');
      data.value += this.rates.userData.purchase;
    }
    
    // Check for social data
    if (document.querySelector('[class*="facebook"]') || 
        document.querySelector('[class*="twitter"]')) {
      data.types.push('social');
      data.value += this.rates.userData.social;
    }
    
    // Check forms for email/personal data
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
      const hasEmail = Array.from(forms).some(f => 
        f.querySelector('input[type="email"], input[name*="email"]')
      );
      if (hasEmail) {
        data.types.push('basic');
        data.value += this.rates.userData.basic;
      }
    }
    
    return data;
  }

  calculateAdRevenue(adsData) {
    // Estimate based on site quality
    const siteQuality = this.assessSiteQuality();
    const cpm = this.rates.displayCPM[siteQuality];
    
    // Calculate display ad revenue (per 1000 impressions)
    const displayRevenue = (adsData.display * cpm) / 1000;
    
    // Video ads pay more
    const videoRevenue = (adsData.video * this.rates.videoCPM.preroll) / 1000;
    
    // Affiliate commission (average 4%)
    const affiliateRevenue = adsData.affiliate * 0.04 * 50; // Assume $50 average purchase
    
    this.calculations.adRevenue = displayRevenue + videoRevenue + affiliateRevenue;
    this.calculations.breakdown.ads = {
      display: `$${displayRevenue.toFixed(4)} (${adsData.display} ads)`,
      video: `$${videoRevenue.toFixed(4)} (${adsData.video} videos)`,
      affiliate: `$${affiliateRevenue.toFixed(2)} (${adsData.affiliate} links)`
    };
  }

  calculateDataValue(dataCollection) {
    // Annual value divided by 365 for daily value
    const dailyValue = dataCollection.value / 365;
    
    // Adjust for session length (assume 5 minute average)
    const sessionMinutes = 5;
    const sessionValue = dailyValue * (sessionMinutes / 1440); // Minutes in day
    
    this.calculations.dataValue = sessionValue;
    this.calculations.breakdown.data = {
      types: dataCollection.types,
      annualValue: `$${dataCollection.value.toFixed(2)}/year`,
      sessionValue: `$${sessionValue.toFixed(4)}/visit`
    };
  }

  async getTrackingData(domain) {
    return new Promise((resolve) => {
      chrome.storage.local.get(`drDOM_${domain}_privacy`, (result) => {
        resolve(result[`drDOM_${domain}_privacy`] || { trackers: [] });
      });
    });
  }

  calculateTrackerRevenue(trackingData) {
    let revenue = 0;
    const trackers = trackingData.trackers || [];
    
    trackers.forEach(tracker => {
      const trackerDomain = tracker.domain?.toLowerCase() || '';
      
      Object.keys(this.rates.trackerRates).forEach(key => {
        if (trackerDomain.includes(key)) {
          revenue += this.rates.trackerRates[key] / 1000; // Per user rate
        }
      });
    });
    
    this.calculations.trackerRevenue = revenue;
    this.calculations.breakdown.trackers = {
      count: trackers.length,
      revenue: `$${revenue.toFixed(4)}`
    };
  }

  assessSiteQuality() {
    // Simple heuristic for site quality
    const domain = window.location.hostname;
    
    // Premium sites
    if (domain.includes('nytimes') || domain.includes('wsj') || 
        domain.includes('forbes') || domain.includes('bloomberg')) {
      return 'premium';
    }
    
    // Low quality sites
    if (domain.includes('clickbait') || document.title.includes('You Won\'t Believe')) {
      return 'low';
    }
    
    return 'standard';
  }

  generateInsights() {
    const total = this.calculations.adRevenue + 
                  this.calculations.dataValue + 
                  this.calculations.trackerRevenue;
    
    this.calculations.totalValue = total;
    
    const insights = {
      total: `$${total.toFixed(2)}`,
      perMinute: `$${(total / 5).toFixed(4)}`,
      annualized: `$${(total * 365 * 10).toFixed(2)}`, // Assume 10 visits/year
      breakdown: this.calculations.breakdown,
      message: this.getInsightMessage(total)
    };
    
    return insights;
  }

  getInsightMessage(value) {
    if (value > 1.00) {
      return 'This site is making significant money from your visit!';
    } else if (value > 0.10) {
      return 'You\'re generating moderate revenue for this site.';
    } else if (value > 0.01) {
      return 'This site makes a small amount from your data.';
    } else {
      return 'Minimal monetization detected.';
    }
  }

  storeResults(insights) {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}_money`;
    
    chrome.storage.local.set({
      [storageKey]: {
        calculations: this.calculations,
        insights: insights,
        timestamp: Date.now(),
        url: window.location.href
      }
    });
    
    console.log('[Money Trail] Revenue analysis:', insights);
  }

  showMoneyNotification() {
    // Don't show multiple notifications
    if (document.getElementById('drdom-money-notification')) return;
    
    const notification = document.createElement('div');
    notification.id = 'drdom-money-notification';
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 20px;
      border-radius: 12px;
      max-width: 350px;
      z-index: 2147483647;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      animation: slideUp 0.3s ease;
      cursor: pointer;
    `;
    
    const total = this.calculations.totalValue;
    const perMinute = (total / 5).toFixed(3);
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="font-size: 32px; margin-right: 15px;">💰</div>
        <div style="flex: 1; cursor: pointer;" class="money-content">
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">
            $${total.toFixed(2)}
          </div>
          <div style="font-size: 12px; opacity: 0.9;">
            This site made from your visit
          </div>
          <div style="font-size: 11px; opacity: 0.8; margin-top: 4px;">
            That's $${perMinute}/minute of your time
          </div>
        </div>
        <button class="money-close-btn" style="
          background: rgba(255,255,255,0.2);
          border: 2px solid white;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          margin-left: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        ">×</button>
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">
        <div style="font-size: 11px; opacity: 0.9;">
          💵 Ads: $${this.calculations.adRevenue.toFixed(3)} | 
          📊 Data: $${this.calculations.dataValue.toFixed(3)} | 
          🎯 Tracking: $${this.calculations.trackerRevenue.toFixed(3)}
        </div>
      </div>
      <style>
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100px); opacity: 0; }
        }
        .money-close-btn:hover {
          background: rgba(255,255,255,0.3) !important;
          transform: scale(1.1);
        }
      </style>
    `;
    
    // Add click handler to close button
    const closeBtn = notification.querySelector('.money-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      });
    }
    
    // Add click handler to content area only
    const content = notification.querySelector('.money-content');
    if (content) {
      content.addEventListener('click', () => {
        // Open Dr. DOM popup for details
        chrome.runtime.sendMessage({ action: 'openPopup' });
      });
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      const notif = document.getElementById('drdom-money-notification');
      if (notif) {
        notif.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
          if (notif && notif.parentNode) {
            notif.remove();
          }
        }, 300);
      }
    }, 10000);
  }
}

// Initialize
const moneyTrail = new MoneyTrailCalculator();
console.log('[Dr. DOM] Money Trail calculator active');