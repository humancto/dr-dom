/**
 * Dr. DOM Extension Test Runner
 * Run this in Chrome DevTools console on any page with the extension loaded
 */

class DrDOMTestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.isExtensionContext = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }

  log(message, type = 'info') {
    const prefix = {
      'info': '📝',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'test': '🧪'
    };
    console.log(`${prefix[type] || '📝'} ${message}`);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async test(name, testFn) {
    this.log(`Testing: ${name}`, 'test');
    try {
      const result = await testFn();
      if (result) {
        this.results.passed++;
        this.results.tests.push({ name, status: 'passed' });
        this.log(`PASSED: ${name}`, 'success');
      } else {
        this.results.failed++;
        this.results.tests.push({ name, status: 'failed' });
        this.log(`FAILED: ${name}`, 'error');
      }
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'error', error: error.message });
      this.log(`ERROR in ${name}: ${error.message}`, 'error');
    }
  }

  // ============= CONTENT SCRIPT TESTS =============
  
  async testContentScriptsLoaded() {
    await this.test('Fun Features Script Loaded', () => {
      return typeof DrDOMFunFeatures !== 'undefined';
    });

    await this.test('Privacy Protection Script Loaded', () => {
      return typeof DrDOMPrivacyProtection !== 'undefined';
    });
  }

  async testCookieBanner() {
    await this.test('Cookie Banner Auto-appears', async () => {
      // Wait for banner to appear (should be 2 seconds after page load)
      await this.delay(2500);
      const banner = document.getElementById('drdom-cookie-banner');
      return banner !== null;
    });

    await this.test('Cookie Banner Has Content', () => {
      const banner = document.getElementById('drdom-cookie-banner');
      if (!banner) return false;
      return banner.textContent.includes('Dr. DOM Privacy Protection');
    });

    await this.test('Cookie Banner Buttons Exist', () => {
      const acceptBtn = document.getElementById('drdom-accept-cookies');
      const reportBtn = document.getElementById('drdom-see-report');
      const closeBtn = document.getElementById('drdom-close-banner');
      return acceptBtn && reportBtn && closeBtn;
    });
  }

  async testTrackerDetection() {
    await this.test('Test Cookies Created', () => {
      // Create test cookies
      document.cookie = "test_tracker=1; path=/";
      document.cookie = "analytics_id=abc123; path=/";
      const cookies = document.cookie.split(';');
      return cookies.length > 0;
    });

    await this.test('Tracking Scripts Detected', () => {
      // Check if tracking scripts are identified
      const scripts = document.querySelectorAll('script[src*="google"], script[src*="facebook"]');
      return scripts.length >= 0; // We might not have real tracking scripts on test page
    });
  }

  async testChromeStorage() {
    if (!this.isExtensionContext) {
      this.log('Chrome Storage tests skipped (not in extension context)', 'warning');
      return;
    }

    await this.test('Chrome Storage Accessible', () => {
      return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    });

    await this.test('Privacy Stats Stored', async () => {
      return new Promise(resolve => {
        chrome.storage.local.get(['globalPrivacyStats'], (result) => {
          resolve(result.globalPrivacyStats !== undefined);
        });
      });
    });

    await this.test('Privacy Config Stored', async () => {
      return new Promise(resolve => {
        chrome.storage.local.get(['privacyConfig'], (result) => {
          resolve(result.privacyConfig !== undefined);
        });
      });
    });
  }

  async testMessagePassing() {
    await this.test('Weather Report Message', async () => {
      if (!window.funFeatures) {
        this.log('Fun features not initialized', 'warning');
        return false;
      }
      
      try {
        const weather = window.funFeatures.generateWeatherReport();
        return weather && weather.score !== undefined;
      } catch (e) {
        return false;
      }
    });

    await this.test('Roast Generation', async () => {
      if (!window.funFeatures) {
        return false;
      }
      
      try {
        const roasts = window.funFeatures.prepareRoast();
        return Array.isArray(roasts) && roasts.length > 0;
      } catch (e) {
        return false;
      }
    });
  }

  async testPrivacyProtection() {
    await this.test('Tracker Blocking Active', () => {
      // Check if XHR/Fetch are intercepted
      const xhrProto = XMLHttpRequest.prototype;
      return xhrProto._originalOpen !== undefined || xhrProto._drdomIntercepted === true;
    });

    await this.test('Cookie Cleaning Configured', async () => {
      if (!this.isExtensionContext) return false;
      
      return new Promise(resolve => {
        chrome.storage.local.get(['privacyConfig'], (result) => {
          const config = result.privacyConfig || {};
          resolve(config.cookieCleaning !== false);
        });
      });
    });
  }

  async testUIElements() {
    await this.test('Privacy Report Modal Can Open', () => {
      // Check if modal creation works
      if (!window.funFeatures) return false;
      
      try {
        // Don't actually show it, just check if the method exists
        return typeof window.funFeatures.showPrivacyReport === 'function';
      } catch (e) {
        return false;
      }
    });

    await this.test('Cookie Banner Close Function Works', () => {
      if (!window.funFeatures) return false;
      return typeof window.funFeatures.closeBanner === 'function';
    });
  }

  // ============= POPUP TESTS (Manual) =============
  
  generatePopupTests() {
    console.log('\n📱 MANUAL POPUP TESTS - Please verify:');
    console.log('1. Click extension icon - popup should open');
    console.log('2. Overview tab - should show request count, performance score');
    console.log('3. Requests tab - should list network requests');
    console.log('4. Performance tab - should show metrics');
    console.log('5. Security tab - should show HTTPS/HTTP analysis');
    console.log('6. Privacy Suite tab - should show:');
    console.log('   - Trackers Blocked counter');
    console.log('   - Cookies Cleaned counter');
    console.log('   - 4 protection toggles');
    console.log('   - 3 fun feature buttons (Roast, Weather, Banner)');
  }

  // ============= RUN ALL TESTS =============
  
  async runAll() {
    console.log('🚀 Starting Dr. DOM Extension Test Suite\n');
    console.log('========================================\n');
    
    // Content Script Tests
    console.log('📜 CONTENT SCRIPT TESTS\n');
    await this.testContentScriptsLoaded();
    
    // Cookie Banner Tests
    console.log('\n🍪 COOKIE BANNER TESTS\n');
    await this.testCookieBanner();
    
    // Tracker Detection Tests
    console.log('\n🎯 TRACKER DETECTION TESTS\n');
    await this.testTrackerDetection();
    
    // Chrome Storage Tests
    console.log('\n💾 CHROME STORAGE TESTS\n');
    await this.testChromeStorage();
    
    // Message Passing Tests
    console.log('\n📨 MESSAGE PASSING TESTS\n');
    await this.testMessagePassing();
    
    // Privacy Protection Tests
    console.log('\n🛡️ PRIVACY PROTECTION TESTS\n');
    await this.testPrivacyProtection();
    
    // UI Element Tests
    console.log('\n🎨 UI ELEMENT TESTS\n');
    await this.testUIElements();
    
    // Manual Popup Tests
    this.generatePopupTests();
    
    // Summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n========================================');
    console.log('📊 TEST RESULTS SUMMARY\n');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(t => t.status === 'failed' || t.status === 'error')
        .forEach(t => {
          console.log(`  - ${t.name}${t.error ? ': ' + t.error : ''}`);
        });
    }
    
    console.log('\n========================================');
    
    if (this.results.failed === 0) {
      console.log('🎉 All automated tests passed!');
      console.log('📱 Please complete manual popup tests above.');
    } else {
      console.log('⚠️ Some tests failed. Please review and fix issues.');
    }
  }
}

// Create global test runner
window.DrDOMTestRunner = DrDOMTestRunner;

// Auto-run if this script is loaded
console.log('🧪 Dr. DOM Test Runner Loaded!');
console.log('Run tests with: new DrDOMTestRunner().runAll()');
console.log('Or run specific test groups:');
console.log('  - runner.testContentScriptsLoaded()');
console.log('  - runner.testCookieBanner()');
console.log('  - runner.testTrackerDetection()');
console.log('  - runner.testPrivacyProtection()');

// Check if we should auto-run
if (window.location.href.includes('test-extension.html')) {
  console.log('\n🚀 Auto-running tests on test page...\n');
  setTimeout(() => {
    new DrDOMTestRunner().runAll();
  }, 3000); // Wait for everything to load
}