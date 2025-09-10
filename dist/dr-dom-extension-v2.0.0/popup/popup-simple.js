/**
 * Simple Popup Controller - Displays Dr. DOM data in main extension UI
 */

document.addEventListener('DOMContentLoaded', async function() {
  console.log('Dr. DOM Popup Loading...');
  
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const domain = new URL(tab.url).hostname;
  
  // Load all data from storage
  const storageKeys = [
    `drDOM_${domain}_enhancedTrackers`,
    `drDOM_${domain}_privacy_score`,
    `drDOM_${domain}_cookies`,
    `drDOM_${domain}_blocked`,
    `drDOM_${domain}_compliance`,
    `drDOM_${domain}_money_trail`,
    `privacy_shield_stats`,
    `privacy_shield_settings`
  ];
  
  const data = await chrome.storage.local.get(storageKeys);
  console.log('Loaded data:', data);
  
  // Update quick stats
  const trackers = data[`drDOM_${domain}_enhancedTrackers`]?.trackers || [];
  const privacyScore = data[`drDOM_${domain}_privacy_score`]?.score || 100;
  const shieldStats = data.privacy_shield_stats || {};
  const blocked = data[`drDOM_${domain}_blocked`] || [];
  
  // Update stat cards
  updateElement('requestCount', trackers.length + blocked.length);
  updateElement('performanceScore', Math.min(100, 50 + (shieldStats.trackersBlocked || 0)));
  updateElement('avgResponseTime', shieldStats.speedImprovement ? Math.round(shieldStats.speedImprovement / 10) + 'ms' : '0ms');
  updateElement('errorCount', 0);
  updateElement('safetyScore', privacyScore);
  updateElement('trackingCount', trackers.length);
  
  // Setup tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active tab button
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Update active tab panel
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
      const tabId = this.dataset.tab + '-tab';
      const panel = document.getElementById(tabId);
      if (panel) panel.classList.add('active');
    });
  });
  
  // Overview Tab - Request Distribution
  updateRequestDistribution(trackers);
  
  // Overview Tab - Top Domains
  updateTopDomains(trackers);
  
  // Overview Tab - Data Transfer
  const dataSaved = shieldStats.bandwidthSaved || 0;
  updateElement('dataSent', '0 B');
  updateElement('dataReceived', formatBytes(dataSaved));
  
  // Overview Tab - Activity Stream
  updateActivityStream(trackers, blocked);
  
  // Security Tab Updates
  updateSecurityTab(trackers, data);
  
  // Weather Report (Emoji Scores) - Add to Overview
  addWeatherReport(privacyScore);
  
  // Setup buttons
  setupButtons(tab, data);
  
  // Refresh button
  document.getElementById('refreshBtn')?.addEventListener('click', () => {
    location.reload();
  });
  
  // Export button
  document.getElementById('exportBtn')?.addEventListener('click', () => {
    const menu = document.getElementById('exportMenu');
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  });
  
  // Export options
  document.querySelectorAll('.export-option').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const format = e.target.dataset.format;
      await exportData(format, tab, data);
      document.getElementById('exportMenu').style.display = 'none';
    });
  });
});

function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function updateRequestDistribution(trackers) {
  const categories = {
    analytics: 0,
    advertising: 0,
    social: 0,
    fingerprinting: 0
  };
  
  trackers.forEach(tracker => {
    if (categories.hasOwnProperty(tracker.category)) {
      categories[tracker.category]++;
    }
  });
  
  const total = Math.max(trackers.length, 1);
  
  // Update XHR bar (analytics)
  const xhrBar = document.querySelector('.request-type-fill.xhr');
  if (xhrBar) {
    xhrBar.style.width = `${(categories.analytics / total) * 100}%`;
  }
  updateElement('xhr-count', categories.analytics);
  
  // Update Fetch bar (advertising)
  const fetchBar = document.querySelector('.request-type-fill.fetch');
  if (fetchBar) {
    fetchBar.style.width = `${(categories.advertising / total) * 100}%`;
  }
  updateElement('fetch-count', categories.advertising);
  
  // Update Script bar (social)
  const scriptBar = document.querySelector('.request-type-fill.script');
  if (scriptBar) {
    scriptBar.style.width = `${(categories.social / total) * 100}%`;
  }
  updateElement('script-count', categories.social);
  
  // Update Image bar (fingerprinting)
  const imageBar = document.querySelector('.request-type-fill.image');
  if (imageBar) {
    imageBar.style.width = `${(categories.fingerprinting / total) * 100}%`;
  }
  updateElement('image-count', categories.fingerprinting);
}

