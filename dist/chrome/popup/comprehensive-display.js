/**
 * Comprehensive Display - Shows all the new analysis data in the popup
 */

function displayComprehensiveAnalysis() {
  const domain = new URL(this.currentTab.url).hostname;
  
  // Get all analysis data including privacy score
  const keys = [
    `drDOM_${domain}_malware`,
    `drDOM_${domain}_tech`, 
    `drDOM_${domain}_ssl`,
    `drDOM_${domain}_compliance`,
    `drDOM_${domain}_privacyScore`
  ];
  
  chrome.storage.local.get(keys, (result) => {
    // Display malware analysis
    if (result[`drDOM_${domain}_malware`]) {
      displayMalwareAnalysis(result[`drDOM_${domain}_malware`]);
    }
    
    // Display technology stack
    if (result[`drDOM_${domain}_tech`]) {
      displayTechnologyStack(result[`drDOM_${domain}_tech`]);
    }
    
    // Display SSL analysis
    if (result[`drDOM_${domain}_ssl`]) {
      displaySSLAnalysis(result[`drDOM_${domain}_ssl`]);
    }
    
    // Display compliance analysis
    if (result[`drDOM_${domain}_compliance`]) {
      displayComplianceAnalysis(result[`drDOM_${domain}_compliance`]);
    }
    
    // Display privacy score explanation
    if (result[`drDOM_${domain}_privacyScore`]) {
      if (typeof displayPrivacyScoreExplanation === 'function') {
        displayPrivacyScoreExplanation(result[`drDOM_${domain}_privacyScore`].score, result[`drDOM_${domain}_privacyScore`]);
      }
    }
  });
}

function displayMalwareAnalysis(data) {
  // Add to Security tab
  let malwareSection = document.getElementById('malwareAnalysis');
  if (!malwareSection) {
    const securityTab = document.getElementById('security-tab');
    if (!securityTab) return;
    
    malwareSection = document.createElement('div');
    malwareSection.id = 'malwareAnalysis';
    malwareSection.style.cssText = 'margin: 20px 0; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #e0e0e0;';
    
    // Insert at the beginning of security tab
    securityTab.insertBefore(malwareSection, securityTab.firstChild);
  }
  
  let html = '<h3>🛡️ Malware & Threat Analysis</h3>';
  
  if (data.clean) {
    html += `
      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <div style="color: #2e7d32; font-weight: bold; font-size: 16px;">
          ✅ No Malware Detected
        </div>
        <div style="color: #388e3c; margin-top: 5px;">
          All resources scanned and verified clean
        </div>
      </div>
    `;
  } else if (data.threats && data.threats.length > 0) {
    const criticalCount = data.critical || 0;
    const highCount = data.high || 0;
    const mediumCount = data.medium || 0;
    
    html += `
      <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <div style="color: #c62828; font-weight: bold; font-size: 16px;">
          ⚠️ ${data.threats.length} Threats Detected!
        </div>
        <div style="margin-top: 10px; display: flex; gap: 15px;">
          ${criticalCount > 0 ? `<span style="color: #d32f2f;">Critical: ${criticalCount}</span>` : ''}
          ${highCount > 0 ? `<span style="color: #f57c00;">High: ${highCount}</span>` : ''}
          ${mediumCount > 0 ? `<span style="color: #fbc02d;">Medium: ${mediumCount}</span>` : ''}
        </div>
      </div>
    `;
    
    // Show threat details
    html += '<div style="margin-top: 15px;"><strong>Threat Details:</strong></div>';
    data.threats.slice(0, 3).forEach(threat => {
      const color = threat.severity === 'critical' ? '#d32f2f' : 
                   threat.severity === 'high' ? '#f57c00' : '#fbc02d';
      
      html += `
        <div style="background: #fafafa; padding: 10px; margin: 8px 0; border-left: 3px solid ${color}; border-radius: 4px;">
          <div style="font-weight: bold; color: ${color}; margin-bottom: 4px;">
            ${threat.threat_type || 'Unknown threat'}
          </div>
          <div style="font-size: 12px; color: #666;">
            ${threat.url ? threat.url.substring(0, 50) + '...' : ''}
          </div>
          ${threat.tags ? `<div style="font-size: 11px; color: #999; margin-top: 4px;">Tags: ${threat.tags.join(', ')}</div>` : ''}
        </div>
      `;
    });
  } else {
    html += `
      <div style="padding: 10px; background: #f5f5f5; border-radius: 8px; color: #666;">
        Scanning for malware...
      </div>
    `;
  }
  
  html += `
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <div style="font-size: 11px; color: #999;">
        Powered by URLhaus threat intelligence • Last scan: ${new Date(data.scanTime).toLocaleTimeString()}
      </div>
    </div>
  `;
  
  malwareSection.innerHTML = html;
}

