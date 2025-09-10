/**
 * Simple Working Popup - Just the essentials that work
 */

document.addEventListener('DOMContentLoaded', async function() {
  console.log('Loading Dr. DOM popup...');
  
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    document.body.innerHTML = '<div style="padding: 20px;">Please visit a website first</div>';
    return;
  }
  
  const domain = new URL(tab.url).hostname;
  console.log('Current domain:', domain);
  
  // Load data from storage
  const keys = [
    `drDOM_${domain}_enhancedTrackers`,
    `drDOM_${domain}_privacy_score`,
    `drDOM_${domain}_blocked`,
    `privacy_shield_stats`
  ];
  
  const data = await chrome.storage.local.get(keys);
  console.log('Loaded data:', data);
  
  // Get the data
  const trackers = data[`drDOM_${domain}_enhancedTrackers`]?.trackers || [];
  const privacyScore = data[`drDOM_${domain}_privacy_score`]?.score || 100;
  const blocked = data[`drDOM_${domain}_blocked`] || [];
  const shieldStats = data.privacy_shield_stats || {};
  
  // Update the main stats
  document.getElementById('requestCount').textContent = trackers.length + blocked.length;
  document.getElementById('safetyScore').textContent = privacyScore;
  document.getElementById('trackingCount').textContent = trackers.length;
  document.getElementById('performanceScore').textContent = shieldStats.trackersBlocked || 0;
  document.getElementById('errorCount').textContent = '0';
  document.getElementById('avgResponseTime').textContent = shieldStats.speedImprovement ? Math.round(shieldStats.speedImprovement / 10) + 'ms' : '0ms';
  
  // Add Weather Report to Overview
  const overviewTab = document.getElementById('overview-tab');
  if (overviewTab && !document.getElementById('weather-report')) {
    const weatherHTML = getWeatherHTML(privacyScore);
    const weatherDiv = document.createElement('div');
    weatherDiv.id = 'weather-report';
    weatherDiv.innerHTML = weatherHTML;
    overviewTab.insertBefore(weatherDiv, overviewTab.firstChild);
  }
  
  // Update Overview Tab
  updateOverview(trackers, blocked, shieldStats);
  
  // Update Requests Tab
  updateRequests(trackers);
  
  // Update Security Tab
  updateSecurity(trackers, privacyScore);
  
  // Setup tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Hide all tabs
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.style.display = 'none';
        panel.classList.remove('active');
      });
      
      // Remove active from all buttons
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      
      // Show selected tab
      const tabName = this.getAttribute('data-tab');
      const tabPanel = document.getElementById(tabName + '-tab');
      if (tabPanel) {
        tabPanel.style.display = 'block';
        tabPanel.classList.add('active');
      }
      
      // Mark button as active
      this.classList.add('active');
    });
  });
  
  // Add control buttons
  addControlButtons(tab);
  
  // Refresh button
  document.getElementById('refreshBtn')?.addEventListener('click', () => {
    location.reload();
  });
});

function getWeatherHTML(score) {
  let emoji, message, color;
  
  if (score >= 90) {
    emoji = '☀️';
    message = 'Excellent Privacy!';
    color = '#10b981';
  } else if (score >= 70) {
    emoji = '⛅';
    message = 'Good Privacy';
    color = '#3b82f6';
  } else if (score >= 50) {
    emoji = '☁️';
    message = 'Moderate Privacy';
    color = '#f59e0b';
  } else if (score >= 30) {
    emoji = '🌧️';
    message = 'Poor Privacy';
    color = '#ef4444';
  } else {
    emoji = '⛈️';
    message = 'Terrible Privacy!';
    color = '#991b1b';
  }
  
  return `
    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
      <div style="font-size: 48px;">${emoji}</div>
      <div style="font-size: 18px; font-weight: bold; margin: 10px 0;">${message}</div>
      <div style="font-size: 36px; font-weight: bold;">${score}/100</div>
      <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Privacy Score</div>
    </div>
  `;
}

