/**
 * Privacy Tracker - Integrates with live-capture.js
 * Uses real tracker lists to detect and analyze privacy threats
 */

(() => {
  'use strict';
  
  // Import the enhanced tracker detector patterns
  const TRACKER_DATABASE = {
    // Analytics & Metrics
    analytics: [
      'google-analytics.com', 'googletagmanager.com', 'google.com/analytics',
      'segment.io', 'segment.com', 'cdn.segment.com',
      'mixpanel.com', 'cdn.mxpnl.com', 'api.mixpanel.com',
      'amplitude.com', 'cdn.amplitude.com',
      'heap.io', 'heapanalytics.com', 'cdn.heapanalytics.com',
      'hotjar.com', 'static.hotjar.com', 'script.hotjar.com',
      'fullstory.com', 'fullstory.com/rec',
      'mouseflow.com', 'luckyorange.com', 'crazyegg.com',
      'matomo.org', 'plausible.io', 'simpleanalytics.com'
    ],
    
    // Advertising
    advertising: [
      'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
      'facebook.com/tr', 'connect.facebook.net', 'facebook.com/en_US/fbevents.js',
      'amazon-adsystem.com', 'amazontag.com',
      'criteo.com', 'criteo.net', 'static.criteo.net',
      'pubmatic.com', 'openx.net', 'rubiconproject.com',
      'adsrvr.org', 'adnxs.com', 'taboola.com', 'outbrain.com'
    ],
    
    // Social Media
    social: [
      'facebook.com/plugins', 'platform.twitter.com', 'platform.linkedin.com',
      'px.ads.linkedin.com', 'ct.pinterest.com', 'analytics.tiktok.com',
      'tr.snapchat.com', 'instagram.com/embed', 'reddit.com/static/pixel'
    ],
    
    // Data Brokers
    dataBrokers: [
      'bluekai.com', 'krxd.net', 'exelator.com', 'demdex.net',
      'agkn.com', 'turn.com', 'mathtag.com', 'rlcdn.com',
      'eyeota.net', 'bidtheatre.com', 'owneriq.net'
    ],
    
    // Fingerprinting
    fingerprinting: [
      'fingerprintjs.com', 'fpjs.io', 'cdn.fpjs.io',
      'iovation.com', 'threatmetrix.com', 'siftscience.com'
    ]
  };

  // Check if URL is a tracker
  function checkTracker(url) {
    if (!url) return null;
    
    const urlLower = url.toLowerCase();
    
    for (const [category, trackers] of Object.entries(TRACKER_DATABASE)) {
      for (const tracker of trackers) {
        if (urlLower.includes(tracker)) {
          return {
            isTracker: true,
            url: url,
            domain: tracker,
            category: category,
            severity: getSeverity(category),
            timestamp: Date.now()
          };
        }
      }
    }
    
    return null;
  }
  
  function getSeverity(category) {
    const severities = {
      fingerprinting: 'critical',
      dataBrokers: 'high',
      advertising: 'high',
      social: 'medium',
      analytics: 'medium'
    };
    return severities[category] || 'low';
  }
  
  // Analyze privacy and calculate score
  function analyzePrivacy() {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}`;
    
    chrome.storage.local.get(storageKey, (result) => {
      const data = result[storageKey];
      if (!data) return;
      
      const requests = data.requests || [];
      const detectedTrackers = [];
      const trackersByCategory = {};
      const trackerCompanies = new Set();
      
      // Check each request against tracker database
      requests.forEach(req => {
        const tracker = checkTracker(req.url);
        if (tracker) {
          detectedTrackers.push(tracker);
          
          // Group by category
          if (!trackersByCategory[tracker.category]) {
            trackersByCategory[tracker.category] = [];
          }
          trackersByCategory[tracker.category].push(tracker);
          
          // Extract company from domain
          const company = tracker.domain.split('.')[0];
          trackerCompanies.add(company);
        }
      });
      
      // Calculate privacy score
      let score = 100;
      
      // Deduct based on tracker categories
      Object.entries(trackersByCategory).forEach(([category, trackers]) => {
        const count = trackers.length;
        switch(category) {
          case 'fingerprinting':
            score -= count * 15; // Severe penalty
            break;
          case 'dataBrokers':
            score -= count * 10;
            break;
          case 'advertising':
            score -= count * 5;
            break;
          case 'social':
            score -= count * 4;
            break;
          case 'analytics':
            score -= count * 3;
            break;
        }
      });
      
      // Additional penalty for variety of trackers
      if (trackerCompanies.size > 10) score -= 20;
      else if (trackerCompanies.size > 5) score -= 10;
      
      score = Math.max(0, Math.min(100, score));
      
      // Generate privacy grade
      let grade = 'A';
      if (score < 30) grade = 'F';
      else if (score < 50) grade = 'D';
      else if (score < 70) grade = 'C';
      else if (score < 85) grade = 'B';
      
      // Privacy insights
      const insights = [];
      
      if (trackersByCategory.fingerprinting?.length > 0) {
        insights.push({
          type: 'critical',
          message: `⚠️ ${trackersByCategory.fingerprinting.length} fingerprinting attempts detected!`,
          details: 'Your device is being uniquely identified'
        });
      }
      
      if (trackersByCategory.dataBrokers?.length > 0) {
        insights.push({
          type: 'high',
          message: `🔍 ${trackersByCategory.dataBrokers.length} data brokers collecting your information`,
          details: 'Your data may be sold to third parties'
        });
      }
      
      if (trackerCompanies.size > 5) {
        insights.push({
          type: 'medium',
          message: `📊 ${trackerCompanies.size} different companies tracking you`,
          details: 'Multiple organizations are monitoring your activity'
        });
      }
      
      // Store privacy analysis
      const privacyData = {
        score: score,
        grade: grade,
        trackers: detectedTrackers,
        trackerCount: detectedTrackers.length,
        companyCount: trackerCompanies.size,
        categories: trackersByCategory,
        insights: insights,
        timestamp: Date.now(),
        domain: domain
      };
      
      // Save privacy data
      chrome.storage.local.set({
        [`${storageKey}_privacy`]: privacyData
      }, () => {
        console.log(`[Dr. DOM Privacy] Score: ${score}/100 (${grade}), Trackers: ${detectedTrackers.length}`);
      });
      
      // Update badge with tracker count
      if (chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'updateBadge',
          trackerCount: detectedTrackers.length,
          score: score
        }).catch(() => {});
      }
    });
  }
  
  // Analyze every 2 seconds
  setInterval(analyzePrivacy, 2000);
  
  // Initial analysis
  setTimeout(analyzePrivacy, 1000);
  
  console.log('[Dr. DOM Privacy] Privacy tracker initialized');
})();