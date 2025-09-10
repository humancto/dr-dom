/**
 * Dr. DOM Fun Features - Humor, Weather Report, Cookie Banner
 * Making privacy protection entertaining!
 */

class DrDOMFunFeatures {
  constructor() {
    this.domain = window.location.hostname;
    this.waitForDOM();
  }

  waitForDOM() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('🎭 [Dr. DOM Fun Features] Initializing entertainment mode...');
    
    // Show cookie banner with personality after DOM is ready
    setTimeout(() => this.showCookieBanner(), 2000);
    
    // Generate privacy weather report
    this.generateWeatherReport();
    
    // Prepare roast content
    this.prepareRoast();
  }

  // ============= COOKIE BANNER WITH PERSONALITY =============
  showCookieBanner() {
    // Check if already shown today (disabled for testing)
    const lastShown = localStorage.getItem('drdom_cookie_banner_shown');
    const today = new Date().toDateString();
    
    // Comment out for testing - always show banner
    // if (lastShown === today) return;
    
    const banner = document.createElement('div');
    banner.id = 'drdom-cookie-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 500px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: slideUp 0.5s ease;
    `;
    
    const cookieCount = document.cookie.split(';').length;
    const trackerCount = document.querySelectorAll('script[src*="google"], script[src*="facebook"]').length;
    
    const messages = [
      `🍪 This site wants to stuff ${cookieCount} cookies down your browser's throat. We said "no thanks" to the sketchy ones!`,
      `🕵️ Caught ${trackerCount} trackers red-handed trying to follow you. We gave them the slip!`,
      `🎭 This website thinks it knows you. Plot twist: we're feeding it fake data!`,
      `🚨 Breaking: ${cookieCount} cookies attempted a heist on your data. We called the privacy police!`,
      `🎪 Welcome to the privacy circus! We're the bouncers, and ${trackerCount} trackers just got rejected at the door.`,
      `🏴‍☠️ Ahoy! We've plundered ${cookieCount} tracking cookies and made them walk the privacy plank!`
    ];
    
    const roasts = [
      `This site has more trackers than a detective agency! 🕵️`,
      `${this.domain} collects data like it's Pokemon cards! 📇`,
      `Privacy policy? More like "Privacy? LOL-icy" 😂`,
      `This site's cookies are thirstier than a marathon runner! 🏃‍♂️`,
      `${trackerCount} trackers? That's not a website, that's a stalker convention! 👀`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    
    banner.innerHTML = `
      <div style="display: flex; align-items: start; gap: 15px;">
        <img src="${chrome.runtime.getURL('assets/icon-48.png')}" style="width: 48px; height: 48px; border-radius: 8px; animation: bounce 2s infinite;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
            Dr. DOM Privacy Protection Active!
          </h3>
          <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; opacity: 0.95;">
            ${randomMessage}
          </p>
          <p style="margin: 0 0 15px 0; font-size: 13px; font-style: italic; opacity: 0.9;">
            💬 "${randomRoast}"
          </p>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 12px; opacity: 0.8;">
              Auto-dismissing in <span id="drdom-countdown">10</span>s
            </span>
          </div>
        </div>
        <button id="drdom-close-banner" style="
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          transition: opacity 0.2s;
        ">×</button>
      </div>
      
      <style>
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        #drdom-close-banner:hover {
          opacity: 1;
        }
      </style>
    `;
    
    // Ensure body exists before appending
    if (document.body) {
      document.body.appendChild(banner);
    } else {
      // Wait for body to be available
      const observer = new MutationObserver(() => {
        if (document.body) {
          document.body.appendChild(banner);
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    
    // Countdown timer
    let countdown = 10;
    const countdownEl = document.getElementById('drdom-countdown');
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdownEl) countdownEl.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        this.closeBanner();
      }
    }, 1000);
    
    // Close button handler
    document.getElementById('drdom-close-banner')?.addEventListener('click', () => {
      clearInterval(countdownInterval);
      this.closeBanner();
    });
    
    // Mark as shown today
    localStorage.setItem('drdom_cookie_banner_shown', today);
  }

  closeBanner() {
    const banner = document.getElementById('drdom-cookie-banner');
    if (banner) {
      banner.style.animation = 'slideUp 0.5s ease reverse';
      setTimeout(() => banner.remove(), 500);
    }
  }

  showThankYou() {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      z-index: 2147483647;
      animation: slideIn 0.3s ease;
      font-family: -apple-system, sans-serif;
    `;
    toast.innerHTML = '✅ Your privacy is safe with Dr. DOM!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============= PRIVACY WEATHER REPORT =============
  generateWeatherReport() {
    // Analyze page privacy conditions
    const cookies = document.cookie.split(';').length;
    const scripts = document.querySelectorAll('script[src]').length;
    const trackers = document.querySelectorAll('[src*="google-analytics"], [src*="facebook"], [src*="doubleclick"]').length;
    const iframes = document.querySelectorAll('iframe').length;
    const https = window.location.protocol === 'https:';
    
    // Calculate privacy score
    let score = 100;
    score -= Math.min(cookies * 2, 30);
    score -= Math.min(trackers * 5, 40);
    score -= Math.min(iframes * 3, 20);
    if (!https) score -= 20;
    
    score = Math.max(0, score);
    
    // Generate weather conditions
    let weather, temperature, conditions, forecast, advice;
    
    if (score >= 90) {
      weather = '☀️';
      temperature = 'HOT';
      conditions = 'Clear Privacy Skies';
      forecast = 'Perfect conditions for anonymous browsing!';
      advice = 'Enjoy the sunshine, your data is safe!';
    } else if (score >= 70) {
      weather = '⛅';
      temperature = 'WARM';
      conditions = 'Partly Tracked';
      forecast = 'A few tracking clouds on the horizon.';
      advice = 'Mostly clear, but keep your privacy umbrella handy.';
    } else if (score >= 50) {
      weather = '☁️';
      temperature = 'COOL';
      conditions = 'Overcast with Cookies';
      forecast = 'Moderate tracking activity detected.';
      advice = 'Consider enabling stricter privacy settings.';
    } else if (score >= 30) {
      weather = '🌧️';
      temperature = 'COLD';
      conditions = 'Privacy Storm Warning';
      forecast = 'Heavy tracker precipitation expected!';
      advice = 'Seek shelter in incognito mode immediately!';
    } else {
      weather = '⛈️';
      temperature = 'FREEZING';
      conditions = 'Privacy Hurricane!';
      forecast = 'CATASTROPHIC DATA LEAKAGE IN PROGRESS!';
      advice = 'EVACUATE TO A VPN IMMEDIATELY!';
    }
    
    // Store weather report
    const report = {
      score,
      weather,
      temperature,
      conditions,
      forecast,
      advice,
      details: {
        cookies,
        trackers,
        scripts,
        iframes,
        https
      },
      timestamp: Date.now()
    };
    
    chrome.storage.local.set({
      [`drDOM_${this.domain}_weather`]: report
    });
    
    console.log(`${weather} Privacy Weather: ${temperature} - ${conditions}`);
    
    return report;
  }

  // ============= WEBSITE ROAST =============
  prepareRoast() {
    const cookies = document.cookie.split(';').length;
    const trackers = document.querySelectorAll('[src*="google-analytics"], [src*="facebook"], [src*="doubleclick"]').length;
    const passwords = document.querySelectorAll('input[type="password"]:not([autocomplete="off"])').length;
    const https = window.location.protocol === 'https:';
    const popups = 0; // We'll count these as they appear
    
    const roasts = [];
    
    // Cookie roasts
    if (cookies > 20) {
      roasts.push(`🍪 ${cookies} cookies? Is this a website or a bakery? Gordon Ramsay would be disgusted!`);
    } else if (cookies > 10) {
      roasts.push(`🍪 ${cookies} cookies? Someone's got a sweet tooth for your data!`);
    }
    
    // Tracker roasts
    if (trackers > 10) {
      roasts.push(`🕵️ ${trackers} trackers? This site has more stalkers than a celebrity!`);
    } else if (trackers > 5) {
      roasts.push(`👀 ${trackers} trackers following you around like lost puppies. Creepy much?`);
    }
    
    // HTTPS roasts
    if (!https) {
      roasts.push(`🔓 No HTTPS in 2024? That's like leaving your front door open with a sign saying "Rob me!"`);
    }
    
    // Password field roasts
    if (passwords > 0) {
      roasts.push(`🔑 Password fields without autocomplete="off"? Your security is more outdated than a flip phone!`);
    }
    
    // Domain-specific roasts
    const domainRoasts = {
      'facebook.com': `📘 Facebook? More like "Faceplant" into a privacy nightmare!`,
      'google.com': `🔍 Google knows what you had for breakfast. And lunch. And that embarrassing search at 2 AM.`,
      'amazon.com': `📦 Amazon's tracking you harder than a Prime delivery truck!`,
      'twitter.com': `🐦 Twitter's collecting more data than tweets. That's saying something!`,
      'instagram.com': `📸 Instagram: Come for the photos, stay because we won't let your data leave!`,
      'tiktok.com': `🎵 TikTok's algorithm knows you better than your therapist!`,
      'linkedin.com': `💼 LinkedIn: Professional networking, amateur privacy!`,
      'reddit.com': `🤖 Reddit: Where your data goes to be anonymously not anonymous!`
    };
    
    // Add domain-specific roast if available
    for (const [domain, roast] of Object.entries(domainRoasts)) {
      if (this.domain.includes(domain.replace('.com', ''))) {
        roasts.push(roast);
        break;
      }
    }
    
    // General roasts based on page analysis
    const images = document.querySelectorAll('img').length;
    if (images > 100) {
      roasts.push(`📸 ${images} images? This site loads slower than dial-up internet!`);
    }
    
    const scripts = document.querySelectorAll('script').length;
    if (scripts > 50) {
      roasts.push(`📜 ${scripts} scripts? This website has more JavaScript than a coffee shop!`);
    }
    
    // Meta roasts
    if (roasts.length === 0) {
      roasts.push(`🤔 This site is so boring, even the trackers fell asleep!`);
    }
    
    // Store roasts
    chrome.storage.local.set({
      [`drDOM_${this.domain}_roasts`]: {
        roasts,
        stats: {
          cookies,
          trackers,
          https,
          passwords
        },
        timestamp: Date.now()
      }
    });
    
    return roasts;
  }

  // ============= PRIVACY REPORT MODAL =============
  showPrivacyReport() {
    this.closeBanner();
    
    const modal = document.createElement('div');
    modal.id = 'drdom-privacy-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483648;
      animation: fadeIn 0.3s ease;
    `;
    
    const weather = this.generateWeatherReport();
    const roasts = this.prepareRoast();
    
    // Continue with the rest of showPrivacyReport...
    // (keeping original combined report for banner button)
  }
  
  // ============= ROAST-ONLY MODAL =============  
  showRoastModal() {
    this.closeBanner();
    
    const modal = document.createElement('div');
    modal.id = 'drdom-roast-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483648;
      animation: fadeIn 0.3s ease;
    `;
    
    const roasts = this.prepareRoast();
    const cookies = document.cookie.split(';').length;
    const trackers = document.querySelectorAll('[src*="google-analytics"], [src*="facebook"], [src*="doubleclick"]').length;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.5s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    
    content.innerHTML = `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      </style>
      
      <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #333; display: flex; align-items: center; gap: 10px;">
        🔥 Dr. DOM's Savage Website Roast
      </h2>
      
      <div style="background: linear-gradient(135deg, #ff6b6b, #ff8787); color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px;">🎭 The Roasts Are In!</h3>
        ${roasts.map(roast => `
          <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 10px;">
            ${roast}
          </div>
        `).join('')}
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
        <div style="background: #fef3c7; padding: 15px; border-radius: 10px;">
          <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${cookies}</div>
          <div style="font-size: 12px; color: #92400e;">Cookies Caught</div>
        </div>
        <div style="background: #fee2e2; padding: 15px; border-radius: 10px;">
          <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${trackers}</div>
          <div style="font-size: 12px; color: #991b1b;">Trackers Exposed</div>
        </div>
      </div>
      
      <button id="drdom-close-roast" style="
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
      ">
        😅 OK, I've Been Roasted Enough!
      </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close button handler
    document.getElementById('drdom-close-roast')?.addEventListener('click', () => {
      modal.style.animation = 'fadeIn 0.3s ease reverse';
      setTimeout(() => modal.remove(), 300);
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => modal.remove(), 300);
      }
    });
  }
  
  // ============= WEATHER-ONLY MODAL =============
  showWeatherModal() {
    this.closeBanner();
    
    const modal = document.createElement('div');
    modal.id = 'drdom-weather-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483648;
      animation: fadeIn 0.3s ease;
    `;
    
    const weather = this.generateWeatherReport();
    
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        animation: slideUp 0.3s ease;
      ">
        <button id="drdom-close-modal" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: transparent;
          border: none;
          font-size: 30px;
          cursor: pointer;
          color: #666;
        ">×</button>
        
        <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">
          🔍 Dr. DOM's Privacy Diagnosis for ${this.domain}
        </h2>
        
        <!-- Weather Report -->
        <div style="
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
        ">
          <div style="font-size: 48px; text-align: center;">${weather.weather}</div>
          <h3 style="text-align: center; margin: 10px 0; font-size: 20px;">
            Privacy Weather: ${weather.temperature}
          </h3>
          <p style="text-align: center; margin: 5px 0; opacity: 0.95;">
            ${weather.conditions}
          </p>
          <p style="text-align: center; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
            ${weather.forecast}
          </p>
        </div>
        
        <!-- Stats -->
        <div style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        ">
          <div style="
            background: #f3f4f6;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
          ">
            <div style="font-size: 24px; font-weight: bold; color: #667eea;">
              ${weather.details.cookies}
            </div>
            <div style="font-size: 12px; color: #666;">Cookies</div>
          </div>
          <div style="
            background: #f3f4f6;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
          ">
            <div style="font-size: 24px; font-weight: bold; color: #ef4444;">
              ${weather.details.trackers}
            </div>
            <div style="font-size: 12px; color: #666;">Trackers</div>
          </div>
        </div>
        
        <!-- Weather Advice -->
        <div style="
          background: #fef3c7;
          border: 2px solid #f59e0b;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
        ">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">
            🌡️ Weather Advisory:
          </h4>
          <p style="margin: 5px 0; color: #78350f; font-size: 14px;">
            ${weather.advice}
          </p>
        </div>
        <div style="
          background: #dcfce7;
          border: 2px solid #10b981;
          padding: 15px;
          border-radius: 10px;
        ">
          <h4 style="margin: 0 0 10px 0; color: #14532d;">
            💊 Dr. DOM's Prescription:
          </h4>
          <p style="margin: 0; color: #166534; font-size: 14px;">
            ${weather.advice}
          </p>
        </div>
        
        <style>
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        </style>
      </div>
    `;
    
    // Ensure body exists before appending
    if (document.body) {
      document.body.appendChild(modal);
    }
    
    document.getElementById('drdom-close-modal')?.addEventListener('click', () => {
      modal.style.animation = 'fadeIn 0.3s ease reverse';
      setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => modal.remove(), 300);
      }
    });
  }
}

// Initialize fun features
const funFeatures = new DrDOMFunFeatures();
// Expose globally for testing
window.funFeatures = funFeatures;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('🎭 [Fun Features] Received message:', request.action);
  
  if (request.action === 'showRoast') {
    // Trigger the honest reviews roast modal
    if (window.honestReviews) {
      window.honestReviews.displayReview();
    } else {
      // Fallback to fun features roast
      funFeatures.showRoastModal();
    }
    console.log('🔥 Showing roast modal');
    sendResponse({ success: true });
  } else if (request.action === 'getWeatherReport') {
    // Show weather-specific modal
    funFeatures.showWeatherModal();
    console.log('🌤️ Showing weather modal');
    sendResponse({ success: true });
  } else if (request.action === 'showCookieBanner') {
    funFeatures.showCookieBanner();
    console.log('🍪 Cookie banner triggered');
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});

console.log('🎭 [Dr. DOM] Fun features activated - Let the roasting begin!');