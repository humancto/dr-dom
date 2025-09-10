/**
 * Cookie Cleaner - Actually removes tracking cookies
 * Works with privacy-protection-suite.js to provide real cookie cleaning
 */

class CookieCleaner {
  constructor() {
    this.enabled = false;
    this.cleanedCount = 0;
    this.lastClean = null;
    this.cleanInterval = 30 * 60 * 1000; // 30 minutes default
    this.intervalId = null;
    
    // Essential cookies to keep (whitelist)
    this.essentialPatterns = [
      /^(session|sess|sid|jsessionid|phpsessid|aspsessionid)/i,
      /^(auth|authorization|authenticated|login|logged)/i,
      /^(csrf|xsrf|token|_token)/i,
      /^(cart|basket|checkout)/i,
      /^(preferences|settings|config)/i,
      /^(locale|language|lang|i18n)/i,
      /^(consent|gdpr|ccpa|privacy)/i
    ];
    
    // Known tracking cookies to remove (blacklist)
    this.trackingPatterns = [
      // Google
      /_ga$|^_ga_|^_gid$|^_gat|^__utm|^_gcl|^_gac_|^_dc_gtm_|^1P_JAR|^NID|^CONSENT|^ANID|^APISID|^HSID|^SAPISID|^SID|^SIDCC|^SSID/i,
      
      // Facebook/Meta
      /^fbm_|^fbsr_|^fbs_|^act$|^c_user|^datr|^dpr|^pl$|^presence|^sb$|^spin|^wd$|^xs$|^fr$/i,
      
      // Amazon
      /^ad-id|^ad-privacy|^session-id-time|^ubid-|^x-wl-uid|^sst-|^lc-|^s_cc|^s_sq|^s_vi|^s_fid/i,
      
      // Microsoft
      /^_clck|^_clsk|^MUID|^MC1|^MS0|^MS_CV|^MSC|^ai_user|^ai_session/i,
      
      // Adobe
      /^s_cc|^s_sq|^s_vi|^s_fid|^AMCV_|^AMCVS_|^demdex|^dextp/i,
      
      // Tracking services
      /^__qca|^_hjid|^_hjTLDTest|^_hjAbsoluteSessionInProgress|^_hjFirstSeen|^_hjIncludedInPageviewSample|^_hjIncludedInSessionSample/i,
      /^mp_|^mixpanel|^optimizely|^segment|^amplitude|^heap|^fullstory|^intercom/i,
      
      // Ad networks
      /^IDE$|^test_cookie|^id$|^uuid$|^uuid2$|^anjam|^anj$|^bounceClientVisit|^visitor-id/i,
      /^tuuid|^c$|^tuuid_lu|^TapAd_|^tapid|^criteo|^cto_|^outbrain|^obuid/i,
      
      // Other trackers
      /^_pinterest_|^_pin_unauth|^_derived_epik|^_epik|^_fbp$|^_fbc$|^_gcl_|^_rdt_uuid|^_uetsid|^_uetvid/i
    ];
    
    this.init();
  }

