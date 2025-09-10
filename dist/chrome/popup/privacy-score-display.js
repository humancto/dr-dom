/**
 * Display Privacy Score Breakdown in UI
 * Shows exactly how the score was calculated
 */

function displayPrivacyScoreBreakdown() {
  const domain = window.location.hostname || 'unknown';
  const scoreKey = `drDOM_${domain}_privacy_score`;
  
  chrome.storage.local.get(scoreKey, (result) => {
    const scoreData = result[scoreKey];
    if (!scoreData) return;
    
    // Find or create score breakdown section in Security tab
    let breakdownSection = document.getElementById('privacyScoreBreakdown');
    if (!breakdownSection) {
      const securityTab = document.getElementById('security-tab');
      if (!securityTab) return;
      
      // Create breakdown section
      const breakdownHTML = document.createElement('div');
      breakdownHTML.id = 'privacyScoreBreakdown';
      breakdownHTML.style.cssText = 'margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;';
      
      // Insert after privacy analysis section
      const privacyAnalysis = document.querySelector('.privacy-analysis');
      if (privacyAnalysis) {
        privacyAnalysis.parentNode.insertBefore(breakdownHTML, privacyAnalysis.nextSibling);
      } else {
        securityTab.appendChild(breakdownHTML);
      }
      breakdownSection = breakdownHTML;
    }
    
    // Build the score breakdown UI
    let html = `
      <h3 style="margin-bottom: 15px;">📊 How We Calculated Your Privacy Score</h3>
      
      <!-- Score Header -->
      <div style="background: linear-gradient(135deg, ${scoreData.gradeColor}22, ${scoreData.gradeColor}11); 
                  padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <div style="font-size: 48px; font-weight: bold; color: ${scoreData.gradeColor};">
          ${scoreData.grade}
        </div>
        <div style="font-size: 24px; color: #333; margin: 10px 0;">
          ${scoreData.score}/100 points
        </div>
        <div style="color: #666; font-style: italic;">
          "${scoreData.gradeLabel}"
        </div>
      </div>
      
      <!-- Starting Score -->
      <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold;">Starting Score:</span>
          <span style="color: #4CAF50; font-weight: bold; font-size: 18px;">100 points</span>
        </div>
      </div>
    `;
    
    // Show violations with point deductions
    if (scoreData.details && scoreData.details.violations.length > 0) {
      html += `
        <h4 style="margin: 15px 0 10px 0; color: #d32f2f;">❌ Privacy Violations & Penalties</h4>
        <div style="background: white; border: 1px solid #ffebee; border-radius: 8px; padding: 10px;">
      `;
      
      let totalPenalty = 0;
      scoreData.details.violations.forEach(violation => {
        const color = violation.type === 'critical' ? '#d32f2f' : 
                     violation.type === 'high' ? '#f57c00' : 
                     violation.type === 'medium' ? '#fbc02d' : '#616161';
        
        html += `
          <div style="padding: 10px; border-bottom: 1px solid #f5f5f5;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1;">
                <div style="color: ${color}; font-weight: bold; margin-bottom: 4px;">
                  ${violation.message}
                </div>
                <div style="color: #666; font-size: 12px;">
                  ${violation.detail}
                </div>
              </div>
              <div style="color: #d32f2f; font-weight: bold; font-size: 16px; margin-left: 15px;">
                -${violation.penalty}
              </div>
            </div>
          </div>
        `;
        totalPenalty += violation.penalty;
      });
      
      html += `
        </div>
        <div style="background: #ffebee; padding: 10px; border-radius: 8px; margin-top: 10px; 
                    display: flex; justify-content: space-between; font-weight: bold;">
          <span>Total Penalties:</span>
          <span style="color: #d32f2f; font-size: 18px;">-${totalPenalty} points</span>
        </div>
      `;
    }
    
    // Show positive signals
    if (scoreData.details && scoreData.details.positives.length > 0) {
      html += `
        <h4 style="margin: 15px 0 10px 0; color: #388e3c;">✅ Positive Privacy Practices</h4>
        <div style="background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 10px;">
      `;
      
      scoreData.details.positives.forEach(positive => {
        html += `
          <div style="padding: 8px; color: #2e7d32;">
            ${positive}
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    // Show final calculation
    html += `
      <div style="background: linear-gradient(135deg, ${scoreData.gradeColor}11, white); 
                  padding: 15px; border-radius: 8px; margin-top: 15px; 
                  border: 2px solid ${scoreData.gradeColor};">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold;">
          <span>Final Privacy Score:</span>
          <span style="color: ${scoreData.gradeColor}; font-size: 24px;">
            ${scoreData.score}/100 (${scoreData.grade})
          </span>
        </div>
      </div>
    `;
    
    // Show breakdown by category
    if (scoreData.breakdown) {
      html += `
        <h4 style="margin: 20px 0 10px 0;">📈 Tracker Category Breakdown</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
      `;
      
      const categoryIcons = {
        fingerprinting: '🔍',
        dataBrokers: '💰',
        advertising: '📢',
        analytics: '📊',
        social: '👥',
        trackingCookies: '🍪'
      };
      
      Object.entries(scoreData.breakdown).forEach(([category, count]) => {
        if (count > 0) {
          html += `
            <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #e0e0e0;">
              <span style="font-size: 20px; margin-right: 8px;">${categoryIcons[category] || '📍'}</span>
              <span style="text-transform: capitalize;">${category}:</span>
              <strong style="color: #f57c00; margin-left: 5px;">${count}</strong>
            </div>
          `;
        }
      });
      
      html += `</div>`;
    }
    
    // Show recommendations
    if (scoreData.recommendations && scoreData.recommendations.length > 0) {
      html += `
        <h4 style="margin: 20px 0 10px 0;">💡 Recommendations for Your Privacy Level</h4>
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
      `;
      
      scoreData.recommendations.forEach(rec => {
        html += `
          <div style="margin-bottom: 12px;">
            <div style="font-weight: bold; margin-bottom: 5px;">
              ${rec.icon} ${rec.text}
            </div>
        `;
        
        if (rec.tools && rec.tools.length > 0) {
          html += `
            <div style="margin-left: 25px; margin-top: 5px;">
              <strong>Recommended tools:</strong>
              <ul style="margin: 5px 0;">
          `;
          rec.tools.forEach(tool => {
            html += `<li>${tool}</li>`;
          });
          html += `</ul></div>`;
        }
        
        html += `</div>`;
      });
      
      html += `</div>`;
    }
    
    // Show grading scale
    html += `
      <h4 style="margin: 20px 0 10px 0;">📏 Privacy Grading Scale</h4>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
        <div style="display: grid; gap: 8px; font-size: 13px;">
          <div><span style="color: #0d7e0d; font-weight: bold;">A+ (95-100):</span> Privacy Champion - Minimal tracking</div>
          <div><span style="color: #4CAF50; font-weight: bold;">A (90-94):</span> Privacy Respecting - Very limited tracking</div>
          <div><span style="color: #8BC34A; font-weight: bold;">B (75-89):</span> Reasonable Privacy - Acceptable tracking</div>
          <div><span style="color: #FFC107; font-weight: bold;">C (60-74):</span> Average Privacy - Standard tracking</div>
          <div><span style="color: #FF9800; font-weight: bold;">D (40-59):</span> Poor Privacy - Heavy tracking</div>
          <div><span style="color: #F44336; font-weight: bold;">F (0-39):</span> Privacy Nightmare - Extreme surveillance</div>
        </div>
      </div>
    `;
    
    breakdownSection.innerHTML = html;
  });
}

// Hook into the existing popup updates
if (typeof DrDOMAdvancedPopup !== 'undefined') {
  const originalUpdateSecurity = DrDOMAdvancedPopup.prototype.updateSecurityAnalysis;
  DrDOMAdvancedPopup.prototype.updateSecurityAnalysis = function(data) {
    originalUpdateSecurity.call(this, data);
    
    // Add score breakdown after security analysis
    setTimeout(() => {
      displayPrivacyScoreBreakdown.call(this);
    }, 100);
  };
}

// Also update periodically
setInterval(displayPrivacyScoreBreakdown, 2000);