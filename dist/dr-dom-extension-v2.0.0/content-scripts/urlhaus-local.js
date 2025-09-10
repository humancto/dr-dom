/**
 * URLhaus Local Database - Offline malware detection
 * Downloads and caches URLhaus database locally to avoid API rate limits
 */

class URLhausLocal {
  constructor() {
    this.dbVersion = '1.0.0';
    this.dbUrl = 'https://urlhaus.abuse.ch/downloads/csv/'; // Active malware URLs
    this.updateInterval = 6 * 60 * 60 * 1000; // 6 hours (respecting 5-minute minimum)
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB max cache
    this.maliciousUrls = new Set();
    this.maliciousDomains = new Set();
    this.lastUpdate = null;
    
    this.init();
  }

  async init() {
    console.log('[URLhaus Local] Initializing local database...');
    
    // Load cached database from storage
    await this.loadCachedDatabase();
    
    // Check if update needed
    if (this.shouldUpdate()) {
      this.scheduleUpdate();
    }
    
    // Start checking current page
    this.checkCurrentPage();
  }

  async loadCachedDatabase() {
    try {
      const result = await chrome.storage.local.get(['urlhaus_db', 'urlhaus_metadata']);
      
      if (result.urlhaus_metadata) {
        this.lastUpdate = result.urlhaus_metadata.lastUpdate;
        console.log('[URLhaus Local] Loaded metadata, last update:', new Date(this.lastUpdate));
      }
      
      if (result.urlhaus_db) {
        // Parse cached database
        const lines = result.urlhaus_db.split('\n');
        let count = 0;
        
        for (const line of lines) {
          if (line.startsWith('#') || !line.trim()) continue;
          
          // CSV format: id,dateadded,url,url_status,threat,tags,link,reporter
          const parts = this.parseCSVLine(line);
          if (parts.length >= 3) {
            const url = parts[2];
            if (url) {
              this.maliciousUrls.add(url);
              
              // Extract domain
              try {
                const urlObj = new URL(url);
                this.maliciousDomains.add(urlObj.hostname);
              } catch (e) {
                // Invalid URL, skip
              }
              
              count++;
            }
          }
        }
        
        console.log(`[URLhaus Local] Loaded ${count} malicious URLs from cache`);
      }
    } catch (error) {
      console.error('[URLhaus Local] Error loading cached database:', error);
    }
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      result.push(current.trim());
    }
    
