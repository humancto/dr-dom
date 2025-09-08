/**
 * Free, Open-Source Tracker Lists Integration
 * All lists are freely available and legally usable
 */

class TrackerLists {
  constructor() {
    // These lists are all free and open source
    this.lists = {
      // EasyList family (used by AdBlock, uBlock Origin)
      easyprivacy: {
        url: 'https://easylist.to/easylist/easyprivacy.txt',
        name: 'EasyPrivacy',
        description: 'Blocks tracking, not ads',
        updateFrequency: 'daily'
      },
      
      // Disconnect.me (used by Firefox)
      disconnect: {
        url: 'https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json',
        name: 'Disconnect.me',
        description: 'Tracker database used by Firefox',
        updateFrequency: 'weekly'
      },
      
      // Peter Lowe's List
      peterLowe: {
        url: 'https://pgl.yoyo.org/adservers/serverlist.txt',
        name: "Peter Lowe's Ad/Tracking List",
        description: 'Long-standing tracker list',
        updateFrequency: 'weekly'
      },
      
      // Steven Black Hosts
      stevenBlack: {
        url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts',
        name: 'Steven Black Unified Hosts',
        description: 'Comprehensive hosts file',
        updateFrequency: 'daily'
      },
      
      // URLhaus by abuse.ch (malware URLs)
      urlhaus: {
        url: 'https://urlhaus.abuse.ch/downloads/json/',
        name: 'URLhaus Malware List',
        description: 'Active malware URLs',
        updateFrequency: '5 minutes'
      }
    };

    // Cache for parsed lists
    this.cache = {
      domains: new Set(),
      patterns: [],
      lastUpdate: null
    };
  }

  /**
   * Load and parse Disconnect.me list (easiest to use)
   */
  async loadDisconnectList() {
    try {
      const response = await fetch(this.lists.disconnect.url);
      const data = await response.json();
      
      const trackers = new Set();
      
      // Parse the Disconnect format
      Object.entries(data.categories).forEach(([category, companies]) => {
        Object.entries(companies).forEach(([company, domains]) => {
          Object.values(domains).forEach(domainList => {
            domainList.forEach(domain => {
              trackers.add(domain);
            });
          });
        });
      });
      
      return Array.from(trackers);
    } catch (error) {
      console.error('Failed to load Disconnect list:', error);
      return [];
    }
  }

  /**
   * Load Peter Lowe's list (simple domain list)
   */
  async loadPeterLoweList() {
    try {
      const response = await fetch(this.lists.peterLowe.url);
      const text = await response.text();
      
      const domains = text
        .split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.trim());
      
      return domains;
    } catch (error) {
      console.error('Failed to load Peter Lowe list:', error);
      return [];
    }
  }

  /**
   * Parse EasyPrivacy (more complex but comprehensive)
   */
  async loadEasyPrivacy() {
    try {
      const response = await fetch(this.lists.easyprivacy.url);
      const text = await response.text();
      
      const domains = new Set();
      const patterns = [];
      
      text.split('\n').forEach(line => {
        line = line.trim();
        
        // Skip comments and empty lines
        if (!line || line.startsWith('!')) return;
        
        // Domain rules (||domain.com^)
        if (line.startsWith('||') && line.endsWith('^')) {
          const domain = line.slice(2, -1);
          domains.add(domain);
        }
        // URL patterns
        else if (line.includes('*') || line.includes('?')) {
          patterns.push(line);
        }
      });
      
      return {
        domains: Array.from(domains),
        patterns: patterns
      };
    } catch (error) {
      console.error('Failed to load EasyPrivacy:', error);
      return { domains: [], patterns: [] };
    }
  }

  /**
   * Check if a URL is a tracker
   */
  isTracker(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Check against cached domains
      for (const domain of this.cache.domains) {
        if (hostname.includes(domain)) {
          return {
            isTracker: true,
            domain: domain,
            url: url
          };
        }
      }
      
      // Check patterns (simplified)
      for (const pattern of this.cache.patterns) {
        const regex = this.patternToRegex(pattern);
        if (regex.test(url)) {
          return {
            isTracker: true,
            pattern: pattern,
            url: url
          };
        }
      }
    } catch (e) {
      // Invalid URL
    }
    
    return { isTracker: false };
  }

  /**
   * Convert EasyList pattern to regex (simplified)
   */
  patternToRegex(pattern) {
    // This is a simplified conversion
    let regex = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\^/g, '[^a-zA-Z0-9]');
    
    return new RegExp(regex, 'i');
  }

  /**
   * Initialize with free lists
   */
  async initialize() {
    console.log('Loading free tracker lists...');
    
    // Load multiple lists in parallel
    const [disconnect, peterLowe, easyPrivacy] = await Promise.all([
      this.loadDisconnectList(),
      this.loadPeterLoweList(),
      this.loadEasyPrivacy()
    ]);
    
    // Combine all domains
    disconnect.forEach(d => this.cache.domains.add(d));
    peterLowe.forEach(d => this.cache.domains.add(d));
    if (easyPrivacy.domains) {
      easyPrivacy.domains.forEach(d => this.cache.domains.add(d));
    }
    
    // Add patterns from EasyPrivacy
    if (easyPrivacy.patterns) {
      this.cache.patterns = easyPrivacy.patterns.slice(0, 1000); // Limit for performance
    }
    
    this.cache.lastUpdate = Date.now();
    
    console.log(`Loaded ${this.cache.domains.size} tracker domains and ${this.cache.patterns.length} patterns`);
    
    return {
      domains: this.cache.domains.size,
      patterns: this.cache.patterns.length
    };
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalDomains: this.cache.domains.size,
      totalPatterns: this.cache.patterns.length,
      lastUpdate: this.cache.lastUpdate,
      sources: Object.keys(this.lists).length
    };
  }
}

// For Chrome Extension context
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Store in extension storage for persistence
  const trackerLists = new TrackerLists();
  
  // Initialize on install
  chrome.runtime.onInstalled.addListener(() => {
    trackerLists.initialize().then(stats => {
      console.log('Tracker lists initialized:', stats);
      
      // Store in chrome.storage for content scripts
      chrome.storage.local.set({
        trackerDomains: Array.from(trackerLists.cache.domains).slice(0, 10000), // Limit size
        trackerListStats: stats,
        lastUpdate: Date.now()
      });
    });
  });
  
  // Update daily
  chrome.alarms.create('updateTrackerLists', { periodInMinutes: 1440 }); // 24 hours
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateTrackerLists') {
      trackerLists.initialize();
    }
  });
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrackerLists;
}