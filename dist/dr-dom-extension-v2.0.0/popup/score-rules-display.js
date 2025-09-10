/**
 * Score Rules Display - Always shows scoring transparency
 * Displays on every page load
 */

// Auto-inject scoring rules when popup loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('[Score Rules] Initializing scoring transparency display...');
  
  // Wait a bit for tabs to load
  setTimeout(() => {
    injectScoringRules();
    setupScoringRulesButton();
  }, 500);
});

function setupScoringRulesButton() {
  // Add a button to show scoring rules
  const headerControls = document.querySelector('.header-controls');
  if (headerControls && !document.getElementById('scoringRulesBtn')) {
    const rulesBtn = document.createElement('button');
    rulesBtn.id = 'scoringRulesBtn';
    rulesBtn.innerHTML = '📊 How We Score';
    rulesBtn.className = 'btn btn-primary';
    rulesBtn.style.cssText = `
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      margin-right: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
    `;
    
    rulesBtn.onmouseover = () => {
      rulesBtn.style.transform = 'translateY(-1px)';
      rulesBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    };
    
    rulesBtn.onmouseout = () => {
      rulesBtn.style.transform = 'translateY(0)';
      rulesBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    };
    
    rulesBtn.onclick = () => {
      const modal = document.getElementById('scoringRulesModal');
      if (modal) {
        modal.style.display = 'block';
      }
    };
    
    // Insert before the first button
    headerControls.insertBefore(rulesBtn, headerControls.firstChild);
  }
}

