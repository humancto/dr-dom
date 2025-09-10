/**
 * Tracker List Manager - Background Script
 * Loads and manages free, open-source tracker lists
 */

class TrackerListManager {
  constructor() {
    this.trackers = new Set();
    this.trackerDetails = new Map();
    this.lastUpdate = 0;
    
    // Simplified, focused tracker database from free sources
    this.initialize();
  }

  async initialize() {
    console.log('[Dr. DOM] Initializing tracker lists...');
    
    // Load from storage first
    const stored = await this.loadFromStorage();
    if (stored && Date.now() - stored.lastUpdate < 86400000) { // 24 hours
      console.log('[Dr. DOM] Using cached tracker lists');
      this.trackers = new Set(stored.trackers);
      return;
    }
    
    // Otherwise fetch fresh data
    await this.fetchTrackerLists();
  }

  async fetchTrackerLists() {
    try {
      // Use Disconnect.me list (it's JSON and easier to parse)
      const disconnectList = await this.fetchDisconnectList();
      
      // Also get Peter Lowe's list (simple text format)
      const peterLoweList = await this.fetchPeterLoweList();
      
      // Combine all trackers
      const allTrackers = [...disconnectList, ...peterLoweList];
      
      // Store in memory
      this.trackers = new Set(allTrackers);
      
      // Save to storage
      await this.saveToStorage(allTrackers);
      
      console.log(`[Dr. DOM] Loaded ${this.trackers.size} tracker domains`);
      
    } catch (error) {
      console.error('[Dr. DOM] Failed to fetch tracker lists:', error);
      // Fall back to built-in list
      this.loadBuiltInList();
    }
  }

  async fetchDisconnectList() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json');
      const data = await response.json();
      
      const trackers = [];
      
      // Parse Disconnect.me format
      if (data.categories) {
        Object.entries(data.categories).forEach(([category, companies]) => {
          Object.entries(companies).forEach(([company, info]) => {
            Object.entries(info).forEach(([key, domains]) => {
              if (Array.isArray(domains)) {
                domains.forEach(domain => {
                  trackers.push(domain);
                  this.trackerDetails.set(domain, {
                    company: company,
                    category: category
                  });
                });
              }
            });
          });
        });
      }
      
      return trackers;
    } catch (error) {
      console.error('[Dr. DOM] Disconnect list fetch failed:', error);
      return [];
    }
  }

  async fetchPeterLoweList() {
    try {
      const response = await fetch('https://pgl.yoyo.org/adservers/serverlist.txt');
      const text = await response.text();
      
      return text
        .split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.trim())
        .filter(domain => domain.length > 0);
        
    } catch (error) {
      console.error('[Dr. DOM] Peter Lowe list fetch failed:', error);
      return [];
    }
  }

  loadBuiltInList() {
    // Fallback: Most common trackers if online lists fail
    const builtInTrackers = [
      // Analytics
      'google-analytics.com', 'googletagmanager.com', 'google.com/analytics',
      'mixpanel.com', 'segment.io', 'segment.com',
      'amplitude.com', 'heap.io', 'hotjar.com',
      'fullstory.com', 'mouseflow.com', 'luckyorange.com',
      'matomo.org', 'plausible.io', 'simpleanalytics.com',
      
      // Advertising
      'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
      'facebook.com/tr', 'connect.facebook.net',
      'amazon-adsystem.com', 'amazon-adsystem.com/aax',
      'criteo.com', 'criteo.net',
      'pubmatic.com', 'openx.net', 'rubiconproject.com',
      'adsrvr.org', 'adnxs.com',
      
      // Social
      'platform.twitter.com', 'analytics.twitter.com',
      'platform.linkedin.com', 'px.ads.linkedin.com',
      'ct.pinterest.com', 'analytics.pinterest.com',
      'analytics.tiktok.com', 'analytics-sg.tiktok.com',
      'tr.snapchat.com',
      
      // Data Brokers
      'bluekai.com', 'krxd.net', 'exelator.com',
      'demdex.net', 'agkn.com', 'adsrvr.org',
      'turn.com', 'mathtag.com', 'rlcdn.com',
      
      // Fingerprinting
      'fingerprintjs.com', 'fpjs.io',
      'iovation.com', 'threatmetrix.com',
      
      // Customer Data
      'segment.com', 'branch.io', 'braze.com',
      'customer.io', 'intercom.io', 'drift.com',
      'hubspot.com', 'marketo.com', 'pardot.com',
      'klaviyo.com'
    ];
    
    this.trackers = new Set(builtInTrackers);
    console.log(`[Dr. DOM] Loaded ${this.trackers.size} built-in trackers`);
  }

  async saveToStorage(trackers) {
    try {
      await chrome.storage.local.set({
        trackerList: trackers.slice(0, 10000), // Limit size for storage
        trackerDetails: Object.fromEntries(this.trackerDetails),
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.error('[Dr. DOM] Failed to save trackers:', error);
    }
  }

  async loadFromStorage() {
    try {
      const data = await chrome.storage.local.get(['trackerList', 'trackerDetails', 'lastUpdate']);
      if (data.trackerList) {
        if (data.trackerDetails) {
          this.trackerDetails = new Map(Object.entries(data.trackerDetails));
        }
        return {
          trackers: data.trackerList,
          lastUpdate: data.lastUpdate || 0
        };
      }
    } catch (error) {
      console.error('[Dr. DOM] Failed to load from storage:', error);
    }
    return null;
  }

  isTracker(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Check exact match
      if (this.trackers.has(hostname)) {
        return {
          isTracker: true,
          domain: hostname,
          details: this.trackerDetails.get(hostname) || {}
        };
      }
      
      // Check if any tracker domain is in the hostname
      for (const tracker of this.trackers) {
        if (hostname.includes(tracker) || tracker.includes(hostname)) {
          return {
            isTracker: true,
            domain: tracker,
            details: this.trackerDetails.get(tracker) || {}
          };
        }
      }
    } catch (e) {
      // Invalid URL
    }
    
    return { isTracker: false };
  }

  getStats() {
    return {
      totalTrackers: this.trackers.size,
      hasDetails: this.trackerDetails.size,
      lastUpdate: this.lastUpdate
    };
  }
}

// Initialize the manager
const trackerManager = new TrackerListManager();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkTracker') {
    const result = trackerManager.isTracker(request.url);
    sendResponse(result);
  } else if (request.action === 'getTrackerStats') {
    sendResponse(trackerManager.getStats());
  }
  return true; // Keep channel open for async response
});

// Update tracker lists daily
chrome.alarms.create('updateTrackers', { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateTrackers') {
    trackerManager.fetchTrackerLists();
  }
});