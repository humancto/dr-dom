/**
 * Privacy Suite Handler for Dr. DOM - FIXED VERSION
 * Handles Privacy Suite tab functionality with proper initialization
 */

console.log('🛡️ [Privacy Suite] Script loaded at', new Date().toISOString());

// Immediately add a click listener to see if ANY clicks work
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOM Content Loaded - privacy suite');
  
  // Try to add click handler directly to the button
  setTimeout(() => {
    const btn = document.getElementById('showCookieListBtn');
    console.log('🔍 Looking for showCookieListBtn:', btn);
    
    if (btn) {
      btn.onclick = () => {
        console.log('🍪🍪🍪 SHOW COOKIES CLICKED!!!');
        alert('Show cookies clicked!');
      };
    }
  }, 500);
});

// Wait for full DOM and other scripts to load
function initPrivacySuite() {
  console.log('🛡️ [Privacy Suite] Starting initialization...');
  
  // Check if we're on the Privacy Suite tab
  const privacyTab = document.getElementById('privacy-tab');
  if (!privacyTab) {
    console.error('❌ Privacy Suite tab not found!');
    return;
  }
  
  console.log('✅ Privacy Suite tab found');
  
  // Initialize components
  loadPrivacyStats();
  setupToggles();
  setupFunButtons();
  setupCookieCleaningButtons();
  
  // Update stats every 2 seconds
  setInterval(loadPrivacyStats, 2000);
}

function loadPrivacyStats() {
  console.log('📊 Loading privacy stats...');
  
  // Get current tab's domain
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      const moneyGameKey = `drDOM_${domain}_moneyGame`;
      
      // Get both stats and money game data
      chrome.storage.local.get(['globalPrivacyStats', moneyGameKey], (result) => {
        // Load privacy stats
        if (result.globalPrivacyStats) {
          const stats = result.globalPrivacyStats;
          console.log('📊 Stats loaded:', stats);
          
          updateElement('trackersBlocked', stats.trackersBlocked || 0);
          updateElement('cookiesCleaned', stats.cookiesCleaned || 0);
          updateElement('dataValueSaved', `$${(stats.dataValueSaved || 0).toFixed(2)}`);
          
          // Calculate privacy score
          const score = Math.max(0, 100 - (stats.trackersBlocked || 0) - (stats.cookiesCleaned || 0) / 2);
          updateElement('privacyScore', Math.round(score));
        } else {
          console.log('📊 No stats found, using defaults');
          // Set default values
          updateElement('trackersBlocked', 0);
          updateElement('cookiesCleaned', 0);
          updateElement('dataValueSaved', '$0.00');
          updateElement('privacyScore', 100);
        }
        
        // Load money game data
        if (result[moneyGameKey] && result[moneyGameKey].score) {
          const gameScore = result[moneyGameKey].score;
          console.log('💰 Money game data loaded:', gameScore);
          
          // Update daily value
          updateElement('dailyValue', `$${gameScore.dollars}`);
          
          // Calculate yearly estimate
          const yearlyEstimate = (parseFloat(gameScore.dollars) * 365).toFixed(0);
          updateElement('yearlyEstimate', `$${yearlyEstimate}/year`);
        } else {
          console.log('💰 No money game data, using defaults');
          updateElement('dailyValue', '$0.00');
          updateElement('yearlyEstimate', '$0/year');
        }
      });
    }
  });
}

function setupToggles() {
  console.log('🎚️ Setting up toggles...');
  
  const toggles = [
    { id: 'trackerBlockingToggle', setting: 'trackerBlocking' },
    { id: 'cookieCleaningToggle', setting: 'cookieCleaning' },
    { id: 'webrtcProtectionToggle', setting: 'webrtcProtection' },
    { id: 'fingerprintToggle', setting: 'fingerprintPoisoning' }
  ];
  
  toggles.forEach(toggle => {
    const element = document.getElementById(toggle.id);
    if (element) {
      console.log(`✅ Found toggle: ${toggle.id}`);
      
      // Load saved state
      chrome.storage.local.get(['privacyConfig'], (result) => {
        const config = result.privacyConfig || {};
        element.checked = config[toggle.setting] !== false;
      });
      
      // Remove existing listeners to avoid duplicates
      element.replaceWith(element.cloneNode(true));
      const newElement = document.getElementById(toggle.id);
      
      // Handle changes
      newElement.addEventListener('change', (e) => {
        console.log(`🎚️ Toggle changed: ${toggle.setting} = ${e.target.checked}`);
        updatePrivacySetting(toggle.setting, e.target.checked);
      });
    } else {
      console.warn(`⚠️ Toggle not found: ${toggle.id}`);
    }
  });
}

