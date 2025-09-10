/**
 * Cloudflare Radar Display - Shows Cloudflare analysis in popup
 */

function displayCloudflareAnalysis() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    
    const domain = new URL(tabs[0].url).hostname;
    const storageKey = `drDOM_${domain}_cloudflare`;
    
    chrome.storage.local.get(storageKey, (result) => {
      const cfData = result[storageKey];
      if (!cfData || !cfData.results) return;
      
      // Add to Security tab
      injectCloudflareSection(cfData.results);
    });
  });
}

function injectCloudflareSection(data) {
  const securityTab = document.getElementById('security-tab');
  if (!securityTab) return;
  
  // Remove old section if exists
  const oldSection = document.getElementById('cloudflareSection');
  if (oldSection) oldSection.remove();
  
  const cfSection = document.createElement('div');
  cfSection.id = 'cloudflareSection';
  cfSection.className = 'security-section';
  cfSection.style.cssText = `
    margin: 20px 0;
    padding: 20px;
    background: linear-gradient(135deg, #f97316, #fb923c);
    border-radius: 12px;
    color: white;
  `;
  
  // Build content based on findings
  let rankingInfo = '';
  if (data.ranking) {
    rankingInfo = `
      <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
        <strong>🌍 Domain Ranking:</strong> 
        ${data.ranking.isPopular ? 
          `✅ Top 100 Website (Trust Score: ${data.ranking.trustScore}/100)` : 
          '📊 Not in top 100 domains'}
      </div>
    `;
  }
  
  let typosquattingWarning = '';
  if (data.security.typosquatting) {
    typosquattingWarning = `
      <div style="background: rgba(220,38,38,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #dc2626;">
        <strong>⚠️ TYPOSQUATTING DETECTED!</strong><br>
        This domain is suspiciously similar to: <strong>${data.security.typosquatting.similarTo}</strong><br>
        <small>This could be a phishing attempt. Verify the URL carefully!</small>
      </div>
    `;
  }
  
  let cloudflareProtection = '';
  if (data.security.cloudflare) {
    const cf = data.security.cloudflare;
    cloudflareProtection = `
      <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
        <strong>☁️ Cloudflare Protection:</strong> ${cf.protected ? '✅ Active' : '❌ Not Detected'}<br>
        ${cf.protected ? `
          <div style="margin-top: 8px; font-size: 12px;">
            Benefits: ${cf.benefits.join(', ')}
          </div>
        ` : ''}
      </div>
    `;
  }
  
  let performanceMetrics = '';
  if (data.performance && data.performance.score !== undefined) {
    const perf = data.performance;
    const scoreColor = perf.score >= 80 ? '#10b981' : perf.score >= 60 ? '#f59e0b' : '#ef4444';
    
    performanceMetrics = `
      <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
        <strong>⚡ Performance Score:</strong> 
        <span style="color: ${scoreColor}; font-weight: bold;">${perf.score}/100</span><br>
        <div style="margin-top: 8px; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
          <div>• TTFB: ${perf.ttfb}ms</div>
          <div>• Load: ${perf.loadTime}ms</div>
          <div>• DNS: ${perf.dns}ms</div>
          <div>• Protocol: ${perf.protocol}</div>
        </div>
      </div>
    `;
  }
  
  let securityHeaders = '';
  if (data.security.headers) {
    const headerScore = data.security.headerScore || 0;
    const scoreColor = headerScore >= 80 ? '#10b981' : headerScore >= 50 ? '#f59e0b' : '#ef4444';
    
    securityHeaders = `
      <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px;">
        <strong>🔒 Security Headers:</strong> 
        <span style="color: ${scoreColor}; font-weight: bold;">${headerScore.toFixed(0)}%</span><br>
        <div style="margin-top: 8px; font-size: 11px;">
          ${Object.entries(data.security.headers)
            .filter(([_, h]) => !h.present)
            .slice(0, 3)
            .map(([name, h]) => `• Missing: ${name}`)
            .join('<br>')}
        </div>
      </div>
    `;
  }
  
  cfSection.innerHTML = `
    <h3 style="margin: 0 0 15px 0; font-size: 18px;">
      ☁️ Cloudflare Radar Analysis
    </h3>
    ${typosquattingWarning}
    ${rankingInfo}
    ${cloudflareProtection}
    ${performanceMetrics}
    ${securityHeaders}
  `;
  
  // Insert after malware section or at beginning
  const malwareSection = document.querySelector('[id*="malware"]');
  if (malwareSection && malwareSection.parentNode) {
    malwareSection.parentNode.insertBefore(cfSection, malwareSection.nextSibling);
  } else {
    securityTab.insertBefore(cfSection, securityTab.firstChild);
  }
}

// Initialize when popup loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(displayCloudflareAnalysis, 1500);
});

// Update when tab changes
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-btn') && 
      e.target.getAttribute('data-tab') === 'security') {
    setTimeout(displayCloudflareAnalysis, 100);
  }
});

// Listen for updates from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'cloudflareAnalysisComplete') {
    setTimeout(displayCloudflareAnalysis, 100);
  }
});

console.log('[Dr. DOM] Cloudflare display loaded');