  async init() {
    // Load settings from storage
    const settings = await this.loadSettings();
    if (settings.enabled) {
      this.enable();
    }
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'TOGGLE_COOKIE_CLEANING') {
        if (request.enabled) {
          this.enable();
        } else {
          this.disable();
        }
        sendResponse({ success: true, enabled: this.enabled });
      } else if (request.type === 'CLEAN_COOKIES_NOW') {
        this.cleanNow().then(result => {
          sendResponse(result);
        });
        return true; // Keep message channel open for async response
      } else if (request.type === 'GET_COOKIE_STATS') {
        sendResponse({
          enabled: this.enabled,
          cleanedCount: this.cleanedCount,
          lastClean: this.lastClean,
          nextClean: this.getNextCleanTime()
        });
      }
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['cookie_cleaner_settings']);
      if (result.cookie_cleaner_settings) {
        this.cleanInterval = result.cookie_cleaner_settings.interval || this.cleanInterval;
        this.cleanedCount = result.cookie_cleaner_settings.totalCleaned || 0;
        return result.cookie_cleaner_settings;
      }
    } catch (error) {
      console.error('[Cookie Cleaner] Error loading settings:', error);
    }
    return { enabled: false };
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        cookie_cleaner_settings: {
          enabled: this.enabled,
          interval: this.cleanInterval,
          totalCleaned: this.cleanedCount,
          lastClean: this.lastClean
        }
      });
    } catch (error) {
      console.error('[Cookie Cleaner] Error saving settings:', error);
    }
  }

  enable() {
    if (this.enabled) return;
    
    this.enabled = true;
    
    // Clean cookies immediately
    this.cleanNow();
    
    // Set up interval for periodic cleaning
    this.intervalId = setInterval(() => {
      this.cleanNow();
    }, this.cleanInterval);
    
    this.saveSettings();
    console.log('[Cookie Cleaner] Enabled - cleaning every', this.cleanInterval / 1000 / 60, 'minutes');
  }

  disable() {
    if (!this.enabled) return;
    
    this.enabled = false;
    
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.saveSettings();
    console.log('[Cookie Cleaner] Disabled');
  }

  async cleanNow() {
    const startTime = Date.now();
    const results = {
      cookies: 0,
      localStorage: 0,
      sessionStorage: 0,
      indexedDB: 0,
      total: 0
    };

    try {
      // 1. Clean HTTP cookies via background script
      const cookieResult = await this.cleanCookies();
      results.cookies = cookieResult.cleaned;
      
      // 2. Clean localStorage
      results.localStorage = this.cleanLocalStorage();
      
      // 3. Clean sessionStorage
      results.sessionStorage = this.cleanSessionStorage();
      
      // 4. Clean IndexedDB for known trackers
      results.indexedDB = await this.cleanIndexedDB();
      
      results.total = results.cookies + results.localStorage + results.sessionStorage + results.indexedDB;
      
      // Update stats
      this.cleanedCount += results.total;
      this.lastClean = Date.now();
      this.saveSettings();
      
      // Report to storage for popup
      const domain = window.location.hostname;
      chrome.storage.local.set({
        [`drDOM_${domain}_cookie_clean`]: {
          timestamp: Date.now(),
          results: results,
          duration: Date.now() - startTime
        }
      });
      
      console.log(`[Cookie Cleaner] Cleaned ${results.total} tracking items`, results);
      
      return {
        success: true,
        cleaned: results,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('[Cookie Cleaner] Error during cleaning:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async cleanCookies() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'CLEAN_COOKIES',
        domain: window.location.hostname,
        trackingPatterns: this.trackingPatterns.map(p => p.toString()),
        essentialPatterns: this.essentialPatterns.map(p => p.toString())
      }, (response) => {
        resolve(response || { cleaned: 0 });
      });
    });
  }

  cleanLocalStorage() {
    let cleaned = 0;
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (this.isTrackingKey(key)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      cleaned++;
    });
    
    return cleaned;
  }

  cleanSessionStorage() {
    let cleaned = 0;
    const keysToRemove = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (this.isTrackingKey(key)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      cleaned++;
    });
    
    return cleaned;
  }

  async cleanIndexedDB() {
    let cleaned = 0;
    
    try {
      const databases = await indexedDB.databases();
      
      for (const db of databases) {
        if (this.isTrackingDatabase(db.name)) {
          await indexedDB.deleteDatabase(db.name);
          cleaned++;
        }
      }
    } catch (error) {
      // IndexedDB.databases() might not be available in all browsers
      console.warn('[Cookie Cleaner] Could not clean IndexedDB:', error);
    }
    
    return cleaned;
  }

  isTrackingKey(key) {
    // Check if key matches tracking patterns
    const trackingKeyPatterns = [
      /^_ga|^_gid|^_fbp|^_gcl|^amplitude|^mixpanel|^segment|^heap/i,
      /analytics|tracking|metrics|telemetry|beacon|pixel/i,
      /doubleclick|adsystem|advertising|marketing/i
    ];
    
    return trackingKeyPatterns.some(pattern => pattern.test(key));
  }

  isTrackingDatabase(name) {
    const trackingDBPatterns = [
      /google|facebook|analytics|mixpanel|segment|amplitude/i,
      /tracking|metrics|telemetry|advertising/i
    ];
    
    return trackingDBPatterns.some(pattern => pattern.test(name));
  }

  getNextCleanTime() {
    if (!this.enabled || !this.lastClean) return null;
    return this.lastClean + this.cleanInterval;
  }
}

// Initialize cookie cleaner
const cookieCleaner = new CookieCleaner();
console.log('[Dr. DOM] Cookie Cleaner initialized');

// Export for other modules
window.cookieCleaner = cookieCleaner;