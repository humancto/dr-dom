/**
 * Technology Display Fixed - Shows only privacy-relevant technologies
 * Focus on tracking, analytics, ads, and security tools
 */

// Privacy-relevant categories to display
const PRIVACY_RELEVANT_CATEGORIES = [
  'Analytics',
  'Advertising',
  'Security',
  'Payment Processor',
  'CDN',
  'Tag Manager',
  'Customer Support',
  'Marketing Automation',
  'Ecommerce'
];

// Technology impact on privacy
const TECH_PRIVACY_IMPACT = {
  // High impact - major tracking
  'Google Analytics': { impact: 'high', type: 'tracking', icon: '📊' },
  'Facebook Pixel': { impact: 'high', type: 'tracking', icon: '👁️' },
  'Google Tag Manager': { impact: 'high', type: 'tracking', icon: '🏷️' },
  'Hotjar': { impact: 'high', type: 'session-recording', icon: '🎥' },
  'Mixpanel': { impact: 'high', type: 'tracking', icon: '📈' },
  'Segment': { impact: 'high', type: 'data-broker', icon: '🔄' },
  
  // Medium impact - ads & marketing
  'Google Ads': { impact: 'medium', type: 'advertising', icon: '💰' },
  'Amazon Advertising': { impact: 'medium', type: 'advertising', icon: '📦' },
  'DoubleClick': { impact: 'medium', type: 'advertising', icon: '🎯' },
  'Mailchimp': { impact: 'medium', type: 'marketing', icon: '📧' },
  
  // Low impact - functional
  'Cloudflare': { impact: 'low', type: 'security', icon: '☁️' },
  'reCAPTCHA': { impact: 'low', type: 'security', icon: '🤖' },
  'Stripe': { impact: 'low', type: 'payment', icon: '💳' },
  'PayPal': { impact: 'low', type: 'payment', icon: '💵' },
  'Shopify': { impact: 'medium', type: 'ecommerce', icon: '🛒' },
  'WordPress': { impact: 'low', type: 'cms', icon: '📝' },
  'jQuery': { impact: 'none', type: 'library', icon: '📚' },
  'Bootstrap': { impact: 'none', type: 'framework', icon: '🎨' }
};

function displayPrivacyTechnologies() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    
    const domain = new URL(tabs[0].url).hostname;
    const storageKey = `drDOM_${domain}_tech`;
    
    chrome.storage.local.get(storageKey, (result) => {
      const techData = result[storageKey];
      
      if (techData && techData.technologies) {
        injectTechnologyDisplay(techData);
      } else {
        // Show placeholder
        showTechPlaceholder();
      }
    });
  });
}

