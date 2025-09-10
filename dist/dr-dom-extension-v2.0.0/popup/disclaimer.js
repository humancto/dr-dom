/**
 * Disclaimer Display - Shows limitations and accuracy notices
 */

function initializeDisclaimer() {
  // Check if user has seen disclaimer
  chrome.storage.local.get('disclaimerAccepted', (result) => {
    if (!result.disclaimerAccepted) {
      showDisclaimerModal();
    }
    
    // Always add disclaimer button to footer
    addDisclaimerButton();
  });
}

function showDisclaimerModal() {
  // Check if modal already exists
  if (document.getElementById('disclaimerModal')) return;
  
  const modal = document.createElement('div');
  modal.id = 'disclaimerModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease;
    ">
      <div style="
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 30px;
        border-radius: 16px 16px 0 0;
      ">
        <h2 style="margin: 0 0 10px 0; font-size: 24px;">
          ⚠️ Important Disclaimer
        </h2>
        <p style="margin: 0; opacity: 0.95; font-size: 14px;">
          Please read before using Dr. DOM
        </p>
      </div>
      
      <div style="padding: 30px;">
        <div style="
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">
            📊 Estimates & Calculations
          </h3>
          <p style="color: #78350f; font-size: 13px; line-height: 1.6; margin: 0;">
            • <strong>Money Trail:</strong> Revenue calculations are estimates based on industry averages, not actual payments<br>
            • <strong>Privacy Scores:</strong> Based on visible indicators, not comprehensive audits<br>
            • <strong>Data Values:</strong> Approximations using 2024 market research
          </p>
        </div>
        
        <div style="
          background: #fee2e2;
          border: 2px solid #ef4444;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px;">
            🚨 Critical Limitations
          </h3>
          <p style="color: #7f1d1d; font-size: 13px; line-height: 1.6; margin: 0;">
            • <strong>Not Legal Advice:</strong> GDPR/CCPA compliance checks are indicators only<br>
            • <strong>API Rate Limits:</strong> URLhaus (100/min), DNS (1000/hr), Cloudflare (500/hr)<br>
            • <strong>Detection Gaps:</strong> Can't detect server-side tracking, fingerprinting, or zero-day threats<br>
            • <strong>Revenue Estimates:</strong> Could be 10x higher or lower than actual<br>
            • <strong>False Positives:</strong> ~5% of "trackers" may be legitimate services<br>
            • <strong>Performance Impact:</strong> Uses 30-100MB RAM, adds 100-200ms page load
          </p>
        </div>
        
        <div style="
          background: #dcfce7;
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <h3 style="color: #14532d; margin: 0 0 10px 0; font-size: 16px;">
            ✅ What We Guarantee
          </h3>
          <p style="color: #14532d; font-size: 13px; line-height: 1.6; margin: 0;">
            • <strong>100% Privacy:</strong> All analysis happens locally in your browser<br>
            • <strong>No Data Collection:</strong> We never collect or sell your data<br>
            • <strong>Open Source:</strong> Full code transparency on GitHub<br>
            • <strong>Free Forever:</strong> Core features will always be free
          </p>
        </div>
        
        <div style="
          background: #f3f4f6;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        ">
          <strong>Technical Notes:</strong><br>
          • Pattern matching uses EasyList/EasyPrivacy (may have false positives)<br>
          • Malware detection via URLhaus (community-maintained database)<br>
          • CPM rates based on 2024 industry reports (updated periodically)<br>
          • Domain analysis uses public DNS records (may be cached/outdated)<br>
          <br>
          <a href="https://github.com/humancto/dr-dom/blob/main/LIMITATIONS.md" 
             target="_blank" 
             style="color: #667eea; text-decoration: underline;">
            📋 View Full Limitations Documentation
          </a>
        </div>
        
        <div style="
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          margin-top: 20px;
        ">
          <label style="
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            font-size: 14px;
            color: #4b5563;
          ">
            <input type="checkbox" id="dontShowAgain" style="
              width: 18px;
              height: 18px;
              cursor: pointer;
            ">
            Don't show this again
          </label>
        </div>
        
        <div style="
          display: flex;
          gap: 10px;
          margin-top: 20px;
        ">
          <button id="acceptDisclaimer" style="
            flex: 1;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
            I Understand - Continue
          </button>
          <button id="viewGithub" style="
            background: white;
            color: #6b7280;
            border: 2px solid #e5e7eb;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
          " onmouseover="this.style.borderColor='#667eea'; this.style.color='#667eea';" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#6b7280';">
            View Source
          </button>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;
  
  document.body.appendChild(modal);
  
  // Event handlers
  document.getElementById('acceptDisclaimer').addEventListener('click', () => {
    const dontShow = document.getElementById('dontShowAgain').checked;
    if (dontShow) {
      chrome.storage.local.set({ disclaimerAccepted: true });
    }
    modal.remove();
  });
  
  document.getElementById('viewGithub').addEventListener('click', () => {
    window.open('https://github.com/humancto/dr-dom', '_blank');
  });
}

function addDisclaimerButton() {
  // Add small disclaimer link at bottom of popup
  const existingButton = document.getElementById('disclaimerButton');
  if (existingButton) return;
  
  const button = document.createElement('div');
  button.id = 'disclaimerButton';
  button.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 1000;
  `;
  button.innerHTML = '⚠️ Disclaimer';
  button.onmouseover = () => {
    button.style.background = 'rgba(107, 114, 128, 0.2)';
    button.style.color = '#4b5563';
  };
  button.onmouseout = () => {
    button.style.background = 'rgba(107, 114, 128, 0.1)';
    button.style.color = '#6b7280';
  };
  button.onclick = () => showDisclaimerModal();
  
  document.body.appendChild(button);
}

// Initialize on popup load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeDisclaimer, 500);
});

// Also show accuracy notice in specific features
function addAccuracyBadge(element, accuracy = 'Estimate') {
  const badge = document.createElement('span');
  badge.style.cssText = `
    display: inline-block;
    background: rgba(251, 191, 36, 0.2);
    color: #92400e;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
    margin-left: 5px;
    vertical-align: super;
  `;
  badge.textContent = accuracy;
  badge.title = 'This is an estimate based on available data';
  element.appendChild(badge);
}

// Export for use in other modules
window.addAccuracyBadge = addAccuracyBadge;

console.log('[Dr. DOM] Disclaimer module loaded');