function updatePrivacySetting(setting, value) {
  chrome.storage.local.get(['privacyConfig'], (result) => {
    const config = result.privacyConfig || {};
    config[setting] = value;
    chrome.storage.local.set({ privacyConfig: config }, () => {
      console.log(`💾 Saved setting: ${setting} = ${value}`);
    });
    
    // Send to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && !tabs[0].url.startsWith('chrome://')) {
        // Send specific message for cookie cleaning toggle
        if (setting === 'cookieCleaning') {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'TOGGLE_COOKIE_CLEANING',
            enabled: value
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error toggling cookie cleaning:', chrome.runtime.lastError);
            } else {
              console.log('Cookie auto-cleaner toggled:', value ? 'ON' : 'OFF');
            }
          });
        }
        
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updatePrivacyConfig',
          config: { [setting]: value }
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending to content script:', chrome.runtime.lastError);
          }
        });
      }
    });
  });
}

function setupFunButtons() {
  console.log('🎮 Setting up fun buttons...');
  
  // Roast button
  const roastBtn = document.getElementById('showRoastBtn');
  if (roastBtn) {
    console.log('✅ Found roast button');
    
    // Remove old listeners
    const newRoastBtn = roastBtn.cloneNode(true);
    roastBtn.parentNode.replaceChild(newRoastBtn, roastBtn);
    
    newRoastBtn.addEventListener('click', () => {
      console.log('🔥 Roast button clicked!');
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          console.log('📡 Sending roast message to tab:', tabs[0].url);
          
          if (tabs[0].url.startsWith('chrome://')) {
            showFunOutput('❌ Cannot run on Chrome pages. Visit a website!');
            return;
          }
          
          chrome.tabs.sendMessage(tabs[0].id, { action: 'showRoast' }, (response) => {
            console.log('📨 Roast response:', response);
            
            if (chrome.runtime.lastError) {
              console.error('❌ Error:', chrome.runtime.lastError.message);
              if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
                showFunOutput('⚠️ Please refresh the page first, then try again!');
              } else {
                showFunOutput('❌ Error: ' + chrome.runtime.lastError.message);
              }
            } else if (response && response.success) {
              showFunOutput('🔥 Privacy Report opened! Check the page.');
            } else {
              showFunOutput('⚠️ No response. Refresh the page and try again.');
            }
          });
        }
      });
    });
  } else {
    console.warn('⚠️ Roast button not found');
  }
  
  // Weather button
  const weatherBtn = document.getElementById('weatherReportBtn');
  if (weatherBtn) {
    console.log('✅ Found weather button');
    
    // Remove old listeners
    const newWeatherBtn = weatherBtn.cloneNode(true);
    weatherBtn.parentNode.replaceChild(newWeatherBtn, weatherBtn);
    
    newWeatherBtn.addEventListener('click', () => {
      console.log('🌤️ Weather button clicked!');
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          console.log('📡 Sending weather message to tab:', tabs[0].url);
          
          if (tabs[0].url.startsWith('chrome://')) {
            showFunOutput('❌ Cannot run on Chrome pages. Visit a website!');
            return;
          }
          
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getWeatherReport' }, (response) => {
            console.log('📨 Weather response:', response);
            
            if (chrome.runtime.lastError) {
              console.error('❌ Error:', chrome.runtime.lastError.message);
              if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
                showFunOutput('⚠️ Please refresh the page first, then try again!');
              } else {
                showFunOutput('❌ Error: ' + chrome.runtime.lastError.message);
              }
            } else if (response && response.success) {
              showFunOutput('🌤️ Privacy Report opened! Check the page.');
            } else {
              showFunOutput('⚠️ No response. Refresh the page and try again.');
            }
          });
        }
      });
    });
  } else {
    console.warn('⚠️ Weather button not found');
  }
  
  // Cookie banner button
  const bannerBtn = document.getElementById('showBannerBtn');
  if (bannerBtn) {
    console.log('✅ Found banner button');
    
    // Remove old listeners
    const newBannerBtn = bannerBtn.cloneNode(true);
    bannerBtn.parentNode.replaceChild(newBannerBtn, bannerBtn);
    
    newBannerBtn.addEventListener('click', () => {
      console.log('🍪 Banner button clicked!');
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          console.log('📡 Sending banner message to tab:', tabs[0].url);
          
          if (tabs[0].url.startsWith('chrome://')) {
            showFunOutput('❌ Cannot run on Chrome pages. Visit a website!');
            return;
          }
          
          chrome.tabs.sendMessage(tabs[0].id, { action: 'showCookieBanner' }, (response) => {
            console.log('📨 Banner response:', response);
            
            if (chrome.runtime.lastError) {
              console.error('❌ Error:', chrome.runtime.lastError.message);
              if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
                showFunOutput('⚠️ Please refresh the page first, then try again!');
              } else {
                showFunOutput('❌ Error: ' + chrome.runtime.lastError.message);
              }
            } else {
              showFunOutput('🍪 Cookie banner triggered! Check the page.');
            }
          });
        }
      });
    });
  } else {
    console.warn('⚠️ Banner button not found');
  }
}

