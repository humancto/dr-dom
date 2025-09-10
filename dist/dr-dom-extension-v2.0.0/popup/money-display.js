/**
 * Money Display - Shows revenue calculations in popup
 */

function displayMoneyTrail() {
  // Get current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    
    const domain = new URL(tabs[0].url).hostname;
    const storageKey = `drDOM_${domain}_money`;
    
    chrome.storage.local.get(storageKey, (result) => {
      const moneyData = result[storageKey];
      if (!moneyData) return;
      
      // Create money section in Overview tab
      createMoneySection(moneyData);
    });
  });
}

function createMoneySection(data) {
  // Find or create money section
  let moneySection = document.getElementById('moneyTrailSection');
  
  // Remove old one if exists to prevent duplicates
  if (moneySection) {
    moneySection.remove();
  }
  
  const overviewTab = document.getElementById('overview-tab');
  if (!overviewTab) return;
  
  moneySection = document.createElement('div');
  moneySection.id = 'moneyTrailSection';
  moneySection.className = 'overview-card';
  moneySection.style.cssText = `
    margin: 15px 0;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border: 2px solid #f59e0b;
    padding: 15px;
    border-radius: 12px;
    position: relative;
    max-height: 400px;
    overflow-y: auto;
  `;
  
  // Find the right place to insert it
  const requestDistribution = document.querySelector('.overview-card');
  if (requestDistribution) {
    requestDistribution.parentNode.insertBefore(moneySection, requestDistribution);
  } else {
    // Insert after overview grid if exists
    const overviewGrid = document.querySelector('.overview-grid');
    if (overviewGrid) {
      overviewGrid.appendChild(moneySection);
    } else {
      overviewTab.appendChild(moneySection);
    }
  }
  
  const insights = data.insights;
  const calculations = data.calculations;
  
  moneySection.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; color: #92400e; font-size: 16px;">
        💰 Money Trail
      </h3>
      <button id="moneyTrailToggle" style="
        background: transparent;
        border: 1px solid #92400e;
        color: #92400e;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      ">Minimize</button>
    </div>
    <div id="moneyTrailContent">
    
    <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 12px;">
      <div style="font-size: 36px; font-weight: bold; color: #059669;">
        ${insights.total}
      </div>
      <div style="font-size: 13px; color: #666; margin-top: 3px;">
        Revenue from your visit
      </div>
      <div style="font-size: 11px; color: #999; margin-top: 3px;">
        ${insights.perMinute}/min • ${insights.annualized}/year
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
      <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
        <div style="font-size: 20px; margin-bottom: 4px;">📺</div>
        <div style="font-size: 16px; font-weight: bold; color: #059669;">
          $${calculations.adRevenue.toFixed(3)}
        </div>
        <div style="font-size: 11px; color: #666;">Ad Revenue</div>
      </div>
      
      <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
        <div style="font-size: 20px; margin-bottom: 4px;">📊</div>
        <div style="font-size: 16px; font-weight: bold; color: #0891b2;">
          $${calculations.dataValue.toFixed(3)}
        </div>
        <div style="font-size: 11px; color: #666;">Data Value</div>
      </div>
      
      <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
        <div style="font-size: 20px; margin-bottom: 4px;">🎯</div>
        <div style="font-size: 16px; font-weight: bold; color: #dc2626;">
          $${calculations.trackerRevenue.toFixed(3)}
        </div>
        <div style="font-size: 11px; color: #666;">Tracker Revenue</div>
      </div>
    </div>
    
    <details style="background: white; padding: 12px; border-radius: 6px;">
      <summary style="cursor: pointer; font-weight: bold; color: #92400e; font-size: 13px;">
        📈 View Detailed Breakdown
      </summary>
      <div style="margin-top: 12px; font-size: 12px; color: #666;">
        ${formatBreakdown(calculations.breakdown)}
      </div>
    </details>
    
    <div style="margin-top: 15px; padding: 12px; background: rgba(251,191,36,0.1); border-radius: 6px;">
      <div style="font-size: 13px; color: #92400e; font-weight: bold; margin-bottom: 8px;">
        💡 ${insights.message}
      </div>
      <div style="font-size: 11px; color: #b45309;">
        ${getMoneyTip(calculations.totalValue)}
      </div>
    </div>
    </div>
  `;
  
  // Add toggle functionality
  const toggleBtn = moneySection.querySelector('#moneyTrailToggle');
  const content = moneySection.querySelector('#moneyTrailContent');
  
  if (toggleBtn && content) {
    toggleBtn.addEventListener('click', () => {
      if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleBtn.textContent = 'Minimize';
        moneySection.style.maxHeight = '400px';
      } else {
        content.style.display = 'none';
        toggleBtn.textContent = 'Show';
        moneySection.style.maxHeight = '60px';
      }
    });
  }
}

function formatBreakdown(breakdown) {
  let html = '<div style="line-height: 1.8;">';
  
  if (breakdown.ads) {
    html += '<strong>Advertisement Revenue:</strong><br>';
    Object.entries(breakdown.ads).forEach(([key, value]) => {
      html += `• ${key}: ${value}<br>`;
    });
  }
  
  if (breakdown.data) {
    html += '<br><strong>Data Collection Value:</strong><br>';
    html += `• Types: ${breakdown.data.types.join(', ')}<br>`;
    html += `• Annual value: ${breakdown.data.annualValue}<br>`;
    html += `• Per visit: ${breakdown.data.sessionValue}<br>`;
  }
  
  if (breakdown.trackers) {
    html += '<br><strong>Tracker Networks:</strong><br>';
    html += `• Active trackers: ${breakdown.trackers.count}<br>`;
    html += `• Revenue share: ${breakdown.trackers.revenue}<br>`;
  }
  
  html += '</div>';
  return html;
}

function getMoneyTip(value) {
  if (value > 1.00) {
    return 'Consider using an ad blocker and privacy tools to reduce your data footprint.';
  } else if (value > 0.10) {
    return 'Your data has moderate value. Be selective about what you share.';
  } else if (value > 0.01) {
    return 'This site has minimal monetization. Your privacy is relatively protected.';
  } else {
    return 'Very little monetization detected. This site respects user privacy.';
  }
}

// Initialize when popup loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(displayMoneyTrail, 1000);
});

// Update when tab changes
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-btn')) {
    setTimeout(displayMoneyTrail, 100);
  }
});

console.log('[Dr. DOM] Money display loaded');