function injectScoringRules() {
  // Create modal for scoring rules
  if (!document.getElementById('scoringRulesModal')) {
    const modal = document.createElement('div');
    modal.id = 'scoringRulesModal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      display: none;
    `;
    
    modal.innerHTML = `
      <div style="position: relative;">
        <button id="scoringModalClose" 
                style="position: absolute; right: -20px; top: -20px; 
                       background: #ef4444; color: white; border: none; 
                       width: 30px; height: 30px; border-radius: 50%; 
                       cursor: pointer; font-size: 18px; 
                       transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)';">×</button>
        
        <h2 style="margin: 0 0 20px 0; color: #1e293b;">
          🛡️ How We Calculate Privacy & Safety Scores
        </h2>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #0369a1; margin: 0 0 10px 0; font-size: 16px;">
            Privacy Score (100 points)
          </h3>
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
            We start with 100 points and subtract based on tracking severity:
          </p>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
            <li><strong style="color: #dc2626;">Fingerprinting: -15 points</strong> (Most invasive)</li>
            <li><strong style="color: #ea580c;">Data Brokers: -10 points</strong> (Sell your data)</li>
            <li><strong style="color: #f59e0b;">Advertising: -5 points</strong> per tracker</li>
            <li><strong style="color: #eab308;">Social Media: -4 points</strong> per tracker</li>
            <li><strong style="color: #84cc16;">Analytics: -3 points</strong> per tracker</li>
            <li><strong style="color: #10b981;">CDN/Functional: -1 point</strong> (Necessary)</li>
          </ul>
        </div>
        
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px;">
            Safety Score Components
          </h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
            <li><strong>Malware Detection:</strong> URLhaus database + heuristics</li>
            <li><strong>Phishing Detection:</strong> Pattern matching + suspicious URLs</li>
            <li><strong>SSL/TLS Analysis:</strong> Certificate validation + security headers</li>
            <li><strong>Crypto Scams:</strong> CryptoScamDB + known patterns</li>
            <li><strong>Privacy Policies:</strong> ToS;DR ratings (A-E grades)</li>
          </ul>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">
            Grade Scale
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
            <div><strong style="color: #10b981;">A (90-100):</strong> Excellent privacy</div>
            <div><strong style="color: #84cc16;">B (80-89):</strong> Good, minor issues</div>
            <div><strong style="color: #eab308;">C (70-79):</strong> Average, some concerns</div>
            <div><strong style="color: #f59e0b;">D (60-69):</strong> Poor, heavy tracking</div>
            <div><strong style="color: #ef4444;">F (0-59):</strong> Severe violations</div>
          </div>
        </div>
        
        <div style="background: #fefce8; padding: 15px; border-radius: 8px;">
          <h3 style="color: #854d0e; margin: 0 0 10px 0; font-size: 16px;">
            Data Sources (All Free & Open Source)
          </h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #92400e;">
            <li><strong>EasyList & EasyPrivacy:</strong> 5,000+ tracker patterns</li>
            <li><strong>Disconnect.me:</strong> Tracking protection lists</li>
            <li><strong>URLhaus:</strong> Real-time malware database</li>
            <li><strong>ToS;DR:</strong> Privacy policy ratings</li>
            <li><strong>CryptoScamDB:</strong> Cryptocurrency scam database</li>
            <li><strong>Wappalyzer:</strong> Technology detection patterns</li>
          </ul>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://github.com/easylist/easylist" target="_blank" 
             style="color: #3b82f6; text-decoration: none; font-size: 12px; margin: 0 10px;">
            View EasyList →
          </a>
          <a href="https://tosdr.org" target="_blank" 
             style="color: #3b82f6; text-decoration: none; font-size: 12px; margin: 0 10px;">
            View ToS;DR →
          </a>
          <a href="https://urlhaus.abuse.ch" target="_blank" 
             style="color: #3b82f6; text-decoration: none; font-size: 12px; margin: 0 10px;">
            View URLhaus →
          </a>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for close button
    const closeBtn = modal.querySelector('#scoringModalClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    
    // Also close when clicking outside the modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Also add inline score display in Security tab
  const securityTab = document.getElementById('security-tab');
  if (securityTab && !document.getElementById('inlineScoringRules')) {
    const inlineRules = document.createElement('div');
    inlineRules.id = 'inlineScoringRules';
    inlineRules.style.cssText = `
      margin: 20px 0;
      padding: 20px;
      background: linear-gradient(135deg, #eff6ff, #f0f9ff);
      border-radius: 12px;
      border: 2px solid #3b82f6;
    `;
    
    inlineRules.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">
        📊 How Privacy Scores Work
      </h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 14px;">Point System (Start: 100)</h4>
          <div style="background: white; padding: 12px; border-radius: 8px;">
            <div style="font-size: 12px; line-height: 1.8;">
              <div style="color: #dc2626;">• Fingerprinting: <strong>-15 pts</strong></div>
              <div style="color: #ea580c;">• Data Brokers: <strong>-10 pts</strong></div>
              <div style="color: #f59e0b;">• Advertising: <strong>-5 pts</strong></div>
              <div style="color: #eab308;">• Social Media: <strong>-4 pts</strong></div>
              <div style="color: #84cc16;">• Analytics: <strong>-3 pts</strong></div>
              <div style="color: #10b981;">• CDN/Functional: <strong>-1 pt</strong></div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 14px;">Grade Scale</h4>
          <div style="background: white; padding: 12px; border-radius: 8px;">
            <div style="font-size: 12px; line-height: 1.8;">
              <div><span style="color: #10b981; font-weight: bold;">A:</span> 90-100 (Excellent)</div>
              <div><span style="color: #84cc16; font-weight: bold;">B:</span> 80-89 (Good)</div>
              <div><span style="color: #eab308; font-weight: bold;">C:</span> 70-79 (Average)</div>
              <div><span style="color: #f59e0b; font-weight: bold;">D:</span> 60-69 (Poor)</div>
              <div><span style="color: #ef4444; font-weight: bold;">F:</span> 0-59 (Failing)</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 12px; font-size: 11px; color: #64748b; text-align: center;">
        Click "How We Score" button in header for complete details and data sources
      </div>
    `;
    
    // Insert at the beginning of security tab
    securityTab.insertBefore(inlineRules, securityTab.firstChild);
  }
}

// Also update when tab changes
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('tab-btn')) {
    setTimeout(() => {
      if (e.target.getAttribute('data-tab') === 'security') {
        injectScoringRules();
      }
    }, 100);
  }
});

console.log('[Dr. DOM] Score rules display loaded');