function setupCookieCleaningButtons() {
  console.log('🧹 Setting up cookie cleaning buttons...');
  
  // Use event delegation on the parent container instead
  const privacyTab = document.getElementById('privacy-tab');
  if (!privacyTab) {
    console.error('❌ Privacy tab not found');
    return;
  }
  
  // Remove any existing click handler
  privacyTab.onclick = null;
  
  // Add single click handler for all buttons
  privacyTab.addEventListener('click', (e) => {
    const target = e.target;
    console.log('🎯 Clicked element:', target.id, target.tagName);
    
    // Check which button was clicked
    if (target.id === 'cleanAllCookiesBtn') {
      console.log('🔴 Clean All Cookies clicked!');
      e.preventDefault();
      cleanCookies('ALL_COOKIES');
    } else if (target.id === 'cleanTrackingCookiesBtn') {
      console.log('🎯 Clean Tracking Cookies clicked!');
      e.preventDefault();
      cleanCookies('TRACKING_COOKIES');
    } else if (target.id === 'cleanThirdPartyBtn') {
      console.log('🌐 Clean Third Party clicked!');
      e.preventDefault();
      cleanCookies('THIRD_PARTY');
    } else if (target.id === 'cleanLocalStorageBtn') {
      console.log('📦 Clean Local Storage clicked!');
      e.preventDefault();
      cleanStorage('LOCAL_STORAGE');
    } else if (target.id === 'cleanSessionStorageBtn') {
      console.log('⏱️ Clean Session Storage clicked!');
      e.preventDefault();
      cleanStorage('SESSION_STORAGE');
    } else if (target.id === 'showCookieListBtn') {
      console.log('👁️ Show Cookies clicked!');
      e.preventDefault();
      showCookieList();
    } else if (target.id === 'showRoastBtn') {
      console.log('🔥 Roast clicked!');
      e.preventDefault();
      handleRoastClick();
    } else if (target.id === 'weatherReportBtn') {
      console.log('🌤️ Weather clicked!');
      e.preventDefault();
      handleWeatherClick();
    } else if (target.id === 'showBannerBtn') {
      console.log('🍪 Banner clicked!');
      e.preventDefault();
      handleBannerClick();
    }
  });
  
  console.log('✅ Cookie cleaning buttons setup complete');
}

// Fun feature button handlers
function handleRoastClick() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      if (tabs[0].url.startsWith('chrome://')) {
        showFunOutput('❌ Cannot run on Chrome pages. Visit a website!');
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { action: 'showRoast' }, (response) => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
            showFunOutput('⚠️ Please refresh the page first, then try again!');
          } else {
            showFunOutput('❌ Error: ' + chrome.runtime.lastError.message);
          }
        } else if (response && response.success) {
          showFunOutput('🔥 Privacy Report opened! Check the page.');
        }
      });
    }
  });
}