    return result;
  }

  shouldUpdate() {
    if (!this.lastUpdate) return true;
    
    const now = Date.now();
    const timeSinceUpdate = now - this.lastUpdate;
    
    return timeSinceUpdate > this.updateInterval;
  }

  scheduleUpdate() {
    // Update immediately, then schedule regular updates
    this.updateDatabase();
    
    // Schedule periodic updates
    setInterval(() => {
      this.updateDatabase();
    }, this.updateInterval);
  }

  async updateDatabase() {
    console.log('[URLhaus Local] Updating database from URLhaus...');
    
    try {
      // Use background script to fetch (avoids CORS)
      chrome.runtime.sendMessage({
        type: 'URLHAUS_UPDATE',
        url: this.dbUrl
      }, async (response) => {
        if (response && response.success) {
          await this.processDatabase(response.data);
        } else {
          console.error('[URLhaus Local] Failed to update database:', response?.error);
          
          // Fall back to lightweight list if main database fails
          this.updateLightweightList();
        }
      });
    } catch (error) {
      console.error('[URLhaus Local] Error updating database:', error);
    }
  }

  async updateLightweightList() {
    // Use the plain text list as fallback (smaller, just URLs)
    const plainTextUrl = 'https://urlhaus.abuse.ch/downloads/text/';
    
    chrome.runtime.sendMessage({
      type: 'URLHAUS_UPDATE',
      url: plainTextUrl
    }, async (response) => {
      if (response && response.success) {
        await this.processPlainTextList(response.data);
      }
    });
  }

  async processDatabase(csvData) {
    try {
      // Clear existing data
      this.maliciousUrls.clear();
      this.maliciousDomains.clear();
      
      const lines = csvData.split('\n');
      let count = 0;
      
      for (const line of lines) {
        if (line.startsWith('#') || !line.trim()) continue;
        
        const parts = this.parseCSVLine(line);
        if (parts.length >= 3) {
          const url = parts[2];
          const status = parts[3];
          
          // Only include active threats
          if (url && status === 'online') {
            this.maliciousUrls.add(url);
            
            try {
              const urlObj = new URL(url);
              this.maliciousDomains.add(urlObj.hostname);
            } catch (e) {
              // Invalid URL
            }
            
            count++;
          }
        }
        
        // Limit database size
        if (count > 100000) break; // Keep only top 100k entries
      }
      
      // Store in chrome.storage with size limit
      const dataToStore = csvData.length > this.maxCacheSize 
        ? csvData.substring(0, this.maxCacheSize)
        : csvData;
      
      await chrome.storage.local.set({
        urlhaus_db: dataToStore,
        urlhaus_metadata: {
          lastUpdate: Date.now(),
          version: this.dbVersion,
          entryCount: count
        }
      });
      
      this.lastUpdate = Date.now();
      console.log(`[URLhaus Local] Database updated with ${count} malicious URLs`);
      
      // Check current page after update
      this.checkCurrentPage();
    } catch (error) {
      console.error('[URLhaus Local] Error processing database:', error);
    }
  }

  async processPlainTextList(textData) {
    try {
      this.maliciousUrls.clear();
      this.maliciousDomains.clear();
      
      const lines = textData.split('\n');
      let count = 0;
      
      for (const line of lines) {
        const url = line.trim();
        if (url && !url.startsWith('#')) {
          this.maliciousUrls.add(url);
          
          try {
            const urlObj = new URL(url);
            this.maliciousDomains.add(urlObj.hostname);
          } catch (e) {
            // Invalid URL
          }
          
          count++;
          
          // Limit for performance
          if (count > 50000) break;
        }
      }
      
      console.log(`[URLhaus Local] Loaded ${count} URLs from plain text list`);
      
      // Store lightweight version
      await chrome.storage.local.set({
        urlhaus_lightweight: {
          domains: Array.from(this.maliciousDomains).slice(0, 10000),
          lastUpdate: Date.now()
        }
      });
      
      this.checkCurrentPage();
    } catch (error) {
      console.error('[URLhaus Local] Error processing plain text list:', error);
    }
  }

  checkCurrentPage() {
    const currentUrl = window.location.href;
    const currentDomain = window.location.hostname;
    
    const threats = [];
    
    // Check exact URL match
    if (this.maliciousUrls.has(currentUrl)) {
      threats.push({
        type: 'exact_match',
        severity: 'critical',
        message: 'This exact URL is known to distribute malware',
        source: 'URLhaus Database'
      });
    }
    
    // Check domain
    if (this.maliciousDomains.has(currentDomain)) {
      threats.push({
        type: 'domain_match',
        severity: 'high',
        message: 'This domain has been used to distribute malware',
        source: 'URLhaus Database'
      });
    }
    
    // Check all loaded resources
    this.checkPageResources();
    
    // Store results
    if (threats.length > 0) {
      this.reportThreats(threats);
    }
    
    return threats;
  }

  checkPageResources() {
    // Check all scripts, images, and iframes
    const resources = [
      ...document.querySelectorAll('script[src]'),
      ...document.querySelectorAll('img[src]'),
      ...document.querySelectorAll('iframe[src]'),
      ...document.querySelectorAll('link[href]')
    ];
    
    const maliciousResources = [];
    
    resources.forEach(element => {
      const url = element.src || element.href;
      if (!url) return;
      
      // Check if resource URL is malicious
      if (this.maliciousUrls.has(url)) {
        maliciousResources.push({
          type: element.tagName.toLowerCase(),
          url: url,
          severity: 'high',
          message: `Malicious ${element.tagName.toLowerCase()} detected`
        });
      }
      
      // Check domain
      try {
        const urlObj = new URL(url);
        if (this.maliciousDomains.has(urlObj.hostname)) {
          maliciousResources.push({
            type: element.tagName.toLowerCase(),
            url: url,
            domain: urlObj.hostname,
            severity: 'medium',
            message: `Resource from malicious domain: ${urlObj.hostname}`
          });
        }
      } catch (e) {
        // Invalid URL
      }
    });
    
    if (maliciousResources.length > 0) {
      console.warn('[URLhaus Local] Malicious resources detected:', maliciousResources);
      this.reportThreats(maliciousResources);
    }
  }

  reportThreats(threats) {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}_urlhaus_local`;
    
    chrome.storage.local.set({
      [storageKey]: {
        threats: threats,
        timestamp: Date.now(),
        url: window.location.href,
        databaseVersion: this.dbVersion,
        lastDatabaseUpdate: this.lastUpdate,
        source: 'local_database'
      }
    });
    
    // Send message to popup
    chrome.runtime.sendMessage({
      type: 'URLHAUS_THREAT_DETECTED',
      threats: threats,
      source: 'local'
    });
  }

  // Check a specific URL against local database
  checkUrl(url) {
    if (this.maliciousUrls.has(url)) {
      return { malicious: true, type: 'exact_match' };
    }
    
    try {
      const urlObj = new URL(url);
      if (this.maliciousDomains.has(urlObj.hostname)) {
        return { malicious: true, type: 'domain_match' };
      }
    } catch (e) {
      // Invalid URL
    }
    
    return { malicious: false };
  }

  // Get database statistics
  getStats() {
    return {
      totalUrls: this.maliciousUrls.size,
      totalDomains: this.maliciousDomains.size,
      lastUpdate: this.lastUpdate,
      nextUpdate: this.lastUpdate ? this.lastUpdate + this.updateInterval : null,
      databaseVersion: this.dbVersion
    };
  }
}

// Initialize
const urlhausLocal = new URLhausLocal();
console.log('[Dr. DOM] URLhaus local database initialized');

// Export for use by other modules
window.urlhausLocal = urlhausLocal;