function injectTechnologyDisplay(data) {
  const overviewTab = document.getElementById('overview-tab');
  if (!overviewTab) return;
  
  // Remove old section
  const oldSection = document.getElementById('technologySection');
  if (oldSection) oldSection.remove();
  
  // Filter for privacy-relevant technologies
  const privacyTech = data.technologies.filter(tech => {
    const impact = TECH_PRIVACY_IMPACT[tech.name];
    return impact && impact.impact !== 'none';
  });
  
  // Group by impact level
  const grouped = {
    high: privacyTech.filter(t => TECH_PRIVACY_IMPACT[t.name]?.impact === 'high'),
    medium: privacyTech.filter(t => TECH_PRIVACY_IMPACT[t.name]?.impact === 'medium'),
    low: privacyTech.filter(t => TECH_PRIVACY_IMPACT[t.name]?.impact === 'low')
  };
  
  // Calculate privacy impact score
  const impactScore = 
    (grouped.high.length * 10) + 
    (grouped.medium.length * 5) + 
    (grouped.low.length * 1);
  
  const impactLevel = impactScore > 30 ? 'severe' : 
                      impactScore > 15 ? 'high' : 
                      impactScore > 5 ? 'medium' : 'low';
  
  const impactColor = {
    severe: '#dc2626',
    high: '#f59e0b', 
    medium: '#3b82f6',
    low: '#10b981'
  }[impactLevel];
  
  const techSection = document.createElement('div');
  techSection.id = 'technologySection';
  techSection.className = 'overview-card';
  techSection.style.cssText = `
    margin: 15px 0;
    padding: 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  `;
  
  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; font-size: 16px; color: #1f2937;">
        🔍 Privacy-Impacting Technologies
      </h3>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="
          background: ${impactColor}20;
          color: ${impactColor};
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        ">
          ${impactLevel.toUpperCase()} IMPACT
        </span>
        <span style="
          background: #f3f4f6;
          color: #6b7280;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
        ">
          ${privacyTech.length} detected
        </span>
      </div>
    </div>
  `;
  
  // High impact technologies (red)
  if (grouped.high.length > 0) {
    html += `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #dc2626; font-weight: bold; margin-bottom: 8px;">
          ⚠️ HIGH PRIVACY IMPACT
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
    `;
    
    grouped.high.forEach(tech => {
      const info = TECH_PRIVACY_IMPACT[tech.name];
      html += `
        <div style="
          background: #fee2e2;
          border: 1px solid #fca5a5;
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span style="font-size: 16px;">${info.icon}</span>
          <div>
            <div style="font-size: 12px; font-weight: 600; color: #991b1b;">
              ${tech.name}
            </div>
            <div style="font-size: 10px; color: #dc2626;">
              ${info.type}
            </div>
          </div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  }
  
  // Medium impact technologies (yellow)
  if (grouped.medium.length > 0) {
    html += `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #d97706; font-weight: bold; margin-bottom: 8px;">
          ⚡ MEDIUM PRIVACY IMPACT
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
    `;
    
    grouped.medium.forEach(tech => {
      const info = TECH_PRIVACY_IMPACT[tech.name];
      html += `
        <div style="
          background: #fef3c7;
          border: 1px solid #fcd34d;
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span style="font-size: 16px;">${info.icon}</span>
          <div>
            <div style="font-size: 12px; font-weight: 600; color: #92400e;">
              ${tech.name}
            </div>
            <div style="font-size: 10px; color: #d97706;">
              ${info.type}
            </div>
          </div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  }
  
  // Low impact technologies (green)
  if (grouped.low.length > 0) {
    html += `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #059669; font-weight: bold; margin-bottom: 8px;">
          ✅ LOW PRIVACY IMPACT
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
    `;
    
    grouped.low.forEach(tech => {
      const info = TECH_PRIVACY_IMPACT[tech.name];
      html += `
        <div style="
          background: #d1fae5;
          border: 1px solid #6ee7b7;
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span style="font-size: 16px;">${info.icon}</span>
          <div>
            <div style="font-size: 12px; font-weight: 600; color: #065f46;">
              ${tech.name}
            </div>
            <div style="font-size: 10px; color: #059669;">
              ${info.type}
            </div>
          </div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  }
  
  // Add summary
  if (privacyTech.length > 0) {
    const trackingCount = privacyTech.filter(t => 
      ['tracking', 'session-recording', 'data-broker'].includes(TECH_PRIVACY_IMPACT[t.name]?.type)
    ).length;
    
    html += `
      <div style="
        margin-top: 15px;
        padding: 12px;
        background: #f9fafb;
        border-radius: 8px;
        font-size: 12px;
        color: #6b7280;
      ">
        <strong>Summary:</strong> Found ${trackingCount} tracking technologies, 
        ${grouped.medium.filter(t => TECH_PRIVACY_IMPACT[t.name]?.type === 'advertising').length} ad networks, 
        and ${grouped.low.filter(t => TECH_PRIVACY_IMPACT[t.name]?.type === 'security').length} security tools.
      </div>
    `;
  } else {
    html += `
      <div style="
        padding: 20px;
        background: #f9fafb;
        border-radius: 8px;
        text-align: center;
        color: #9ca3af;
        font-size: 13px;
      ">
        No privacy-impacting technologies detected
      </div>
    `;
  }
  
  techSection.innerHTML = html;
  
  // Insert after money trail or at beginning
  const moneySection = document.getElementById('moneyTrailSection');
  if (moneySection && moneySection.parentNode) {
    moneySection.parentNode.insertBefore(techSection, moneySection.nextSibling);
  } else {
    const overviewGrid = document.querySelector('.overview-grid');
    if (overviewGrid) {
      overviewGrid.appendChild(techSection);
    } else {
      overviewTab.appendChild(techSection);
    }
  }
}

function showTechPlaceholder() {
  const overviewTab = document.getElementById('overview-tab');
  if (!overviewTab) return;
  
  const oldSection = document.getElementById('technologySection');
  if (oldSection) oldSection.remove();
  
  const techSection = document.createElement('div');
  techSection.id = 'technologySection';
  techSection.className = 'overview-card';
  techSection.style.cssText = `
    margin: 15px 0;
    padding: 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  `;
  
  techSection.innerHTML = `
    <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1f2937;">
      🔍 Privacy-Impacting Technologies
    </h3>
    <div style="
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      text-align: center;
      color: #9ca3af;
      font-size: 13px;
    ">
      Analyzing page technologies...
    </div>
  `;
  
  const overviewGrid = document.querySelector('.overview-grid');
  if (overviewGrid) {
    overviewGrid.appendChild(techSection);
  } else {
    overviewTab.appendChild(techSection);
  }
}

// Initialize when popup loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(displayPrivacyTechnologies, 1000);
});

// Update when tab changes
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-btn') && 
      e.target.getAttribute('data-tab') === 'overview') {
    setTimeout(displayPrivacyTechnologies, 100);
  }
});

console.log('[Dr. DOM] Technology display (privacy-focused) loaded');