function displayTechnologyStack(data) {
  // Add to Overview tab
  let techSection = document.getElementById('technologyStack');
  if (!techSection) {
    const overviewTab = document.getElementById('overview-tab');
    if (!overviewTab) return;
    
    techSection = document.createElement('div');
    techSection.id = 'technologyStack';
    techSection.className = 'overview-card';
    techSection.style.cssText = 'margin: 20px 0;';
    
    const activitySection = document.querySelector('.activity-section');
    if (activitySection) {
      overviewTab.insertBefore(techSection, activitySection);
    } else {
      overviewTab.appendChild(techSection);
    }
  }
  
  let html = '<h3>🔧 Technology Stack</h3>';
  
  if (data.technologies && data.technologies.length > 0) {
    // Group by category
    const categories = data.summary.categories;
    
    html += '<div style="display: grid; gap: 10px;">';
    
    for (const [category, techs] of Object.entries(categories)) {
      const categoryIcons = {
        'JavaScript Framework': '⚛️',
        'JavaScript Library': '📚',
        'CMS': '📝',
        'Ecommerce': '🛒',
        'Analytics': '📊',
        'CDN': '🌐',
        'Security': '🔒',
        'Payment Processor': '💳',
        'UI Framework': '🎨',
        'Web Server': '🖥️',
        'Programming Language': '💻'
      };
      
      html += `
        <div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">
          <div style="font-weight: bold; color: #333; margin-bottom: 5px;">
            ${categoryIcons[category] || '📦'} ${category}
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
      `;
      
      techs.forEach(tech => {
        const techData = data.technologies.find(t => t.name === tech);
        html += `
          <span style="background: white; padding: 4px 8px; border-radius: 4px; 
                       font-size: 12px; border: 1px solid #e0e0e0;">
            ${tech}
            ${techData && techData.version ? `<span style="color: #666;"> v${techData.version}</span>` : ''}
          </span>
        `;
      });
      
      html += '</div></div>';
    }
    
    html += '</div>';
    
    // Show security issues if any
    if (data.securityIssues && data.securityIssues.length > 0) {
      html += `
        <div style="background: #fff3e0; padding: 10px; border-radius: 6px; margin-top: 10px; 
                    border-left: 3px solid #ff9800;">
          <div style="font-weight: bold; color: #e65100; margin-bottom: 5px;">
            ⚠️ Outdated Technologies Detected
          </div>
      `;
      
      data.securityIssues.forEach(issue => {
        html += `
          <div style="font-size: 12px; color: #666; margin: 4px 0;">
            • ${issue.technology} ${issue.version}: ${issue.message}
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    // Show stack type
    if (data.summary.stack) {
      html += `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
          <span style="font-size: 12px; color: #666;">
            Stack Type: <strong>${data.summary.stack}</strong>
          </span>
        </div>
      `;
    }
  } else {
    html += `
      <div style="padding: 10px; background: #f5f5f5; border-radius: 8px; color: #666;">
        Detecting technologies...
      </div>
    `;
  }
  
  techSection.innerHTML = html;
}

function displaySSLAnalysis(data) {
  // Add to Security tab
  let sslSection = document.getElementById('sslAnalysis');
  if (!sslSection) {
    const securityTab = document.getElementById('security-tab');
    if (!securityTab) return;
    
    sslSection = document.createElement('div');
    sslSection.id = 'sslAnalysis';
    sslSection.style.cssText = 'margin: 20px 0; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #e0e0e0;';
    
    // Insert after malware analysis
    const malwareSection = document.getElementById('malwareAnalysis');
    if (malwareSection) {
      malwareSection.parentNode.insertBefore(sslSection, malwareSection.nextSibling);
    } else {
      securityTab.insertBefore(sslSection, securityTab.firstChild);
    }
  }
  
  const gradeColors = {
    'A+': '#0d7e0d',
    'A': '#4CAF50',
    'B': '#8BC34A',
    'C': '#FFC107',
    'D': '#FF9800',
    'F': '#F44336'
  };
  
  const gradeColor = gradeColors[data.grade] || '#999';
  
  let html = '<h3>🔐 SSL/TLS Security Analysis</h3>';
  
  html += `
    <div style="background: linear-gradient(135deg, ${gradeColor}11, ${gradeColor}22); 
                padding: 20px; border-radius: 8px; text-align: center; margin: 10px 0;">
      <div style="font-size: 48px; font-weight: bold; color: ${gradeColor};">
        ${data.grade}
      </div>
      <div style="color: #666; margin-top: 5px;">
        SSL Security Grade
      </div>
    </div>
  `;
  
  // Protocol status
  html += `
    <div style="display: flex; align-items: center; margin: 15px 0;">
      <span style="font-size: 24px; margin-right: 10px;">
        ${data.protocol === 'https:' ? '🔒' : '🔓'}
      </span>
      <div>
        <div style="font-weight: bold;">
          ${data.protocol === 'https:' ? 'HTTPS Enabled' : 'Not Using HTTPS'}
        </div>
        <div style="font-size: 12px; color: #666;">
          ${data.protocol === 'https:' ? 'Data is encrypted in transit' : 'Data transmitted in plain text!'}
        </div>
      </div>
    </div>
  `;
  
  // Security headers
  if (data.securityHeaders && Object.keys(data.securityHeaders).length > 0) {
    html += '<div style="margin-top: 15px;"><strong>Security Headers:</strong></div>';
    html += '<div style="display: grid; gap: 8px; margin-top: 8px;">';
    
    const importantHeaders = [
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options'
    ];
    
    importantHeaders.forEach(header => {
      const hasHeader = data.securityHeaders[header]?.present;
      html += `
        <div style="display: flex; align-items: center; padding: 8px; background: ${hasHeader ? '#e8f5e9' : '#ffebee'}; 
                    border-radius: 4px;">
          <span style="font-size: 16px; margin-right: 8px;">
            ${hasHeader ? '✅' : '❌'}
          </span>
          <span style="font-size: 12px; ${!hasHeader ? 'color: #666;' : ''}">
            ${header}
          </span>
        </div>
      `;
    });
    
    html += '</div>';
  }
  
  // Issues
  if (data.issues && data.issues.length > 0) {
    html += '<div style="margin-top: 15px;"><strong>Security Issues:</strong></div>';
    data.issues.slice(0, 3).forEach(issue => {
      const color = issue.severity === 'critical' ? '#d32f2f' : 
                   issue.severity === 'high' ? '#f57c00' : 
                   issue.severity === 'medium' ? '#fbc02d' : '#9e9e9e';
      
      html += `
        <div style="background: #fafafa; padding: 10px; margin: 8px 0; border-left: 3px solid ${color}; border-radius: 4px;">
          <div style="font-weight: bold; color: ${color};">
            ${issue.message}
          </div>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">
            Impact: ${issue.impact}
          </div>
        </div>
      `;
    });
  }
  
  sslSection.innerHTML = html;
}

function displayComplianceAnalysis(data) {
  // Add new Compliance tab or section
  let complianceSection = document.getElementById('complianceAnalysis');
  if (!complianceSection) {
    const securityTab = document.getElementById('security-tab');
    if (!securityTab) return;
    
    complianceSection = document.createElement('div');
    complianceSection.id = 'complianceAnalysis';
    complianceSection.style.cssText = 'margin: 20px 0; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #e0e0e0;';
    
    securityTab.appendChild(complianceSection);
  }
  
  let html = '<h3>⚖️ GDPR/CCPA Compliance Analysis</h3>';
  
  // Overall compliance score
  if (data.overall) {
    const gradeColor = {
      'A': '#4CAF50',
      'B': '#8BC34A',
      'C': '#FFC107',
      'D': '#FF9800',
      'F': '#F44336'
    }[data.overall.grade] || '#999';
    
    html += `
      <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); 
                  padding: 20px; border-radius: 8px; margin: 10px 0;">
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-size: 32px; font-weight: bold; color: ${data.gdpr.compliant ? '#4CAF50' : '#f44336'};">
              ${data.gdpr.score}%
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
              GDPR Score
            </div>
          </div>
          <div>
            <div style="font-size: 48px; font-weight: bold; color: ${gradeColor};">
              ${data.overall.grade}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
              Overall Grade
            </div>
          </div>
          <div>
            <div style="font-size: 32px; font-weight: bold; color: ${data.ccpa.compliant ? '#4CAF50' : '#f44336'};">
              ${data.ccpa.score}%
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
              CCPA Score
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #90caf9;">
          <div style="color: #1976d2; font-weight: bold;">
            ${data.overall.summary}
          </div>
        </div>
      </div>
    `;
  }
  
  // Cookie consent status
  html += '<div style="margin-top: 15px;"><strong>Cookie Consent:</strong></div>';
  html += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 8px;">';
  
  const consentChecks = [
    { label: 'Consent Banner', value: data.cookies.hasConsentBanner },
    { label: 'Reject Button', value: data.cookies.hasRejectButton },
    { label: 'Granular Control', value: data.cookies.granularControl },
    { label: 'No Pre-checked Boxes', value: !data.cookies.preCheckedBoxes }
  ];
  
  consentChecks.forEach(check => {
    html += `
      <div style="display: flex; align-items: center; padding: 8px; background: ${check.value ? '#e8f5e9' : '#ffebee'}; 
                  border-radius: 4px;">
        <span style="margin-right: 8px;">${check.value ? '✅' : '❌'}</span>
        <span style="font-size: 12px;">${check.label}</span>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Privacy rights
  html += '<div style="margin-top: 15px;"><strong>Privacy Rights:</strong></div>';
  html += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 8px;">';
  
  const privacyChecks = [
    { label: 'Privacy Policy', value: data.privacy.hasPrivacyPolicy },
    { label: 'Easily Accessible', value: data.privacy.privacyPolicyAccessible },
    { label: 'Opt-Out Option', value: data.privacy.hasOptOut },
    { label: 'Data Deletion', value: data.privacy.hasDataDeletion }
  ];
  
  privacyChecks.forEach(check => {
    html += `
      <div style="display: flex; align-items: center; padding: 8px; background: ${check.value ? '#e8f5e9' : '#ffebee'}; 
                  border-radius: 4px;">
        <span style="margin-right: 8px;">${check.value ? '✅' : '❌'}</span>
        <span style="font-size: 12px;">${check.label}</span>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Violations
  const allViolations = [...(data.gdpr.violations || []), ...(data.ccpa.violations || [])];
  if (allViolations.length > 0) {
    html += '<div style="margin-top: 15px;"><strong>Compliance Violations:</strong></div>';
    
    allViolations.slice(0, 3).forEach(violation => {
      const color = violation.severity === 'critical' ? '#d32f2f' : 
                   violation.severity === 'high' ? '#f57c00' : '#fbc02d';
      
      html += `
        <div style="background: #fafafa; padding: 10px; margin: 8px 0; border-left: 3px solid ${color}; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <div style="font-weight: bold; color: ${color};">
                ${violation.issue}
              </div>
              <div style="font-size: 11px; color: #666; margin-top: 4px;">
                ${violation.rule} • ${violation.recommendation}
              </div>
            </div>
            <span style="background: ${color}22; color: ${color}; padding: 2px 6px; 
                         border-radius: 3px; font-size: 10px; font-weight: bold; margin-left: 10px;">
              ${violation.severity.toUpperCase()}
            </span>
          </div>
        </div>
      `;
    });
  }
  
  complianceSection.innerHTML = html;
}

// Hook into the popup
if (typeof DrDOMAdvancedPopup !== 'undefined') {
  const originalFetchData = DrDOMAdvancedPopup.prototype.fetchData;
  DrDOMAdvancedPopup.prototype.fetchData = function() {
    originalFetchData.call(this);
    displayComprehensiveAnalysis.call(this);
  };
}

console.log('[Dr. DOM] Comprehensive display loaded');