function handleWeatherClick() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      if (tabs[0].url.startsWith('chrome://')) {
        showFunOutput('❌ Cannot run on Chrome pages. Visit a website!');
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getWeatherReport' }, (response) => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
            showFunOutput('⚠️ Please refresh the page first, then try again!');
          } else {
            showFunOutput('❌ Error: ' + chrome.runtime.lastError.message);
          }
        } else if (response && response.success) {
          showFunOutput('🌤️ Privacy Report opened! Check the page.');
        }
      });
    }
  });
}

function handleBannerClick() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      if (tabs[0].url.startsWith('chrome://')) {
        showFunOutput('❌ Cannot run on Chrome pages. Visit a website!');
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { action: 'showCookieBanner' }, (response) => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
            showFunOutput('⚠️ Please refresh the page first, then try again!');
          } else {
            showFunOutput('❌ Error: ' + chrome.runtime.lastError.message);
          }
        } else {
          showFunOutput('🍪 Cookie banner triggered! Check the page.');
        }
      });
    }
  });
}

function cleanCookies(cleanType) {
  console.log('[Privacy Suite] Starting cookie cleaning:', cleanType);
  showCleaningResult('⏳ Cleaning cookies...');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      console.error('[Privacy Suite] No active tab found');
      showCleaningResult('❌ No active tab found', 'error');
      return;
    }
    
    console.log('[Privacy Suite] Found tab:', tabs[0].url);
    
    // Try direct cookie deletion from popup
    if (cleanType === 'ALL_COOKIES') {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      
      chrome.cookies.getAll({}, (allCookies) => {
        let deleted = 0;
        let failed = 0;
        const details = [];
        
        allCookies.forEach(cookie => {
          const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
          
          if (domain === cookieDomain || 
              domain.endsWith('.' + cookieDomain) || 
              cookieDomain.endsWith('.' + domain) ||
              cookie.domain === '.' + domain) {
            
            const protocol = cookie.secure ? 'https' : 'http';
            const cookieUrl = `${protocol}://${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;
            
            chrome.cookies.remove({
              url: cookieUrl,
              name: cookie.name
            }, (removedCookie) => {
              if (removedCookie) {
                deleted++;
                details.push(cookie.name);
                console.log('✅ Deleted:', cookie.name);
              } else {
                failed++;
                console.error('❌ Failed to delete:', cookie.name);
              }
              
              // Check if we're done
              if (deleted + failed === allCookies.filter(c => {
                const cd = c.domain.startsWith('.') ? c.domain.substring(1) : c.domain;
                return domain === cd || domain.endsWith('.' + cd) || cd.endsWith('.' + domain) || c.domain === '.' + domain;
              }).length) {
                // All done
                showCleaningResult(`🗑️ Removed ${deleted} cookies${failed > 0 ? ` (${failed} failed)` : ''}\n${details.slice(0, 5).join(', ')}`, 'success');
                
                // Show notification
                if (deleted > 0) {
                  chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'showCookieCleanNotification',
                    title: '🍪 Cookies Cleaned!',
                    message: `Successfully deleted ${deleted} cookies`,
                    count: deleted,
                    details: details
                  });
                }
              }
            });
          }
        });
        
        // If no cookies to delete
        const matchingCookies = allCookies.filter(c => {
          const cd = c.domain.startsWith('.') ? c.domain.substring(1) : c.domain;
          return domain === cd || domain.endsWith('.' + cd) || cd.endsWith('.' + domain) || c.domain === '.' + domain;
        });
        
        if (matchingCookies.length === 0) {
          showCleaningResult('🍪 No cookies found for this domain', 'info');
        }
      });
      
      return; // Don't send to background
    }
    
    // For other types, still use background
    chrome.runtime.sendMessage({
      type: 'CLEAN_SPECIFIC_COOKIES',
      cleanType: cleanType,
      tab: tabs[0]
    }, (response) => {
      console.log('[Privacy Suite] Response:', response);
      
      if (chrome.runtime.lastError) {
        console.error('[Privacy Suite] Error:', chrome.runtime.lastError);
        showCleaningResult('❌ Error: ' + chrome.runtime.lastError.message, 'error');
        return;
      }
      
      if (response && response.success) {
          const results = response.results;
          let message = '';
          let popupTitle = '';
          let popupMessage = '';
          
          switch(cleanType) {
            case 'ALL_COOKIES':
              message = `🗑️ Removed ${results.cleaned} cookies\n`;
              popupTitle = '🍪 Cookies Cleaned!';
              popupMessage = `Successfully deleted ${results.cleaned} cookies from ${tabs[0].url}`;
              if (results.details && results.details.length > 0) {
                message += `Cookies: ${results.details.slice(0, 5).join(', ')}`;
                if (results.details.length > 5) {
                  message += ` and ${results.details.length - 5} more...`;
                }
              }
              break;
            case 'TRACKING_COOKIES':
              message = `🎯 Removed ${results.cleaned} tracking cookies\n`;
              popupTitle = '🎯 Tracking Cookies Removed!';
              popupMessage = `Deleted ${results.cleaned} tracking cookies`;
              if (results.details && results.details.length > 0) {
                message += `Including: ${results.details.slice(0, 5).join(', ')}`;
                popupMessage += `: ${results.details.slice(0, 3).join(', ')}`;
              }
              break;
            case 'THIRD_PARTY':
              message = `🌐 Removed ${results.cleaned} third-party cookies`;
              popupTitle = '🌐 Third-Party Cookies Cleaned!';
              popupMessage = `Removed ${results.cleaned} third-party cookies`;
              break;
          }
          
          showCleaningResult(message || '✅ Cleaning complete!', 'success');
          loadPrivacyStats();
          
          // Show popup notification on the page
          if (results.cleaned > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'showCookieCleanNotification',
              title: popupTitle,
              message: popupMessage,
              count: results.cleaned,
              details: results.details
            });
          }
        } else {
          showCleaningResult('❌ Failed: ' + (response?.error || 'Unknown error'), 'error');
        }
      });
    }
  });
}

function cleanStorage(storageType) {
  showCleaningResult('⏳ Cleaning storage...');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: storageType === 'LOCAL_STORAGE' ? 'CLEAR_LOCAL_STORAGE' : 'CLEAR_SESSION_STORAGE'
      }, (response) => {
        if (chrome.runtime.lastError) {
          showCleaningResult('❌ Error: Visit a regular webpage first', 'error');
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
  console.log('📋 showCookieList called');
  showCleaningResult('📋 Loading cookies...');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      console.error('No active tab');
      showCleaningResult('❌ No active tab', 'error');
      return;
    }
    
    const url = new URL(tabs[0].url);
    const domain = url.hostname;
    
    console.log('[Show Cookies] Domain:', domain);
    
    // Get ALL cookies and filter properly
    chrome.cookies.getAll({}, (allCookies) => {
      console.log('[Show Cookies] Total cookies:', allCookies.length);
      
      const domainCookies = allCookies.filter(cookie => {
          // Match cookies for this domain and its parent domains
          const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
          const matches = domain === cookieDomain || 
                          domain.endsWith('.' + cookieDomain) || 
                          cookieDomain.endsWith('.' + domain) ||
                          cookie.domain === '.' + domain;
          
          if (matches) {
            console.log('[Show Cookies] Matched:', cookie.name, 'from', cookie.domain);
          }
          return matches;
        });
        
        if (domainCookies.length === 0) {
          showCleaningResult('🍪 No cookies found for this domain', 'info');
        } else {
          let message = `🍪 Found ${domainCookies.length} cookies for ${domain}:\n\n`;
          domainCookies.forEach((cookie, index) => {
            if (index < 15) {
              const isSecure = cookie.secure ? '🔒' : '🔓';
              const isHttpOnly = cookie.httpOnly ? '🛡️' : '';
              message += `${isSecure} ${cookie.name} (${cookie.domain})\n`;
            }
          });
          if (domainCookies.length > 15) {
            message += `\n... and ${domainCookies.length - 15} more`;
          }
          showCleaningResult(message, 'info');
        }
      });
    }
  });
}

function showCleaningResult(message, type = 'info') {
  console.log('📝 showCleaningResult called:', type, message.substring(0, 50));
  
  const resultsDiv = document.getElementById('cleaningResults');
  const contentDiv = document.getElementById('cleaningResultsContent');
  
  if (resultsDiv && contentDiv) {
    resultsDiv.style.display = 'block';
    resultsDiv.style.border = '2px solid #667eea';
    resultsDiv.style.padding = '10px';
    resultsDiv.style.marginTop = '10px';
    
    const colors = {
      success: '#dcfce7',
      error: '#fee2e2',
      info: '#f0f9ff',
      warning: '#fef3c7'
    };
    
    resultsDiv.style.background = colors[type] || colors.info;
    contentDiv.innerHTML = `<pre style="margin: 0; font-family: monospace; font-size: 11px; white-space: pre-wrap;">${message}</pre>`;
    
    // Don't auto-hide for info messages (cookie lists)
    if (type === 'success') {
      setTimeout(() => {
        resultsDiv.style.display = 'none';
      }, 5000);
    }
  } else {
    console.error('❌ Results div not found!', resultsDiv, contentDiv);
  }
}

function showFunOutput(text) {
  console.log('💬 Showing output:', text);
  
  const output = document.getElementById('funOutput');
  if (output) {
    output.textContent = text;
    output.style.display = 'block';
    output.style.backgroundColor = text.includes('❌') ? '#fee2e2' : '#f8f9fa';
    output.style.color = text.includes('❌') ? '#991b1b' : '#333';
    
    // Hide after 5 seconds
    setTimeout(() => {
      output.style.display = 'none';
    }, 5000);
  } else {
    console.warn('⚠️ Fun output element not found');
  }
}

function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
    console.log(`✏️ Updated ${id}: ${value}`);
  } else {
    console.warn(`⚠️ Element not found: ${id}`);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  console.log('⏳ Waiting for DOM...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded, initializing...');
    // Wait a bit for other scripts to set up tabs
    setTimeout(() => {
      initPrivacySuite();
      // Also setup a global click handler as backup
      setupGlobalClickHandler();
    }, 100);
  });
} else {
  console.log('✅ DOM already loaded, initializing...');
  // Wait a bit for other scripts to set up tabs
  setTimeout(() => {
    initPrivacySuite();
    // Also setup a global click handler as backup
    setupGlobalClickHandler();
  }, 100);
}

// Global click handler that always works
function setupGlobalClickHandler() {
  console.log('🚀 Setting up global click handler...');
  
  document.addEventListener('click', (e) => {
    console.log('🖱️ Click detected on:', e.target.tagName, e.target.id, e.target.className);
    
    const target = e.target;
    
    // Only handle buttons in privacy tab
    const privacyTab = target.closest('#privacy-tab');
    if (!privacyTab) {
      console.log('❌ Not in privacy tab, ignoring');
      return;
    }
    
    console.log('🔍 Global handler - clicked in privacy tab:', target.id);
    
    if (target.id === 'showCookieListBtn') {
      console.log('👁️ Show Cookies clicked (global)!');
      e.preventDefault();
      e.stopPropagation();
      showCookieList();
    } else if (target.id === 'cleanAllCookiesBtn') {
      console.log('🔴 Clean All clicked (global)!');
      e.preventDefault();
      e.stopPropagation();
      cleanCookies('ALL_COOKIES');
    } else if (target.id === 'cleanTrackingCookiesBtn') {
      console.log('🎯 Clean Tracking clicked (global)!');
      e.preventDefault();
      e.stopPropagation();
      cleanCookies('TRACKING_COOKIES');
    } else if (target.id === 'cleanThirdPartyBtn') {
      console.log('🌐 Clean Third Party clicked (global)!');
      e.preventDefault();
      e.stopPropagation();
      cleanCookies('THIRD_PARTY');
    } else if (target.id === 'cleanLocalStorageBtn') {
      console.log('📦 Clean Local Storage clicked (global)!');
      e.preventDefault();
      e.stopPropagation();
      cleanStorage('LOCAL_STORAGE');
    } else if (target.id === 'cleanSessionStorageBtn') {
      console.log('⏱️ Clean Session Storage clicked (global)!');
      e.preventDefault();
      e.stopPropagation();
      cleanStorage('SESSION_STORAGE');
    }
  });
}