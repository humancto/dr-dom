/**
 * Privacy Score Explanation UI
 * Shows transparent scoring algorithm to users
 */

function displayPrivacyScoreExplanation(score, details) {
  // Find or create the explanation section
  let explainSection = document.getElementById('privacyScoreExplanation');
  
  if (!explainSection) {
    const securityTab = document.getElementById('security-tab');
    if (!securityTab) return;
    
    // Create the explanation section
    explainSection = document.createElement('div');
    explainSection.id = 'privacyScoreExplanation';
    explainSection.style.cssText = `
      margin: 20px 0;
      padding: 20px;
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      border-radius: 12px;
      border: 1px solid #0ea5e9;
    `;
    
    // Insert at the top of security tab
    securityTab.insertBefore(explainSection, securityTab.firstChild);
  }
  
  // Calculate grade
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  const gradeColor = {
    'A': '#10b981',
    'B': '#84cc16', 
    'C': '#eab308',
    'D': '#f97316',
    'F': '#ef4444'
  }[grade];
  
  // Build the explanation HTML
  let html = `
    <div style="display: flex; align-items: start; gap: 20px;">
      <div style="flex: 1;">
        <h3 style="margin: 0 0 15px 0; color: #0c4a6e; font-size: 18px;">
          🛡️ Privacy Score Breakdown
        </h3>
        
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; font-weight: bold; color: ${gradeColor};">
            ${score}/100
          </div>
          <div style="font-size: 24px; color: ${gradeColor}; margin-top: 5px;">
            Grade: ${grade}
          </div>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 14px;">
            How We Calculate Your Score:
          </h4>
          
          <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
            <p style="margin: 8px 0;">
              <strong>Starting Score:</strong> 100 points
            </p>
            
            <div style="margin: 10px 0; padding: 10px; background: #fef2f2; border-radius: 6px;">
              <strong style="color: #991b1b;">Penalties Applied:</strong>
              <ul style="margin: 5px 0 0 20px; padding: 0;">
  `;
  
  // Add penalty details if available
  if (details && details.penalties) {
    for (const [category, penalty] of Object.entries(details.penalties)) {
      if (penalty > 0) {
        html += `
          <li style="margin: 3px 0;">
            <span style="color: #dc2626;">-${penalty}</span> 
            ${category.charAt(0).toUpperCase() + category.slice(1)} trackers
          </li>
        `;
      }
    }
  }
  
  html += `
              </ul>
            </div>
            
            <div style="margin: 10px 0; padding: 10px; background: #f0fdf4; border-radius: 6px;">
              <strong style="color: #166534;">Our Scoring Rules:</strong>
              <ul style="margin: 5px 0 0 20px; padding: 0; font-size: 11px;">
                <li style="margin: 3px 0;">Fingerprinting: -15 points (most severe)</li>
                <li style="margin: 3px 0;">Data Brokers: -10 points</li>
                <li style="margin: 3px 0;">Advertising: -5 points per tracker</li>
                <li style="margin: 3px 0;">Social Media: -4 points per tracker</li>
                <li style="margin: 3px 0;">Analytics: -3 points per tracker</li>
                <li style="margin: 3px 0;">CDN/Functional: -1 point</li>
              </ul>
            </div>
            
            <div style="margin-top: 10px; padding: 10px; background: #fefce8; border-radius: 6px;">
              <strong style="color: #854d0e;">Score Interpretation:</strong>
              <ul style="margin: 5px 0 0 20px; padding: 0; font-size: 11px;">
                <li style="margin: 2px 0;"><strong>90-100 (A):</strong> Excellent privacy protection</li>
                <li style="margin: 2px 0;"><strong>80-89 (B):</strong> Good privacy, minor concerns</li>
                <li style="margin: 2px 0;"><strong>70-79 (C):</strong> Average, some tracking present</li>
                <li style="margin: 2px 0;"><strong>60-69 (D):</strong> Poor privacy, heavy tracking</li>
                <li style="margin: 2px 0;"><strong>0-59 (F):</strong> Severe privacy violations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div style="flex: 1;">
        <h4 style="margin: 0 0 15px 0; color: #0c4a6e; font-size: 16px;">
          📊 Tracker Categories Found:
        </h4>
        <div id="trackerBreakdown" style="background: white; padding: 15px; border-radius: 8px;">
          <!-- Tracker breakdown will be inserted here -->
        </div>
        
        <div style="margin-top: 15px; padding: 15px; background: #eff6ff; border-radius: 8px;">
          <h5 style="margin: 0 0 8px 0; color: #1e40af; font-size: 13px;">
            💡 Privacy Tips:
          </h5>
          <ul style="margin: 0; padding: 0 0 0 20px; font-size: 11px; color: #64748b;">
            ${score < 70 ? '<li>Consider using a privacy-focused browser or VPN</li>' : ''}
            ${score < 80 ? '<li>Install an ad blocker to reduce tracking</li>' : ''}
            ${score < 90 ? '<li>Clear cookies regularly</li>' : ''}
            ${score >= 90 ? '<li>This site respects your privacy!</li>' : ''}
            <li>Check privacy settings in your browser</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #cbd5e1; text-align: center;">
      <span style="font-size: 11px; color: #94a3b8;">
        Scoring based on EasyList, EasyPrivacy, and Disconnect.me tracker databases
      </span>
    </div>
  `;
  
  explainSection.innerHTML = html;
  
  // Add tracker breakdown if we have the data
  if (details && details.trackersByCategory) {
    displayTrackerBreakdown(details.trackersByCategory);
  }
}

function displayTrackerBreakdown(trackersByCategory) {
  const breakdownEl = document.getElementById('trackerBreakdown');
  if (!breakdownEl) return;
  
  let html = '';
  const categoryIcons = {
    'analytics': '📊',
    'advertising': '📢',
    'social': '👥',
    'fingerprinting': '🔍',
    'dataBrokers': '💼',
    'cdn': '🌐',
    'functional': '⚙️'
  };
  
  for (const [category, count] of Object.entries(trackersByCategory)) {
    if (count > 0) {
      const icon = categoryIcons[category] || '📌';
      const color = category === 'fingerprinting' ? '#dc2626' : 
                    category === 'dataBrokers' ? '#ea580c' :
                    category === 'advertising' ? '#f59e0b' :
                    '#6b7280';
      
      html += `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
          <span style="font-size: 13px;">
            ${icon} ${category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
          <span style="font-weight: bold; color: ${color}; font-size: 13px;">
            ${count}
          </span>
        </div>
      `;
    }
  }
  
  if (!html) {
    html = '<p style="text-align: center; color: #10b981; font-size: 13px;">✅ No trackers detected!</p>';
  }
  
  breakdownEl.innerHTML = html;
}

// Auto-load when privacy score is available
chrome.storage.local.get(null, (data) => {
  const keys = Object.keys(data);
  const scoreKey = keys.find(k => k.endsWith('_privacyScore'));
  
  if (scoreKey && data[scoreKey]) {
    const scoreData = data[scoreKey];
    displayPrivacyScoreExplanation(scoreData.score, scoreData);
  }
});

console.log('[Dr. DOM] Privacy score explanation UI loaded');