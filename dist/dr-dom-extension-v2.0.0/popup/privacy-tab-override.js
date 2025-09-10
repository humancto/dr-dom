/**
 * Override the API tab to show Privacy data instead
 * Since API tab is redundant, we'll repurpose it for privacy
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Change the tab button text
  const apiTabBtn = document.querySelector('[data-tab="apis"]');
  if (apiTabBtn) {
    apiTabBtn.innerHTML = '🔐 Privacy';
    apiTabBtn.dataset.tab = 'privacy';
  }
  
  // Override the updateAPIAnalysis function to show privacy data
  if (typeof DrDOMAdvancedPopup !== 'undefined') {
    DrDOMAdvancedPopup.prototype.updateAPIAnalysis = function(data) {
      const domain = new URL(this.currentTab.url).hostname;
      const privacyKey = `drDOM_${domain}_privacy`;
      
      chrome.storage.local.get(privacyKey, (result) => {
        const privacyData = result[privacyKey];
        
        // Get the API tab content area
        const apiTab = document.getElementById('apis-tab');
        if (!apiTab) return;
        
        if (!privacyData) {
          apiTab.innerHTML = `
            <div style="padding: 20px; text-align: center;">
              <h2>🔐 Privacy Analysis</h2>
              <p style="color: #999; margin-top: 20px;">Analyzing privacy threats...</p>
            </div>
          `;
          return;
        }
        
        // Build privacy UI
        const gradeColor = {
          'A': '#4CAF50',
          'B': '#8BC34A',
          'C': '#FFC107',
          'D': '#FF9800',
          'F': '#F44336'
        }[privacyData.grade] || '#999';
        
        let html = `
          <div style="padding: 20px;">
            <h2 style="margin-bottom: 20px;">🔐 Privacy Analysis</h2>
            
            <!-- Privacy Score Card -->
            <div style="background: linear-gradient(135deg, ${gradeColor}22, ${gradeColor}11); 
                        padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 72px; font-weight: bold; color: ${gradeColor}; line-height: 1;">
                ${privacyData.grade}
              </div>
              <div style="font-size: 28px; color: #333; margin-top: 10px;">
                ${privacyData.score}/100
              </div>
              <div style="color: #666; margin-top: 10px;">
                ${privacyData.trackerCount} trackers from ${privacyData.companyCount} companies
              </div>
            </div>
            
            <!-- Tracker Stats -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center;">
                <div style="font-size: 36px; font-weight: bold; color: #f44336;">
                  ${privacyData.trackerCount}
                </div>
                <div style="color: #666; font-size: 12px; margin-top: 5px;">Total Trackers</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center;">
                <div style="font-size: 36px; font-weight: bold; color: #ff9800;">
                  ${privacyData.companyCount}
                </div>
                <div style="color: #666; font-size: 12px; margin-top: 5px;">Companies</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center;">
                <div style="font-size: 36px; font-weight: bold; color: #2196f3;">
                  ${Object.keys(privacyData.categories || {}).length}
                </div>
                <div style="color: #666; font-size: 12px; margin-top: 5px;">Categories</div>
              </div>
            </div>
        `;
        
        // Privacy Insights
        if (privacyData.insights && privacyData.insights.length > 0) {
          html += '<h3 style="margin-top: 25px; margin-bottom: 15px;">🔍 Privacy Threats Detected</h3>';
          privacyData.insights.forEach(insight => {
            const color = insight.type === 'critical' ? '#f44336' : 
                         insight.type === 'high' ? '#ff9800' : '#ffc107';
            html += `
              <div style="background: ${color}11; border-left: 4px solid ${color}; 
                          padding: 12px; margin-bottom: 10px; border-radius: 4px;">
                <div style="font-weight: bold; color: ${color}; margin-bottom: 4px;">
                  ${insight.message}
                </div>
                <div style="color: #666; font-size: 13px;">${insight.details}</div>
              </div>
            `;
          });
        }
        
        // Trackers by Category
        if (privacyData.categories && Object.keys(privacyData.categories).length > 0) {
          html += '<h3 style="margin-top: 25px; margin-bottom: 15px;">📊 Trackers by Type</h3>';
          html += '<div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">';
          
          Object.entries(privacyData.categories).forEach(([category, trackers]) => {
            const width = (trackers.length / privacyData.trackerCount) * 100;
            const categoryColors = {
              fingerprinting: '#f44336',
              dataBrokers: '#e91e63',
              advertising: '#ff9800',
              social: '#2196f3',
              analytics: '#4caf50'
            };
            const color = categoryColors[category] || '#999';
            
            html += `
              <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span style="text-transform: capitalize; font-weight: 500;">${category}</span>
                  <span style="color: #666;">${trackers.length} trackers</span>
                </div>
                <div style="background: #e0e0e0; height: 24px; border-radius: 4px; overflow: hidden;">
                  <div style="background: ${color}; width: ${width}%; height: 100%; 
                              transition: width 0.3s; display: flex; align-items: center; padding-left: 8px;">
                    <span style="color: white; font-size: 11px; font-weight: bold;">
                      ${Math.round(width)}%
                    </span>
                  </div>
                </div>
              </div>
            `;
          });
          
          html += '</div>';
        }
        
        // Top Tracking Companies
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
            html += '<h3 style="margin-top: 25px; margin-bottom: 15px;">🏢 Top Tracking Companies</h3>';
            html += '<div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">';
            
            topCompanies.forEach(([company, count], index) => {
              html += `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; 
                            ${index < topCompanies.length - 1 ? 'border-bottom: 1px solid #f0f0f0;' : ''}">
                  <span style="text-transform: capitalize; font-weight: 500;">
                    ${index + 1}. ${company}
                  </span>
                  <span style="color: #666;">${count} requests</span>
                </div>
              `;
            });
            
            html += '</div>';
          }
        }
        
        // How to Block
        html += `
          <h3 style="margin-top: 25px; margin-bottom: 15px;">🛡️ How to Protect Your Privacy</h3>
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
            <div style="margin-bottom: 10px;"><strong>Recommended Privacy Tools:</strong></div>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>uBlock Origin</strong> - Most effective ad & tracker blocker</li>
              <li><strong>Privacy Badger</strong> - Learns and blocks invisible trackers</li>
              <li><strong>DuckDuckGo Extension</strong> - Blocks tracking & upgrades encryption</li>
              <li><strong>Firefox Multi-Account Containers</strong> - Isolates site data</li>
            </ul>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #90caf9;">
              <strong>Quick Settings:</strong>
              <ul style="margin: 5px 0 0 0; padding-left: 20px; line-height: 1.8;">
                <li>Enable "Do Not Track" in browser settings</li>
                <li>Block third-party cookies</li>
                <li>Use Private/Incognito mode for sensitive browsing</li>
                <li>Clear cookies regularly</li>
              </ul>
            </div>
          </div>
        `;
        
        html += '</div>';
        
        apiTab.innerHTML = html;
      });
    };
  }
});

console.log('[Privacy Tab] Overriding API tab with Privacy analysis');