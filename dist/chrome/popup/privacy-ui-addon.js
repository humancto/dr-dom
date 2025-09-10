/**
 * Privacy UI Addon - Extends the popup to show privacy tracking data
 */

// Add this to the popup to show privacy data
function updatePrivacyAnalysis() {
  const domain = new URL(this.currentTab.url).hostname;
  const privacyKey = `drDOM_${domain}_privacy`;
  
  chrome.storage.local.get(privacyKey, (result) => {
    const privacyData = result[privacyKey];
    
    if (!privacyData) {
      console.log('No privacy data yet');
      return;
    }
    
    console.log('[Privacy Data]', privacyData);
    
    // Update privacy score in header
    const privacyScoreEl = document.getElementById('privacyScore');
    if (!privacyScoreEl) {
      // Add privacy score to quick stats
      const statsContainer = document.querySelector('.quick-stats');
      if (statsContainer) {
        const privacyCard = document.createElement('div');
        privacyCard.className = 'stat-card';
        privacyCard.innerHTML = `
          <div class="stat-icon">🔐</div>
          <div class="stat-content">
            <div class="stat-number" id="privacyScore">${privacyData.score}/100</div>
            <div class="stat-label">Privacy Score</div>
          </div>
        `;
        statsContainer.appendChild(privacyCard);
      }
    } else {
      privacyScoreEl.textContent = `${privacyData.score}/100`;
    }
    
    // Update privacy grade
    const gradeColor = {
      'A': '#4CAF50',
      'B': '#8BC34A', 
      'C': '#FFC107',
      'D': '#FF9800',
      'F': '#F44336'
    }[privacyData.grade] || '#999';
    
    // Show privacy analysis in Security tab
    const privacyIssuesList = document.getElementById('privacyIssuesList');
    if (privacyIssuesList) {
      let html = `
        <div style="background: linear-gradient(135deg, ${gradeColor}22, ${gradeColor}11); 
                    padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h2 style="margin: 0; font-size: 24px; color: ${gradeColor};">
                Privacy Grade: ${privacyData.grade}
              </h2>
              <p style="margin: 5px 0; color: #666;">
                Score: ${privacyData.score}/100 • ${privacyData.trackerCount} trackers from ${privacyData.companyCount} companies
              </p>
            </div>
            <div style="font-size: 48px; color: ${gradeColor};">
              ${privacyData.grade === 'A' ? '🛡️' : privacyData.grade === 'F' ? '⚠️' : '🔒'}
            </div>
          </div>
        </div>
      `;
      
      // Show insights
      if (privacyData.insights && privacyData.insights.length > 0) {
        html += '<div style="margin: 15px 0;"><h4>🔍 Privacy Insights</h4>';
        privacyData.insights.forEach(insight => {
          const color = insight.type === 'critical' ? '#f44336' : 
                       insight.type === 'high' ? '#ff9800' : '#ffc107';
          html += `
            <div style="background: ${color}11; border-left: 3px solid ${color}; 
                        padding: 10px; margin: 8px 0; border-radius: 4px;">
              <div style="font-weight: bold; color: ${color};">${insight.message}</div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">${insight.details}</div>
            </div>
          `;
        });
        html += '</div>';
      }
      
      // Show trackers by category
      if (privacyData.categories && Object.keys(privacyData.categories).length > 0) {
        html += '<div style="margin: 15px 0;"><h4>📊 Trackers by Category</h4>';
        html += '<div style="display: grid; gap: 10px;">';
        
        Object.entries(privacyData.categories).forEach(([category, trackers]) => {
          const categoryColors = {
            fingerprinting: '#f44336',
            dataBrokers: '#e91e63',
            advertising: '#ff9800',
            social: '#2196f3',
            analytics: '#4caf50'
          };
          const color = categoryColors[category] || '#999';
          
          html += `
            <div style="background: white; border: 1px solid #e0e0e0; 
                        border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="color: ${color}; font-weight: bold; text-transform: capitalize;">
                    ${category}
                  </span>
                  <span style="color: #999; margin-left: 8px;">
                    ${trackers.length} tracker${trackers.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style="color: ${color}; font-size: 20px;">
                  ${category === 'fingerprinting' ? '🔍' : 
                    category === 'advertising' ? '📢' :
                    category === 'social' ? '👥' :
                    category === 'analytics' ? '📊' : '📡'}
                </div>
              </div>
              <div style="margin-top: 8px; font-size: 11px; color: #666;">
                ${[...new Set(trackers.map(t => t.domain))].slice(0, 3).join(', ')}
                ${trackers.length > 3 ? '...' : ''}
              </div>
            </div>
          `;
        });
        
        html += '</div></div>';
      }
      
      // Show top tracking companies
      if (privacyData.trackers && privacyData.trackers.length > 0) {
        const companies = {};
        privacyData.trackers.forEach(tracker => {
          const company = tracker.domain.split('.')[0];
          companies[company] = (companies[company] || 0) + 1;
        });
        
        const topCompanies = Object.entries(companies)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        if (topCompanies.length > 0) {
          html += '<div style="margin: 15px 0;"><h4>🏢 Top Tracking Companies</h4>';
          html += '<div style="background: #f5f5f5; border-radius: 8px; padding: 10px;">';
          
          topCompanies.forEach(([company, count]) => {
            const width = (count / privacyData.trackerCount) * 100;
            html += `
              <div style="margin: 8px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="text-transform: capitalize; font-weight: 500;">${company}</span>
                  <span style="color: #666;">${count} requests</span>
                </div>
                <div style="background: #e0e0e0; height: 20px; border-radius: 4px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #ff6b6b, #ff9800); 
                              width: ${width}%; height: 100%; transition: width 0.3s;"></div>
                </div>
              </div>
            `;
          });
          
          html += '</div></div>';
        }
      }
      
      privacyIssuesList.innerHTML = html;
    }
    
    // Update tracker count in main stats
    const trackerCountEl = document.getElementById('trackingCount');
    if (trackerCountEl) {
      trackerCountEl.textContent = privacyData.trackerCount || 0;
    }
  });
}

// Hook into the existing popup
if (typeof DrDOMAdvancedPopup !== 'undefined') {
  const originalFetchData = DrDOMAdvancedPopup.prototype.fetchData;
  DrDOMAdvancedPopup.prototype.fetchData = function() {
    originalFetchData.call(this);
    updatePrivacyAnalysis.call(this);
  };
  
  console.log('[Privacy UI] Hooked into popup');
} else {
  // Standalone initialization
  setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        updatePrivacyAnalysis.call({ currentTab: tabs[0] });
      }
    });
  }, 2000);
}