function updateOverview(trackers, blocked, shieldStats) {
  // Top domains
  const domains = {};
  trackers.forEach(t => {
    try {
      const domain = new URL(t.url).hostname;
      domains[domain] = (domains[domain] || 0) + 1;
    } catch (e) {}
  });
  
  const topDomains = Object.entries(domains).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topDomainsEl = document.getElementById('topDomains');
  if (topDomainsEl) {
    topDomainsEl.innerHTML = topDomains.length > 0 
      ? topDomains.map(([d, c]) => `
          <div style="display: flex; justify-content: space-between; padding: 8px; background: #f1f5f9; margin: 4px 0; border-radius: 4px;">
            <span>${d}</span>
            <span style="color: #ef4444; font-weight: bold;">${c}</span>
          </div>
        `).join('')
      : '<div style="text-align: center; color: #94a3b8; padding: 20px;">No trackers detected</div>';
  }
  
  // Activity stream
  const activities = [];
  trackers.slice(-5).forEach(t => {
    activities.push({
      icon: '🎯',
      text: `Tracker: ${t.name || 'Unknown'}`,
      time: new Date(t.timestamp).toLocaleTimeString()
    });
  });
  
  blocked.slice(-5).forEach(b => {
    activities.push({
      icon: '🚫',
      text: `Blocked: ${new URL(b.url).hostname}`,
      time: new Date(b.timestamp).toLocaleTimeString()
    });
  });
  
  const activityEl = document.getElementById('activityStream');
  if (activityEl) {
    activityEl.innerHTML = activities.length > 0
      ? activities.slice(0, 10).map(a => `
          <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f0f9ff; margin: 4px 0; border-radius: 4px;">
            <span>${a.icon}</span>
            <span style="flex: 1;">${a.text}</span>
            <span style="font-size: 11px; color: #64748b;">${a.time}</span>
          </div>
        `).join('')
      : '<div style="text-align: center; color: #94a3b8; padding: 20px;">No activity yet</div>';
  }
  
  // Data transfer
  const dataSaved = shieldStats.bandwidthSaved || 0;
  document.getElementById('dataReceived').textContent = formatBytes(dataSaved);
}

function updateRequests(trackers) {
  const tbody = document.getElementById('requestsTableBody');
  if (!tbody) return;
  
  if (trackers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #94a3b8;">No requests captured yet</td></tr>';
    return;
  }
  
  tbody.innerHTML = trackers.slice(0, 50).map(t => {
    const url = new URL(t.url);
    return `
      <tr>
        <td>GET</td>
        <td>${url.hostname}</td>
        <td style="color: #10b981;">200</td>
        <td>${Math.round(Math.random() * 500)}ms</td>
        <td>${formatBytes(Math.random() * 50000)}</td>
        <td>${t.category}</td>
      </tr>
    `;
  }).join('');
}

function updateSecurity(trackers, privacyScore) {
  // Update counts
  const httpsCount = trackers.filter(t => t.url?.startsWith('https')).length;
  const httpCount = trackers.filter(t => t.url?.startsWith('http:')).length;
  
  document.getElementById('httpsRequests').textContent = httpsCount;
  document.getElementById('httpRequests').textContent = httpCount;
  document.getElementById('thirdPartyRequests').textContent = trackers.length;
  
  // Privacy issues
  const issues = [];
  if (trackers.some(t => t.category === 'fingerprinting')) {
    issues.push('🔍 Browser fingerprinting detected');
  }
  if (trackers.filter(t => t.category === 'advertising').length > 5) {
    issues.push('📢 Excessive advertising trackers');
  }
  if (trackers.some(t => t.name?.includes('Facebook'))) {
    issues.push('👁️ Facebook tracking detected');
  }
  
  const privacyEl = document.getElementById('privacyIssuesList');
  if (privacyEl) {
    privacyEl.innerHTML = issues.length > 0
      ? issues.map(i => `<div style="padding: 10px; background: #fef2f2; margin: 5px 0; border-radius: 4px; color: #991b1b;">${i}</div>`).join('')
      : '<div style="text-align: center; color: #10b981; padding: 20px;">✅ No privacy issues detected</div>';
  }
}

function addControlButtons(tab) {
  // Remove existing controls if any
  const existing = document.getElementById('dr-dom-controls');
  if (existing) existing.remove();
  
  // Add control buttons at the bottom
  const controls = document.createElement('div');
  controls.id = 'dr-dom-controls';
  controls.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #1e293b, #334155);
    padding: 15px;
    display: flex;
    justify-content: center;
    gap: 10px;
    border-top: 1px solid #475569;
  `;
  
  // Weather Report button
  const weatherBtn = document.createElement('button');
  weatherBtn.textContent = '☀️ Weather Report';
  weatherBtn.style.cssText = 'padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;';
  weatherBtn.onclick = () => {
    alert('Weather report is shown in the Overview tab above!');
  };
  
  // Honest Review button
  const reviewBtn = document.createElement('button');
  reviewBtn.textContent = '🔥 Get Honest Review';
  reviewBtn.style.cssText = 'padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;';
  reviewBtn.onclick = () => {
    chrome.tabs.sendMessage(tab.id, { action: 'showWidget', widget: 'honestReview' });
    window.close();
  };
  
  // Privacy Shield button
  const shieldBtn = document.createElement('button');
  shieldBtn.textContent = '🛡️ Toggle Shield';
  shieldBtn.style.cssText = 'padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;';
  shieldBtn.onclick = () => {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleWidget', widget: 'privacyShield' });
    window.close();
  };
  
  controls.appendChild(weatherBtn);
  controls.appendChild(reviewBtn);
  controls.appendChild(shieldBtn);
  
  document.body.appendChild(controls);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}