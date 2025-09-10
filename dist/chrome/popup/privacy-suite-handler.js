/**
 * Privacy Suite Handler for Dr. DOM
 */

(function() {
  // Wait for DOM to be ready
  function initPrivacySuite() {
    console.log('🛡️ Initializing Privacy Suite...');
    
    // Load privacy stats
    loadPrivacyStats();
    
    // Setup toggle handlers
    setupToggles();
    
    // Setup fun feature buttons
    setupFunButtons();
    
    // Setup cookie cleaning buttons
    setupCookieCleaningButtons();
    
    // Update stats every 2 seconds
    setInterval(loadPrivacyStats, 2000);
  }
  
  function setupCookieCleaningButtons() {
    // Clean All Cookies
    const cleanAllBtn = document.getElementById('cleanAllCookiesBtn');
    if (cleanAllBtn) {
      cleanAllBtn.addEventListener('click', () => cleanCookies('ALL_COOKIES'));
    }
    
    // Clean Tracking Cookies
    const cleanTrackingBtn = document.getElementById('cleanTrackingCookiesBtn');
    if (cleanTrackingBtn) {
      cleanTrackingBtn.addEventListener('click', () => cleanCookies('TRACKING_COOKIES'));
    }
    
    // Clean Third Party Cookies
    const cleanThirdPartyBtn = document.getElementById('cleanThirdPartyBtn');
    if (cleanThirdPartyBtn) {
      cleanThirdPartyBtn.addEventListener('click', () => cleanCookies('THIRD_PARTY'));
    }
    
    // Clean Local Storage
    const cleanLocalBtn = document.getElementById('cleanLocalStorageBtn');
    if (cleanLocalBtn) {
      cleanLocalBtn.addEventListener('click', () => cleanStorage('LOCAL_STORAGE'));
    }
    
    // Clean Session Storage
    const cleanSessionBtn = document.getElementById('cleanSessionStorageBtn');
    if (cleanSessionBtn) {
      cleanSessionBtn.addEventListener('click', () => cleanStorage('SESSION_STORAGE'));
    }
    
    // Show Cookie List
    const showCookiesBtn = document.getElementById('showCookieListBtn');
    if (showCookiesBtn) {
      showCookiesBtn.addEventListener('click', () => showCookieList());
    }
  }
  
  function cleanCookies(cleanType) {
    showCleaningResult('⏳ Cleaning cookies...');
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.runtime.sendMessage({
          type: 'CLEAN_SPECIFIC_COOKIES',
          cleanType: cleanType,
          tab: tabs[0]
        }, (response) => {
          if (response && response.success) {
            const results = response.results;
            let message = '';
            
            switch(cleanType) {
              case 'ALL_COOKIES':
                message = `🗑️ Removed ${results.cleaned} cookies\n`;
                if (results.details.length > 0) {
                  message += `Cookies: ${results.details.slice(0, 5).join(', ')}`;
                  if (results.details.length > 5) {
                    message += ` and ${results.details.length - 5} more...`;
                  }
                }
                break;
              case 'TRACKING_COOKIES':
                message = `🎯 Removed ${results.cleaned} tracking cookies\n`;
                if (results.details.length > 0) {
                  message += `Including: ${results.details.slice(0, 5).join(', ')}`;
                }
                break;
              case 'THIRD_PARTY':
                message = `🌐 Removed ${results.cleaned} third-party cookies`;
                break;
            }
            
            showCleaningResult(message || '✅ Cleaning complete!', 'success');
            
            // Update stats
            loadPrivacyStats();
          } else {
            showCleaningResult('❌ Failed to clean cookies: ' + (response?.error || 'Unknown error'), 'error');
          }
        });
      }
    });
  }
  
  function cleanStorage(storageType) {
    showCleaningResult('⏳ Cleaning storage...');
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Send message to content script to clear storage
        chrome.tabs.sendMessage(tabs[0].id, {
          type: storageType === 'LOCAL_STORAGE' ? 'CLEAR_LOCAL_STORAGE' : 'CLEAR_SESSION_STORAGE'
        }, (response) => {
          if (chrome.runtime.lastError) {
            showCleaningResult('❌ Error: Make sure you\'re on a webpage (not chrome://)', 'error');
          } else if (response && response.success) {
            const storageLabel = storageType === 'LOCAL_STORAGE' ? 'Local Storage' : 'Session Storage';
            showCleaningResult(`✅ ${storageLabel} cleared! Removed ${response.itemsCleared || 0} items`, 'success');
          } else {
            showCleaningResult('❌ Failed to clear storage', 'error');
          }
        });
      }
    });
  }
  
  function showCookieList() {
    showCleaningResult('📋 Loading cookies...');
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = new URL(tabs[0].url);
        chrome.cookies.getAll({ domain: url.hostname }, (cookies) => {
          if (cookies.length === 0) {
            showCleaningResult('🍪 No cookies found for this domain', 'info');
          } else {
            let message = `🍪 Found ${cookies.length} cookies:\n\n`;
            cookies.forEach((cookie, index) => {
              if (index < 10) {  // Show first 10
                const isSecure = cookie.secure ? '🔒' : '🔓';
                const isHttpOnly = cookie.httpOnly ? '🛡️' : '';
                message += `${isSecure} ${cookie.name} ${isHttpOnly}\n`;
              }
            });
            if (cookies.length > 10) {
              message += `\n... and ${cookies.length - 10} more`;
            }
            showCleaningResult(message, 'info');
          }
        });
      }
    });
  }
  
  function showCleaningResult(message, type = 'info') {
    const resultsDiv = document.getElementById('cleaningResults');
    const contentDiv = document.getElementById('cleaningResultsContent');
    
    if (resultsDiv && contentDiv) {
      resultsDiv.style.display = 'block';
      
      // Set background color based on type
      const colors = {
        success: '#dcfce7',
        error: '#fee2e2',
        info: '#f0f9ff',
        warning: '#fef3c7'
      };
      
      resultsDiv.style.background = colors[type] || colors.info;
      contentDiv.innerHTML = `<pre style="margin: 0; font-family: monospace; font-size: 11px; white-space: pre-wrap;">${message}</pre>`;
      
      // Auto-hide after 5 seconds for success messages
      if (type === 'success') {
        setTimeout(() => {
          resultsDiv.style.display = 'none';
        }, 5000);
      }
    }
  }
  
  function loadPrivacyStats() {
    // Get stats from storage
    chrome.storage.local.get(['globalPrivacyStats'], (result) => {
      if (result.globalPrivacyStats) {
        const stats = result.globalPrivacyStats;
        updateElement('trackersBlocked', stats.trackersBlocked || 0);
        updateElement('cookiesCleaned', stats.cookiesCleaned || 0);
        updateElement('dataValueSaved', `$${(stats.dataValueSaved || 0).toFixed(2)}`);
        
        // Calculate privacy score
        const score = Math.max(0, 100 - (stats.trackersBlocked || 0) - (stats.cookiesCleaned || 0) / 2);
        updateElement('privacyScore', Math.round(score));
      }
    });
  }
  
  function setupToggles() {
    const toggles = [
      { id: 'trackerBlockingToggle', setting: 'trackerBlocking' },
      { id: 'cookieCleaningToggle', setting: 'cookieCleaning' },
      { id: 'webrtcProtectionToggle', setting: 'webrtcProtection' },
      { id: 'fingerprintToggle', setting: 'fingerprintPoisoning' }
    ];
    
    toggles.forEach(toggle => {
      const element = document.getElementById(toggle.id);
      if (element) {
        // Load saved state
        chrome.storage.local.get(['privacyConfig'], (result) => {
          const config = result.privacyConfig || {};
          element.checked = config[toggle.setting] !== false;
        });
        
        // Handle changes
        element.addEventListener('change', (e) => {
          updatePrivacySetting(toggle.setting, e.target.checked);
        });
      }
    });
  }
  
  function updatePrivacySetting(setting, value) {
    chrome.storage.local.get(['privacyConfig'], (result) => {
      const config = result.privacyConfig || {};
      config[setting] = value;
      chrome.storage.local.set({ privacyConfig: config });
      
      // Send to active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updatePrivacyConfig',
            config: { [setting]: value }
          });
        }
      });
    });
  }
  
  function setupFunButtons() {
    // Roast button
    const roastBtn = document.getElementById('showRoastBtn');
    if (roastBtn) {
      roastBtn.addEventListener('click', () => {
        console.log('🔥 Roast button clicked');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'showRoast' }, (response) => {
              console.log('Roast response:', response);
              if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError);
                showFunOutput('❌ Make sure you\'re on a webpage (not chrome://)');
              } else if (response && response.success) {
                showFunOutput('🔥 Privacy Report opened on the page!');
                // Close popup after a moment
                setTimeout(() => window.close(), 1500);
              } else {
                showFunOutput('🔥 Check the page for the privacy report!');
            });
          }
        });
      });
    }
    
    // Weather button
    const weatherBtn = document.getElementById('weatherReportBtn');
    if (weatherBtn) {
      weatherBtn.addEventListener('click', () => {
        console.log('🌤️ Weather button clicked');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getWeatherReport' }, (response) => {
              console.log('Weather response:', response);
              if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError);
                showFunOutput('❌ Make sure you\'re on a webpage (not chrome://)');
              } else if (response && response.success) {
                showFunOutput('🌤️ Privacy Report opened on the page!');
                // Close popup after a moment
                setTimeout(() => window.close(), 1500);
              } else {
                showFunOutput('🌤️ Check the page for the privacy report!');
            });
          }
        });
      });
    }
    
    // Cookie banner button
    const bannerBtn = document.getElementById('showBannerBtn');
    if (bannerBtn) {
      bannerBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'showCookieBanner' });
            showFunOutput('🍪 Cookie banner triggered on the page!');
          }
        });
      });
    }
  }
  
  function showFunOutput(text) {
    const output = document.getElementById('funOutput');
    if (output) {
      output.textContent = text;
      output.style.display = 'block';
      
      // Hide after 5 seconds
      setTimeout(() => {
        output.style.display = 'none';
      }, 5000);
    }
  }
  
  function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrivacySuite);
  } else {
    initPrivacySuite();
  }
})();