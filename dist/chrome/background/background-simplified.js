/**
 * Dr. DOM Background Service - Simplified & Focused
 * Core: Privacy tracking with real tracker lists
 */

// Import tracker manager
importScripts('./tracker-list-manager.js');

// Track active tabs
const tabData = new Map();

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Dr. DOM] Message:', request.action);
  
  switch(request.action) {
    case 'checkTracker':
      // Handled by tracker-list-manager.js
      break;
      
    case 'getTrackerStats':
      // Handled by tracker-list-manager.js
      break;
      
    case 'getTabData':
      const domain = request.domain || (sender.tab && new URL(sender.tab.url).hostname);
      const data = tabData.get(domain) || { trackers: 0, requests: 0 };
      sendResponse(data);
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true;
});

// Monitor tab navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    try {
      const hostname = new URL(tab.url).hostname;
      
      // Clear old data
      chrome.storage.local.remove([
        `drDOM_privacy_${hostname}`,
        `drDOM_${hostname}`
      ]);
      
      // Reset badge
      chrome.action.setBadgeText({ text: '', tabId });
      
      console.log(`[Dr. DOM] Tab ${tabId} loading: ${hostname}`);
    } catch (e) {
      // Invalid URL
    }
  }
});

// Update badge with tracker count
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key.startsWith('drDOM_privacy_')) {
      const trackerCount = newValue?.trackers?.length || 0;
      const score = newValue?.privacyScore || 100;
      
      if (trackerCount > 0) {
        // Find the tab this data belongs to
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            // Set badge with tracker count
            chrome.action.setBadgeText({ 
              text: String(trackerCount),
              tabId: tabs[0].id 
            });
            
            // Color based on privacy score
            let color = '#4CAF50'; // Green
            if (score < 30) color = '#f44336'; // Red
            else if (score < 50) color = '#ff9800'; // Orange
            else if (score < 70) color = '#ffc107'; // Yellow
            
            chrome.action.setBadgeBackgroundColor({ 
              color: color,
              tabId: tabs[0].id 
            });
            
            // Store for quick access
            const hostname = key.replace('drDOM_privacy_', '');
            tabData.set(hostname, {
              trackers: trackerCount,
              requests: newValue?.requests?.length || 0,
              score: score,
              timestamp: Date.now()
            });
          }
        });
      }
    }
  }
});

// Clean up old data periodically
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [domain, data] of tabData.entries()) {
    if (data.timestamp < oneHourAgo) {
      tabData.delete(domain);
    }
  }
}, 600000); // Every 10 minutes

// Initialize on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Dr. DOM] Installed:', details.reason);
  
  // Set default badge color
  chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  
  if (details.reason === 'install') {
    // Open welcome page
    chrome.tabs.create({ 
      url: 'https://github.com/humancto/dr-dom/blob/main/README.md' 
    });
  }
});

console.log('[Dr. DOM] Background service ready');