function updateTopDomains(trackers) {
  const domains = {};
  
  trackers.forEach(tracker => {
    try {
      const domain = new URL(tracker.url).hostname;
      domains[domain] = (domains[domain] || 0) + 1;
    } catch (e) {}
  });
  
  const topDomains = Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const container = document.getElementById('topDomains');
  if (container) {
    if (topDomains.length > 0) {
      container.innerHTML = topDomains.map(([domain, count]) => `
        <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8fafc; margin: 4px 0; border-radius: 4px;">
          <span style="font-size: 12px; color: #1e293b;">${domain}</span>
          <span style="font-size: 12px; color: #ef4444; font-weight: bold;">${count}</span>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 20px;">No trackers detected yet</div>';
    }
  }
}

function updateActivityStream(trackers, blocked) {
  const activities = [];
  
  // Add recent trackers
  trackers.slice(-3).forEach(tracker => {
    activities.push({
      icon: '🎯',
      text: `Tracker: ${tracker.name}`,
      time: new Date(tracker.timestamp).toLocaleTimeString(),
      timestamp: tracker.timestamp
    });
  });
  
  // Add recent blocks
  blocked.slice(-3).forEach(block => {
    activities.push({
      icon: '🚫',
      text: `Blocked: ${new URL(block.url).hostname}`,
      time: new Date(block.timestamp).toLocaleTimeString(),
      timestamp: block.timestamp
    });
  });
  
  // Sort by timestamp
  activities.sort((a, b) => b.timestamp - a.timestamp);
  
  const container = document.getElementById('activityStream');
  if (container) {
    if (activities.length > 0) {
      container.innerHTML = activities.slice(0, 5).map(activity => `
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f0f9ff; margin: 5px 0; border-radius: 6px; border-left: 3px solid #3b82f6;">
          <span style="font-size: 20px;">${activity.icon}</span>
          <span style="flex: 1; font-size: 13px; color: #1e293b;">${activity.text}</span>
          <span style="font-size: 11px; color: #64748b;">${activity.time}</span>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 30px;">No activity detected yet. Visit a website to start tracking.</div>';
    }
  }
}

function updateSecurityTab(trackers, data) {
  // Update HTTPS/HTTP counts
  const httpsCount = trackers.filter(t => t.url?.startsWith('https')).length;
  const httpCount = trackers.filter(t => t.url?.startsWith('http:')).length;
  
  updateElement('httpsRequests', httpsCount);
  updateElement('httpRequests', httpCount);
  updateElement('mixedContent', httpCount > 0 && httpsCount > 0 ? httpCount : 0);
  
  // Third party count
  updateElement('thirdPartyRequests', trackers.length);
  
  // Privacy issues
  const privacyIssues = [];
  if (trackers.some(t => t.category === 'fingerprinting')) {
    privacyIssues.push('🔍 Browser fingerprinting detected');
  }
  if (trackers.filter(t => t.category === 'advertising').length > 5) {
    privacyIssues.push('📢 Excessive advertising trackers');
  }
  if (trackers.some(t => t.name?.includes('Facebook'))) {
    privacyIssues.push('👁️ Facebook tracking detected');
  }
  
  const privacyContainer = document.getElementById('privacyIssuesList');
  if (privacyContainer) {
    if (privacyIssues.length > 0) {
      privacyContainer.innerHTML = privacyIssues.map(issue => `
        <div style="padding: 10px; background: #fef2f2; margin: 5px 0; border-radius: 6px; border-left: 3px solid #ef4444; color: #991b1b;">
          ${issue}
        </div>
      `).join('');
    } else {
      privacyContainer.innerHTML = '<div style="color: #10b981; text-align: center; padding: 20px;">✅ No privacy concerns detected</div>';
    }
  }
  
  // Cookie stats
  const cookies = data[`drDOM_${domain}_cookies`] || [];
  updateElement('cookieTotal', cookies.length);
  updateElement('cookieTracking', cookies.filter(c => c.tracking).length);
  updateElement('cookieEssential', cookies.filter(c => !c.tracking).length);
}

function addWeatherReport(privacyScore) {
  // Add weather report to overview
  const overviewTab = document.getElementById('overview-tab');
  if (!overviewTab) return;
  
  // Check if weather report already exists
  if (document.getElementById('weather-report-section')) return;
  
  const weatherSection = document.createElement('div');
  weatherSection.id = 'weather-report-section';
  weatherSection.style.cssText = 'margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; color: white;';
  
  let emoji, message, color;
  
  if (privacyScore >= 90) {
    emoji = '☀️';
    message = 'Sunny - Excellent privacy!';
    color = '#10b981';
  } else if (privacyScore >= 70) {
    emoji = '⛅';
    message = 'Partly cloudy - Good privacy';
    color = '#3b82f6';
  } else if (privacyScore >= 50) {
    emoji = '☁️';
    message = 'Cloudy - Moderate privacy';
    color = '#f59e0b';
  } else if (privacyScore >= 30) {
    emoji = '🌧️';
    message = 'Rainy - Poor privacy';
    color = '#ef4444';
  } else {
    emoji = '⛈️';
    message = 'Stormy - Terrible privacy!';
    color = '#991b1b';
  }
  
  weatherSection.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">Privacy Weather Report</div>
      <div style="font-size: 18px; margin-bottom: 10px;">${message}</div>
      <div style="font-size: 36px; font-weight: bold; color: ${color};">${privacyScore}/100</div>
    </div>
  `;
  
  // Insert after quick stats
  const quickStats = overviewTab.querySelector('.quick-stats');
  if (quickStats && quickStats.nextSibling) {
    overviewTab.insertBefore(weatherSection, quickStats.nextSibling);
  } else {
    overviewTab.appendChild(weatherSection);
  }
}

function setupButtons(tab, data) {
  // Add control buttons for features
  const controlSection = document.createElement('div');
  controlSection.style.cssText = 'position: fixed; bottom: 10px; left: 10px; right: 10px; display: flex; gap: 10px; justify-content: center;';
  
  // Honest Review button
  const reviewBtn = document.createElement('button');
  reviewBtn.textContent = '🔥 Get Honest Review';
  reviewBtn.style.cssText = 'padding: 8px 16px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;';
  reviewBtn.onclick = () => {
    chrome.tabs.sendMessage(tab.id, { action: 'showWidget', widget: 'honestReview' });
  };
  
  // Privacy Shield button
  const shieldBtn = document.createElement('button');
  shieldBtn.textContent = '🛡️ Privacy Shield';
  shieldBtn.style.cssText = 'padding: 8px 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;';
  shieldBtn.onclick = () => {
    chrome.tabs.sendMessage(tab.id, { action: 'showWidget', widget: 'privacyShield' });
  };
  
  // Money Trail button
  const moneyBtn = document.createElement('button');
  moneyBtn.textContent = '💰 Money Trail';
  moneyBtn.style.cssText = 'padding: 8px 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;';
  moneyBtn.onclick = () => {
    chrome.tabs.sendMessage(tab.id, { action: 'showWidget', widget: 'moneyTrail' });
  };
  
  controlSection.appendChild(reviewBtn);
  controlSection.appendChild(shieldBtn);
  controlSection.appendChild(moneyBtn);
  
  document.querySelector('.dr-dom-container')?.appendChild(controlSection);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function exportData(format, tab, data) {
  const exportData = {
    url: tab.url,
    timestamp: new Date().toISOString(),
    data: data
  };
  
  let content, filename, mimeType;
  
  switch (format) {
    case 'json':
      content = JSON.stringify(exportData, null, 2);
      filename = `dr-dom-export-${Date.now()}.json`;
      mimeType = 'application/json';
      break;
    case 'csv':
      // Simple CSV export
      const rows = [['Type', 'URL', 'Category', 'Timestamp']];
      const trackers = data[`drDOM_${new URL(tab.url).hostname}_enhancedTrackers`]?.trackers || [];
      trackers.forEach(t => {
        rows.push(['Tracker', t.url || '', t.category || '', new Date(t.timestamp).toISOString()]);
      });
      content = rows.map(row => row.join(',')).join('\n');
      filename = `dr-dom-export-${Date.now()}.csv`;
      mimeType = 'text/csv';
      break;
    case 'har':
      content = JSON.stringify({ log: { version: '1.2', creator: { name: 'Dr. DOM', version: '2.0' }, entries: [] } }, null, 2);
      filename = `dr-dom-export-${Date.now()}.har`;
      mimeType = 'application/json';
      break;
  }
  
  // Create download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  });
}